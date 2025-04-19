import { User, InsertUser, Order, InsertOrder, ShopSettings, Feedback, InsertFeedback } from "@shared/schema";
import session from "express-session";

// Interface for storage methods
export interface IStorage {
  // User related methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  
  // Order related methods
  getOrder(id: number): Promise<Order | undefined>;
  getOrdersByCustomerId(customerId: number): Promise<Order[]>;
  getPendingOrders(): Promise<(Order & { customer?: { name: string, phone: string, email: string } })[]>;
  getCompletedOrders(): Promise<(Order & { customer?: { name: string, phone: string, email: string } })[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: 'pending' | 'delivered'): Promise<Order | undefined>;
  
  // Shop settings related methods
  getShopSettings(): Promise<ShopSettings | undefined>;
  updateShopSettings(settings: Partial<ShopSettings>): Promise<ShopSettings | undefined>;
  
  // Feedback related methods
  createFeedback(feedback: InsertFeedback): Promise<Feedback>;
  
  // Session store
  sessionStore: any;
}

// Import and use the DatabaseStorage implementation
import { DatabaseStorage } from './database-storage';

// Create an instance of DatabaseStorage to use throughout the application
export const storage = new DatabaseStorage();

// Note: This will automatically create an admin user during initialization
// and set up the session store using PostgreSQL
