import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
import { 
  updateUserProfileSchema, 
  insertClientSchema,
  updateClientSchema,
  insertProjectSchema, 
  insertInteractionSchema,
  insertSubscriptionSchema,
  insertSubscriptionServiceSchema,
  insertPaymentSchema,
  insertPaymentFileSchema,
  insertNotificationRuleSchema,
  updateNotificationRuleSchema,
  insertProjectCostSchema,
  updateProjectCostSchema
} from "@shared/schema";
import { z } from "zod";

// Extend session types
declare module 'express-session' {
  interface SessionData {
    userId?: string;
    isAuthenticated?: boolean;
  }
}

// Authentication middleware
function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (req.session.isAuthenticated) {
    next();
  } else {
    res.status(401).json({ message: "Authentication required" });
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication endpoints (NOT protected by requireAuth middleware)
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (username === process.env.LOGIN && password === process.env.SENHA) {
        req.session.isAuthenticated = true;
        req.session.userId = "admin";
        res.json({ 
          success: true, 
          message: "Login successful",
          user: { id: "admin", username: "Evolut" }
        });
      } else {
        res.status(401).json({ success: false, message: "Invalid credentials" });
      }
    } catch (error) {
      res.status(500).json({ success: false, message: "Login failed" });
    }
  });

  app.post("/api/auth/logout", async (req, res) => {
    try {
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ success: false, message: "Logout failed" });
        }
        res.clearCookie('evolutia.sid');
        res.json({ success: true, message: "Logout successful" });
      });
    } catch (error) {
      res.status(500).json({ success: false, message: "Logout failed" });
    }
  });

  app.get("/api/auth/status", async (req, res) => {
    try {
      if (req.session.isAuthenticated) {
        res.json({ 
          isAuthenticated: true, 
          user: { id: req.session.userId, username: "Evolut" }
        });
      } else {
        res.json({ isAuthenticated: false });
      }
    } catch (error) {
      res.status(500).json({ isAuthenticated: false });
    }
  });

  // Setup file upload storage
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const upload = multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, uploadsDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
      }
    }),
    fileFilter: (req, file, cb) => {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'image/webp'];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(null, false);
      }
    },
    limits: {
      fileSize: 10 * 1024 * 1024 // 10MB limit
    }
  });

  // Apply authentication middleware to all API routes except auth endpoints
  app.use('/api', (req, res, next) => {
    if (req.path.startsWith('/auth/')) {
      next();
    } else {
      requireAuth(req, res, next);
    }
  });

  // User routes
  app.get("/api/user/profile", async (req, res) => {
    try {
      // For now, we'll use the first user as the current user
      // In a real app, this would come from session/authentication
      const storageUsers = (storage as any).users as Map<string, any>;
      const users = Array.from(storageUsers.values());
      const user = users[0];
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user profile" });
    }
  });

  app.patch("/api/user/profile", async (req, res) => {
    try {
      const validatedData = updateUserProfileSchema.parse(req.body);
      // For now, we'll use the first user as the current user
      const storageUsers = (storage as any).users as Map<string, any>;
      const users = Array.from(storageUsers.values());
      const currentUser = users[0];
      if (!currentUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const updatedUser = await storage.updateUserProfile(currentUser.id, validatedData);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(updatedUser);
    } catch (error) {
      res.status(400).json({ message: "Invalid profile data" });
    }
  });



  // Analytics routes
  app.get("/api/analytics", async (req, res) => {
    try {
      const analytics = await storage.getLatestAnalytics();
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Clients routes
  app.get("/api/clients", async (req, res) => {
    try {
      const clients = await storage.getClientsWithStats();
      res.json(clients);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch clients" });
    }
  });

  app.get("/api/clients/:id", async (req, res) => {
    try {
      const client = await storage.getClient(req.params.id);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.json(client);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch client" });
    }
  });

  app.post("/api/clients", async (req, res) => {
    try {
      console.log('Received request body:', JSON.stringify(req.body, null, 2));
      const validatedData = insertClientSchema.parse(req.body);
      console.log('Validated data:', JSON.stringify(validatedData, null, 2));
      const client = await storage.createClient(validatedData);
      console.log('Created client:', JSON.stringify(client, null, 2));
      res.status(201).json(client);
    } catch (error) {
      console.error('Error details:', error);
      if (error.issues) {
        console.error('Validation issues:', error.issues);
      }
      res.status(400).json({ message: "Invalid client data", error: error.message });
    }
  });

  app.patch("/api/clients/:id", async (req, res) => {
    try {
      const updates = updateClientSchema.parse(req.body);
      const client = await storage.updateClient(req.params.id, updates);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.json(client);
    } catch (error) {
      res.status(400).json({ message: "Invalid update data" });
    }
  });

  app.delete("/api/clients/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteClient(req.params.id);
      if (!deleted) {
        return res.status(400).json({ 
          message: "Não foi possível remover o cliente. Cliente não encontrado ou erro durante a remoção." 
        });
      }
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting client:', error);
      res.status(500).json({ message: "Erro interno do servidor ao remover cliente" });
    }
  });

  // Projects routes
  app.get("/api/projects", async (req, res) => {
    try {
      const projects = await storage.getProjectsWithClients();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.get("/api/projects/:id", async (req, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  app.get("/api/clients/:clientId/projects", async (req, res) => {
    try {
      const projects = await storage.getProjectsByClient(req.params.clientId);
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch client projects" });
    }
  });

  app.post("/api/projects", async (req, res) => {
    try {
      // Create a schema that accepts string dates and transforms them
      const projectSchemaWithStringDates = insertProjectSchema.extend({
        startDate: z.string().transform((val) => new Date(val)),
        dueDate: z.string().transform((val) => new Date(val)),
        clientId: z.string().min(1, "Cliente é obrigatório"),
      });
      const validatedData = projectSchemaWithStringDates.parse(req.body);
      const project = await storage.createProject(validatedData);
      res.status(201).json(project);
    } catch (error) {
      res.status(400).json({ message: "Invalid project data" });
    }
  });

  app.patch("/api/projects/:id", async (req, res) => {
    try {
      const updates = insertProjectSchema.partial().parse(req.body);
      const project = await storage.updateProject(req.params.id, updates);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      res.status(400).json({ message: "Invalid update data" });
    }
  });

  app.delete("/api/projects/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteProject(req.params.id);
      if (!deleted) {
        return res.status(400).json({ 
          message: "Cannot delete project." 
        });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete project" });
    }
  });

  // Project Costs routes
  app.get("/api/projects/:projectId/costs", async (req, res) => {
    try {
      const costs = await storage.getProjectCosts(req.params.projectId);
      res.json(costs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch project costs" });
    }
  });

  app.post("/api/projects/:projectId/costs", async (req, res) => {
    try {
      const costSchemaWithStringDate = insertProjectCostSchema.extend({
        costDate: z.string().transform((val) => new Date(val)),
        projectId: z.string().default(req.params.projectId),
      });
      const validatedData = costSchemaWithStringDate.parse({
        ...req.body,
        projectId: req.params.projectId
      });
      const cost = await storage.createProjectCost(validatedData);
      res.status(201).json(cost);
    } catch (error) {
      console.error("Error creating project cost:", error);
      res.status(400).json({ message: "Invalid cost data" });
    }
  });

  app.patch("/api/projects/:projectId/costs/:costId", async (req, res) => {
    try {
      const updates = updateProjectCostSchema.parse(req.body);
      const cost = await storage.updateProjectCost(req.params.costId, updates);
      if (!cost) {
        return res.status(404).json({ message: "Cost not found" });
      }
      res.json(cost);
    } catch (error) {
      res.status(400).json({ message: "Invalid cost update data" });
    }
  });

  app.delete("/api/projects/:projectId/costs/:costId", async (req, res) => {
    try {
      const deleted = await storage.deleteProjectCost(req.params.costId);
      if (!deleted) {
        return res.status(404).json({ message: "Cost not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete cost" });
    }
  });

  // Interactions routes
  app.get("/api/interactions", async (req, res) => {
    try {
      const interactions = await storage.getInteractions();
      res.json(interactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch interactions" });
    }
  });

  app.get("/api/clients/:clientId/interactions", async (req, res) => {
    try {
      const interactions = await storage.getInteractionsByClient(req.params.clientId);
      res.json(interactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch client interactions" });
    }
  });

  app.post("/api/interactions", async (req, res) => {
    try {
      const validatedData = insertInteractionSchema.parse(req.body);
      const interaction = await storage.createInteraction(validatedData);
      res.status(201).json(interaction);
    } catch (error) {
      res.status(400).json({ message: "Invalid interaction data" });
    }
  });

  // Alerts routes
  app.get("/api/alerts", async (req, res) => {
    try {
      const alerts = await storage.getAlerts();
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch alerts" });
    }
  });

  app.get("/api/alerts/unread", async (req, res) => {
    try {
      const alerts = await storage.getUnreadAlerts();
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch unread alerts" });
    }
  });

  app.patch("/api/alerts/:id/read", async (req, res) => {
    try {
      const alert = await storage.markAlertAsRead(req.params.id);
      if (!alert) {
        return res.status(404).json({ message: "Alert not found" });
      }
      res.json(alert);
    } catch (error) {
      res.status(500).json({ message: "Failed to mark alert as read" });
    }
  });

  app.post("/api/alerts/:id/read", async (req, res) => {
    try {
      const alert = await storage.markAlertAsRead(req.params.id);
      if (!alert) {
        return res.status(404).json({ message: "Alert not found" });
      }
      res.json(alert);
    } catch (error) {
      res.status(500).json({ message: "Failed to mark alert as read" });
    }
  });

  // Notification Rules routes
  app.get("/api/notification-rules", async (req, res) => {
    try {
      const rules = await storage.getNotificationRules();
      res.json(rules);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notification rules" });
    }
  });

  app.get("/api/notification-rules/active", async (req, res) => {
    try {
      const rules = await storage.getActiveNotificationRules();
      res.json(rules);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch active notification rules" });
    }
  });

  app.get("/api/notification-rules/:id", async (req, res) => {
    try {
      const rule = await storage.getNotificationRule(req.params.id);
      if (!rule) {
        return res.status(404).json({ message: "Notification rule not found" });
      }
      res.json(rule);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notification rule" });
    }
  });

  app.post("/api/notification-rules", async (req, res) => {
    try {
      const validatedData = insertNotificationRuleSchema.parse(req.body);
      const rule = await storage.createNotificationRule(validatedData);
      res.status(201).json(rule);
    } catch (error) {
      res.status(400).json({ message: "Invalid notification rule data" });
    }
  });

  app.put("/api/notification-rules/:id", async (req, res) => {
    try {
      const validatedData = updateNotificationRuleSchema.parse(req.body);
      const rule = await storage.updateNotificationRule(req.params.id, validatedData);
      if (!rule) {
        return res.status(404).json({ message: "Notification rule not found" });
      }
      res.json(rule);
    } catch (error) {
      res.status(400).json({ message: "Invalid notification rule data" });
    }
  });

  app.delete("/api/notification-rules/:id", async (req, res) => {
    try {
      const success = await storage.deleteNotificationRule(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Notification rule not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete notification rule" });
    }
  });

  // Subscription routes
  app.get("/api/subscriptions", async (req, res) => {
    try {
      console.log('🌐 [API] GET /api/subscriptions called');
      const subscriptions = await storage.getSubscriptionsWithClients();
      console.log('🌐 [API] Returning subscriptions:', subscriptions.length, 'items');
      res.json(subscriptions);
    } catch (error) {
      console.error('🌐 [API] Error fetching subscriptions:', error);
      res.status(500).json({ message: "Failed to fetch subscriptions" });
    }
  });

  app.get("/api/subscriptions/:id", async (req, res) => {
    try {
      const subscription = await storage.getSubscription(req.params.id);
      if (!subscription) {
        return res.status(404).json({ message: "Subscription not found" });
      }
      res.json(subscription);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch subscription" });
    }
  });

  app.post("/api/subscriptions", async (req, res) => {
    try {
      const validatedData = insertSubscriptionSchema.parse(req.body);
      const subscription = await storage.createSubscription(validatedData);
      res.status(201).json(subscription);
    } catch (error) {
      res.status(400).json({ message: "Invalid subscription data" });
    }
  });

  app.patch("/api/subscriptions/:id", async (req, res) => {
    try {
      const updates = insertSubscriptionSchema.partial().parse(req.body);
      const subscription = await storage.updateSubscription(req.params.id, updates);
      if (!subscription) {
        return res.status(404).json({ message: "Subscription not found" });
      }
      res.json(subscription);
    } catch (error) {
      res.status(400).json({ message: "Invalid update data" });
    }
  });

  app.delete("/api/subscriptions/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteSubscription(req.params.id);
      if (!deleted) {
        return res.status(400).json({ 
          message: "Cannot delete subscription. Subscription has associated services or payments." 
        });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete subscription" });
    }
  });

  // Subscription Services routes
  app.get("/api/subscriptions/:id/services", async (req, res) => {
    try {
      const services = await storage.getSubscriptionServices(req.params.id);
      res.json(services);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch services" });
    }
  });

  app.post("/api/subscriptions/:id/services", async (req, res) => {
    try {
      const validatedData = insertSubscriptionServiceSchema.parse({
        ...req.body,
        subscriptionId: req.params.id
      });
      const service = await storage.createSubscriptionService(validatedData);
      res.status(201).json(service);
    } catch (error) {
      res.status(400).json({ message: "Invalid service data" });
    }
  });

  app.patch("/api/subscription-services/:id", async (req, res) => {
    try {
      const updates = insertSubscriptionServiceSchema.partial().parse(req.body);
      const service = await storage.updateSubscriptionService(req.params.id, updates);
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
      res.json(service);
    } catch (error) {
      res.status(400).json({ message: "Invalid update data" });
    }
  });

  app.delete("/api/subscription-services/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteSubscriptionService(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Service not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete service" });
    }
  });

  // Payment routes
  app.get("/api/subscriptions/:id/payments", async (req, res) => {
    try {
      const payments = await storage.getPaymentsBySubscription(req.params.id);
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });

  app.post("/api/subscriptions/:id/payments", upload.single('receipt'), async (req, res) => {
    try {
      let fileId = null;
      
      if (req.file) {
        const paymentFile = await storage.createPaymentFile({
          filename: req.file.filename,
          originalName: req.file.originalname,
          mimeType: req.file.mimetype,
          size: req.file.size,
          filePath: req.file.path
        });
        fileId = paymentFile.id;
      }

      const validatedData = insertPaymentSchema.parse({
        ...req.body,
        subscriptionId: req.params.id,
        receiptFileId: fileId,
        amount: parseFloat(req.body.amount),
        referenceMonth: parseInt(req.body.referenceMonth),
        referenceYear: parseInt(req.body.referenceYear),
        paymentDate: new Date(req.body.paymentDate)
      });

      const payment = await storage.createPayment(validatedData);
      res.status(201).json(payment);
    } catch (error) {
      res.status(400).json({ message: "Invalid payment data" });
    }
  });

  // File download route
  app.get("/api/files/:id", async (req, res) => {
    try {
      const file = await storage.getPaymentFile(req.params.id);
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }
      
      if (!fs.existsSync(file.filePath)) {
        return res.status(404).json({ message: "File not found on disk" });
      }

      res.setHeader('Content-Type', file.mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
      res.sendFile(path.resolve(file.filePath));
    } catch (error) {
      res.status(500).json({ message: "Failed to download file" });
    }
  });

  // Proposals routes - Connect to PostgreSQL database for proposals
  app.get("/api/proposals", async (req, res) => {
    try {
      const { Pool } = await import('pg');
      
      // Database connection for proposals
      const pool = new Pool({
        connectionString: process.env.DatabaseLandingPage || 'postgres://mrqz:@Workspacen8n@easypanel.evolutionmanagerevolutia.space:5433/evolutia?sslmode=disable'
      });

      const client = await pool.connect();
      
      try {
        const result = await client.query(`
          SELECT id, p1_titulo, senha, url 
          FROM propostas 
          ORDER BY id DESC
        `);
        
        // Transform the data to include the full link with URL from database
        const proposals = result.rows.map(row => ({
          id: row.id,
          titulo: row.p1_titulo,
          codigo: row.senha,
          link: `https://evolutiaoficial.com/proposta/${row.url}`
        }));
        
        res.json(proposals);
      } finally {
        client.release();
      }
      
      await pool.end();
    } catch (error) {
      console.error('Error fetching proposals:', error);
      res.status(500).json({ message: "Failed to fetch proposals" });
    }
  });

  // Get single proposal for editing
  app.get("/api/proposals/:id", async (req, res) => {
    try {
      const { Pool } = await import('pg');
      
      const pool = new Pool({
        connectionString: process.env.DatabaseLandingPage || 'postgres://mrqz:@Workspacen8n@easypanel.evolutionmanagerevolutia.space:5433/evolutia?sslmode=disable'
      });

      const client = await pool.connect();
      
      try {
        const result = await client.query(`
          SELECT * FROM propostas WHERE id = $1
        `, [req.params.id]);
        
        if (result.rows.length === 0) {
          return res.status(404).json({ message: "Proposal not found" });
        }
        
        res.json(result.rows[0]);
      } finally {
        client.release();
      }
      
      await pool.end();
    } catch (error) {
      console.error('Error fetching proposal:', error);
      res.status(500).json({ message: "Failed to fetch proposal" });
    }
  });

  // Update proposal
  app.put("/api/proposals/:id", async (req, res) => {
    try {
      const { Pool } = await import('pg');
      
      const pool = new Pool({
        connectionString: process.env.DatabaseLandingPage || 'postgres://mrqz:@Workspacen8n@easypanel.evolutionmanagerevolutia.space:5433/evolutia?sslmode=disable'
      });

      const client = await pool.connect();
      
      try {
        const {
          p1_titulo,
          p1_subtitulo,
          p1_tags,
          p2_subtitulo,
          p2_texto,
          p2_objetivos,
          p2_diferenciais,
          p3_titulo_da_entrega,
          p3_checklist,
          p4_preco,
          p4_entrega,
          p4_detalhamento
        } = req.body;

        const result = await client.query(`
          UPDATE propostas SET
            p1_titulo = $1,
            p1_subtitulo = $2,
            p1_tags = $3,
            p2_subtitulo = $4,
            p2_texto = $5,
            p2_objetivos = $6,
            p2_diferenciais = $7,
            p3_titulo_da_entrega = $8,
            p3_checklist = $9,
            p4_preco = $10,
            p4_entrega = $11,
            p4_detalhamento = $12
          WHERE id = $13
          RETURNING *
        `, [
          p1_titulo,
          p1_subtitulo,
          p1_tags,
          p2_subtitulo,
          p2_texto,
          p2_objetivos,
          p2_diferenciais,
          p3_titulo_da_entrega,
          p3_checklist,
          p4_preco,
          p4_entrega,
          p4_detalhamento,
          req.params.id
        ]);
        
        if (result.rows.length === 0) {
          return res.status(404).json({ message: "Proposal not found" });
        }
        
        res.json(result.rows[0]);
      } finally {
        client.release();
      }
      
      await pool.end();
    } catch (error) {
      console.error('Error updating proposal:', error);
      res.status(500).json({ message: "Failed to update proposal" });
    }
  });

  // Create new proposal manually
  app.post("/api/proposals", async (req, res) => {
    try {
      const { Pool } = await import('pg');
      
      const pool = new Pool({
        connectionString: process.env.DatabaseLandingPage || 'postgres://mrqz:@Workspacen8n@easypanel.evolutionmanagerevolutia.space:5433/evolutia?sslmode=disable'
      });

      const client = await pool.connect();
      
      try {
        const {
          p1_titulo = 'Nova Proposta',
          p1_subtitulo = 'Subtítulo da proposta',
          p1_tags = '[]',
          p2_subtitulo = 'Descrição do projeto',
          p2_texto = 'Texto descritivo do projeto',
          p2_objetivos = '[]',
          p2_diferenciais = '[]',
          p3_titulo_da_entrega = 'Entregáveis',
          p3_checklist = '[]',
          p4_preco = 'R$ 0,00',
          p4_entrega = '30 dias',
          p4_detalhamento = '[]'
        } = req.body;

        // Generate random password and URL
        const senha = Math.random().toString(36).substring(2, 15);
        const url = Math.random().toString(36).substring(2, 15);

        const result = await client.query(`
          INSERT INTO propostas (
            p1_titulo, p1_subtitulo, p1_tags, p2_subtitulo, p2_texto,
            p2_objetivos, p2_diferenciais, p3_titulo_da_entrega, p3_checklist,
            p4_preco, p4_entrega, p4_detalhamento, senha, url, audio
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
          RETURNING *
        `, [
          p1_titulo, p1_subtitulo, p1_tags, p2_subtitulo, p2_texto,
          p2_objetivos, p2_diferenciais, p3_titulo_da_entrega, p3_checklist,
          p4_preco, p4_entrega, p4_detalhamento, senha, url, ''
        ]);
        
        res.json(result.rows[0]);
      } finally {
        client.release();
      }
      
      await pool.end();
    } catch (error) {
      console.error('Error creating proposal:', error);
      res.status(500).json({ message: "Failed to create proposal" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
