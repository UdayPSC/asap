import { db, pool } from "./db";
import { users, User, InsertUser, orders, Order, InsertOrder, shopSettings, ShopSettings, feedback, Feedback, InsertFeedback } from "@shared/schema";
import { eq, desc, asc } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { IStorage } from "./storage";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

const PostgresSessionStore = connectPg(session);

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
    
    // Initialize database schema and tables
    this.initializeDatabase();
  }

  private async initializeDatabase() {
    try {
      // First check if we need to recreate tables 
      // By checking if tables already exist
      const tablesResult = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'users'
        )`);
      
      const tablesExist = tablesResult.rows[0].exists;
      
      if (tablesExist) {
        console.log('Database tables already exist');
      } else {
        console.log('Creating all database tables');
        
        // Create tables if they don't exist
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
          
          -- Create session table for authentication
          CREATE TABLE IF NOT EXISTS "session" (
            "sid" varchar NOT NULL COLLATE "default",
            "sess" json NOT NULL,
            "expire" timestamp(6) NOT NULL,
            CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
          );
          
          CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");
        `);
        
        console.log('Successfully created database tables');
      }

      // Initialize shop settings
      await this.initializeShopSettings();
      
      // Create an owner user if none exists
      await this.initializeAdminUser();
      
    } catch (error) {
      console.error('Error initializing database:', error);
    }
  }
  
  private async initializeAdminUser() {
    try {
      // Check if owner user exists
      const ownerResult = await pool.query(
        "SELECT COUNT(*) FROM users WHERE role = 'owner'"
      );
      const ownersCount = parseInt(ownerResult.rows[0].count);
      
      if (ownersCount === 0) {
        console.log('Creating owner user with your details...');
        
        // Import crypto functions
        const { randomBytes, scrypt } = await import('crypto');
        const { promisify } = await import('util');
        const scryptAsync = promisify(scrypt);
        
        // Create owner user with provided details
        const salt = randomBytes(16).toString('hex');
        const buf = (await scryptAsync('@apsc*6394#', salt, 64)) as Buffer;
        const hashedPassword = `${buf.toString('hex')}.${salt}`;
        
        await pool.query(
          "INSERT INTO users (name, email, phone, username, password, role) VALUES ($1, $2, $3, $4, $5, $6)",
          ['Akshay Pratap Singh', 'akshaypratapsingh12345@gmail.com', '1234567890', 'akshay', hashedPassword, 'owner']
        );
        
        console.log('Owner user created!');
        console.log('Username: akshay');
        console.log('Password: @apsc*6394#');
      }
    } catch (error) {
      console.error('Error initializing owner user:', error);
    }
  }

  private async initializeShopSettings() {
    const existingSettings = await this.getShopSettings();
    
    if (!existingSettings) {
      await db.insert(shopSettings).values({
        id: 1,
        canePrice: 50,
        deliveryFee: 0,
        minOrderQuantity: 1,
        isOpen: true,
        openingTime: "09:00",
        closingTime: "18:00",
        workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
      });
    }
  }

  // User related methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Ensure address is null if undefined
    const address = insertUser.address === undefined ? null : insertUser.address;
    // Ensure role is set if undefined
    const role = insertUser.role || "customer";
    
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        address,
        role,
      })
      .returning();
      
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    
    return user;
  }
  
  // Order related methods
  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }
  
  async getOrdersByCustomerId(customerId: number): Promise<Order[]> {
    return await db
      .select()
      .from(orders)
      .where(eq(orders.customerId, customerId))
      .orderBy(desc(orders.createdAt));
  }
  
  async getPendingOrders(): Promise<(Order & { customer?: { name: string, phone: string, email: string } })[]> {
    // Use pool.query for more advanced query with JOIN
    const result = await pool.query(`
      SELECT o.*, 
        u.name as customer_name, 
        u.phone as customer_phone,
        u.email as customer_email
      FROM orders o
      LEFT JOIN users u ON o.customer_id = u.id
      WHERE o.status = 'pending'
      ORDER BY o.created_at ASC
    `);
    
    // Transform the results to match the expected format
    return result.rows.map(row => ({
      id: row.id,
      customerId: row.customer_id,
      quantity: row.quantity,
      amount: row.amount,
      address: row.address,
      paymentMethod: row.payment_method,
      paymentId: row.payment_id,
      status: row.status,
      createdAt: row.created_at,
      // Add customer information if available
      customer: row.customer_name ? {
        name: row.customer_name,
        phone: row.customer_phone,
        email: row.customer_email
      } : undefined
    }));
  }
  
  async getCompletedOrders(): Promise<(Order & { customer?: { name: string, phone: string, email: string } })[]> {
    // Use pool.query for more advanced query with JOIN
    const result = await pool.query(`
      SELECT o.*, 
        u.name as customer_name, 
        u.phone as customer_phone,
        u.email as customer_email
      FROM orders o
      LEFT JOIN users u ON o.customer_id = u.id
      WHERE o.status = 'delivered'
      ORDER BY o.created_at DESC
    `);
    
    // Transform the results to match the expected format
    return result.rows.map(row => ({
      id: row.id,
      customerId: row.customer_id,
      quantity: row.quantity,
      amount: row.amount,
      address: row.address,
      paymentMethod: row.payment_method,
      paymentId: row.payment_id,
      status: row.status,
      createdAt: row.created_at,
      // Add customer information if available
      customer: row.customer_name ? {
        name: row.customer_name,
        phone: row.customer_phone,
        email: row.customer_email
      } : undefined
    }));
  }
  
  async createOrder(order: InsertOrder): Promise<Order> {
    // Ensure paymentId is null if undefined
    const paymentId = order.paymentId === undefined ? null : order.paymentId;
    
    const [newOrder] = await db
      .insert(orders)
      .values({
        ...order,
        paymentId,
        status: 'pending',
        createdAt: new Date()
      })
      .returning();
      
    return newOrder;
  }
  
  async updateOrderStatus(id: number, status: 'pending' | 'delivered'): Promise<Order | undefined> {
    const [updatedOrder] = await db
      .update(orders)
      .set({ status })
      .where(eq(orders.id, id))
      .returning();
      
    return updatedOrder;
  }
  
  // Shop settings related methods
  async getShopSettings(): Promise<ShopSettings | undefined> {
    const [settings] = await db.select().from(shopSettings).where(eq(shopSettings.id, 1));
    return settings;
  }
  
  async updateShopSettings(settings: Partial<ShopSettings>): Promise<ShopSettings | undefined> {
    const [updatedSettings] = await db
      .update(shopSettings)
      .set(settings)
      .where(eq(shopSettings.id, 1))
      .returning();
      
    return updatedSettings;
  }
  
  // Feedback related methods
  async createFeedback(feedbackData: InsertFeedback): Promise<Feedback> {
    const [newFeedback] = await db
      .insert(feedback)
      .values({
        ...feedbackData,
        createdAt: new Date()
      })
      .returning();
      
    return newFeedback;
  }
}