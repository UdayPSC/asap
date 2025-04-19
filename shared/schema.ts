import { pgTable, text, serial, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const userRoleEnum = pgEnum('user_role', ['customer', 'owner']);
export const paymentMethodEnum = pgEnum('payment_method', ['cod', 'online']);
export const orderStatusEnum = pgEnum('order_status', ['pending', 'delivered']);

// Users Table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  address: text("address"),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: userRoleEnum("role").notNull().default('customer'),
});

export const insertUserSchema = createInsertSchema(users).pick({
  name: true,
  email: true,
  phone: true,
  address: true,
  username: true,
  password: true,
  role: true,
});

// Orders Table
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull().references(() => users.id),
  quantity: integer("quantity").notNull(),
  amount: integer("amount").notNull(),
  address: text("address").notNull(),
  paymentMethod: paymentMethodEnum("payment_method").notNull(),
  paymentId: text("payment_id"),
  status: orderStatusEnum("status").default('pending').notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertOrderSchema = createInsertSchema(orders).pick({
  customerId: true,
  quantity: true,
  amount: true,
  address: true,
  paymentMethod: true,
  paymentId: true,
});

// Shop Settings Table
export const shopSettings = pgTable("shop_settings", {
  id: serial("id").primaryKey(),
  canePrice: integer("cane_price").notNull(),
  deliveryFee: integer("delivery_fee").default(0),
  minOrderQuantity: integer("min_order_quantity").default(1),
  isOpen: boolean("is_open").default(true),
  // Morning shift
  morningShiftEnabled: boolean("morning_shift_enabled").default(true),
  morningShiftStart: text("morning_shift_start").default("08:00"),
  morningShiftEnd: text("morning_shift_end").default("12:00"),
  // Afternoon shift
  afternoonShiftEnabled: boolean("afternoon_shift_enabled").default(true),
  afternoonShiftStart: text("afternoon_shift_start").default("14:00"),
  afternoonShiftEnd: text("afternoon_shift_end").default("18:00"),
  // Legacy fields kept for compatibility
  openingTime: text("opening_time").default("08:00"),
  closingTime: text("closing_time").default("18:00"),
  workingDays: text("working_days").array().default(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]),
  // Message to show when shop is closed
  closedMessage: text("closed_message").default("We're sorry, but the shop is currently closed for deliveries. Your order will be processed when we reopen."),
});

export const insertShopSettingsSchema = createInsertSchema(shopSettings).pick({
  canePrice: true,
  deliveryFee: true,
  minOrderQuantity: true,
  isOpen: true,
  morningShiftEnabled: true,
  morningShiftStart: true,
  morningShiftEnd: true,
  afternoonShiftEnabled: true,
  afternoonShiftStart: true,
  afternoonShiftEnd: true,
  openingTime: true,
  closingTime: true,
  workingDays: true,
  closedMessage: true,
});

// Feedback Table
export const feedback = pgTable("feedback", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertFeedbackSchema = createInsertSchema(feedback).pick({
  email: true,
  message: true,
});

// Export Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type ShopSettings = typeof shopSettings.$inferSelect;
export type InsertShopSettings = z.infer<typeof insertShopSettingsSchema>;

export type Feedback = typeof feedback.$inferSelect;
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;
