import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertOrderSchema, insertFeedbackSchema, insertShopSettingsSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes (/api/login, /api/register, /api/logout, /api/user)
  setupAuth(app);

  // Feedback submission - no authentication required
  app.post("/api/feedback", async (req, res, next) => {
    try {
      const data = insertFeedbackSchema.parse(req.body);
      const feedback = await storage.createFeedback(data);
      res.status(201).json(feedback);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      next(error);
    }
  });

  // Customer route to place an order
  app.post("/api/orders", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).send("Authentication required");
      }
      
      if (req.user!.role !== "customer") {
        return res.status(403).send("Only customers can place orders");
      }
      
      const data = insertOrderSchema.parse({
        ...req.body,
        customerId: req.user!.id
      });
      
      const order = await storage.createOrder(data);
      res.status(201).json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      next(error);
    }
  });

  // Get orders for a customer
  app.get("/api/orders/customer", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).send("Authentication required");
      }
      
      if (req.user!.role !== "customer") {
        return res.status(403).send("Only customers can access their orders");
      }
      
      const orders = await storage.getOrdersByCustomerId(req.user!.id);
      res.json(orders);
    } catch (error) {
      next(error);
    }
  });

  // Get all pending orders (owner only)
  app.get("/api/orders/pending", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).send("Authentication required");
      }
      
      if (req.user!.role !== "owner") {
        return res.status(403).send("Access restricted to owner");
      }
      
      const orders = await storage.getPendingOrders();
      res.json(orders);
    } catch (error) {
      next(error);
    }
  });

  // Get all completed orders (owner only)
  app.get("/api/orders/completed", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).send("Authentication required");
      }
      
      if (req.user!.role !== "owner") {
        return res.status(403).send("Access restricted to owner");
      }
      
      const orders = await storage.getCompletedOrders();
      res.json(orders);
    } catch (error) {
      next(error);
    }
  });

  // Update order status (owner only)
  app.patch("/api/orders/:id/status", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).send("Authentication required");
      }
      
      if (req.user!.role !== "owner") {
        return res.status(403).send("Access restricted to owner");
      }
      
      const orderId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (status !== "pending" && status !== "delivered") {
        return res.status(400).send("Invalid status value");
      }
      
      const updatedOrder = await storage.updateOrderStatus(orderId, status);
      
      if (!updatedOrder) {
        return res.status(404).send("Order not found");
      }
      
      res.json(updatedOrder);
    } catch (error) {
      next(error);
    }
  });

  // Get shop settings
  app.get("/api/shop-settings", async (req, res, next) => {
    try {
      const settings = await storage.getShopSettings();
      res.json(settings);
    } catch (error) {
      next(error);
    }
  });

  // Update shop settings (owner only)
  app.patch("/api/shop-settings", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).send("Authentication required");
      }
      
      if (req.user!.role !== "owner") {
        return res.status(403).send("Access restricted to owner");
      }
      
      const updatedSettings = await storage.updateShopSettings(req.body);
      
      if (!updatedSettings) {
        return res.status(404).send("Shop settings not found");
      }
      
      res.json(updatedSettings);
    } catch (error) {
      next(error);
    }
  });

  // Update user profile
  app.patch("/api/profile", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).send("Authentication required");
      }

      // Remove sensitive fields that shouldn't be updated directly
      const { id, role, username, password, ...updateData } = req.body;
      
      const updatedUser = await storage.updateUser(req.user!.id, updateData);
      
      if (!updatedUser) {
        return res.status(404).send("User not found");
      }
      
      res.json({
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        address: updatedUser.address,
        username: updatedUser.username,
        role: updatedUser.role
      });
    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
