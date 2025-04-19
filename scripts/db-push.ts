import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';
import * as schema from '../shared/schema';

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString('hex')}.${salt}`;
}

async function main() {
  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  console.log('Connecting to the database...');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });

  console.log('Creating database tables...');
  
  // Create the tables
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phone TEXT NOT NULL,
      address TEXT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('customer', 'owner'))
    );

    CREATE TABLE IF NOT EXISTS shop_settings (
      id SERIAL PRIMARY KEY,
      cane_price DECIMAL NOT NULL,
      delivery_fee DECIMAL NOT NULL,
      min_order_quantity INTEGER NOT NULL,
      is_open BOOLEAN NOT NULL,
      opening_time TEXT NOT NULL,
      closing_time TEXT NOT NULL,
      working_days TEXT[] NOT NULL
    );

    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      address TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('pending', 'delivered')),
      customer_id INTEGER NOT NULL REFERENCES users(id),
      quantity INTEGER NOT NULL,
      amount DECIMAL NOT NULL,
      payment_method TEXT NOT NULL CHECK (payment_method IN ('cod', 'online')),
      payment_id TEXT,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS feedback (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    );
  `);

  // Check if there's at least one owner user, if not create one
  const ownerResult = await pool.query(
    "SELECT COUNT(*) FROM users WHERE role = 'owner'"
  );
  const ownersCount = parseInt(ownerResult.rows[0].count);

  if (ownersCount === 0) {
    console.log('Creating admin user...');
    
    // Create an admin user
    await pool.query(
      "INSERT INTO users (name, email, phone, username, password, role) VALUES ($1, $2, $3, $4, $5, $6)",
      ['Admin', 'admin@asapcane.com', '1234567890', 'admin', await hashPassword('admin123'), 'owner']
    );

    console.log('Admin user created!');
    console.log('Username: admin');
    console.log('Password: admin123');
  }

  // Check if shop settings exist, if not create default settings
  const settingsResult = await pool.query(
    "SELECT COUNT(*) FROM shop_settings"
  );
  const settingsCount = parseInt(settingsResult.rows[0].count);
  
  if (settingsCount === 0) {
    console.log('Creating default shop settings...');
    
    await pool.query(
      "INSERT INTO shop_settings (id, cane_price, delivery_fee, min_order_quantity, is_open, opening_time, closing_time, working_days) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
      [1, 50, 0, 1, true, '09:00', '18:00', ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']]
    );

    console.log('Default shop settings created!');
  }

  await pool.end();
  console.log('Database setup completed successfully!');
}

main()
  .catch((err) => {
    console.error('Error setting up the database:', err);
    process.exit(1);
  });