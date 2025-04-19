import { pool } from "../server/db";

async function updateSchema() {
  try {
    console.log('Connecting to database...');
    
    // Update shop_settings table to add new columns for shifts
    await pool.query(`
      ALTER TABLE shop_settings ADD COLUMN IF NOT EXISTS morning_shift_enabled BOOLEAN DEFAULT TRUE;
      ALTER TABLE shop_settings ADD COLUMN IF NOT EXISTS morning_shift_start TEXT DEFAULT '08:00';
      ALTER TABLE shop_settings ADD COLUMN IF NOT EXISTS morning_shift_end TEXT DEFAULT '12:00';
      ALTER TABLE shop_settings ADD COLUMN IF NOT EXISTS afternoon_shift_enabled BOOLEAN DEFAULT TRUE;
      ALTER TABLE shop_settings ADD COLUMN IF NOT EXISTS afternoon_shift_start TEXT DEFAULT '14:00';
      ALTER TABLE shop_settings ADD COLUMN IF NOT EXISTS afternoon_shift_end TEXT DEFAULT '18:00';
      ALTER TABLE shop_settings ADD COLUMN IF NOT EXISTS closed_message TEXT DEFAULT 'We''re sorry, but the shop is currently closed for deliveries. Your order will be processed when we reopen.';
    `);
    
    console.log('Successfully updated schema!');
    
  } catch (error) {
    console.error('Error updating schema:', error);
  } finally {
    console.log('Closing database connection...');
    await pool.end();
  }
}

updateSchema();