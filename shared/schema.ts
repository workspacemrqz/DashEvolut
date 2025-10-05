import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, real, timestamp, boolean, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  company: text("company"),
  phone: text("phone"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});


export const clients = pgTable("clients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  company: text("company").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  source: text("source").notNull(), // acquisition source
  sector: text("sector").notNull(),
  nps: real("nps"), // Net Promoter Score
  upsellPotential: text("upsell_potential", { enum: ["low", "medium", "high"] }).default("medium"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  clientId: varchar("client_id").references(() => clients.id).notNull(),
  status: text("status", { 
    enum: ["discovery", "development", "delivery", "post_sale", "completed", "cancelled"] 
  }).notNull().default("discovery"),
  value: real("value").notNull(),
  startDate: timestamp("start_date").notNull(),
  dueDate: timestamp("due_date").notNull(),
  isRecurring: boolean("is_recurring").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});


export const interactions = pgTable("interactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: varchar("client_id").references(() => clients.id).notNull(),
  type: text("type", { enum: ["email", "call", "meeting", "whatsapp", "proposal"] }).notNull(),
  subject: text("subject").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const analytics = pgTable("analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: timestamp("date").notNull(),
  mrr: real("mrr").default(0), // Monthly Recurring Revenue
  churnRate: real("churn_rate").default(0),
  avgLifetimeValue: real("avg_lifetime_value").default(0),
  activeProjects: integer("active_projects").default(0),
  totalRevenue: real("total_revenue").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const alerts = pgTable("alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type", { enum: ["project_delayed", "payment_pending", "upsell_opportunity", "subscription_due", "subscription_overdue"] }).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  entityId: varchar("entity_id").notNull(), // project_id, client_id, or subscription_id
  entityType: text("entity_type", { enum: ["project", "client", "subscription"] }).notNull(),
  priority: text("priority", { enum: ["low", "medium", "high", "critical"] }).default("medium"),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const notificationRules = pgTable("notification_rules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  condition: json("condition").$type<{
    type: string;
    field: string;
    operator: string;
    value: any;
    entityType: string;
  }>().notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const subscriptions = pgTable("subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: varchar("client_id").references(() => clients.id).notNull(),
  billingDay: integer("billing_day").notNull(), // 1-31
  amount: real("amount").notNull(),
  notes: text("notes"),
  status: text("status", { enum: ["active", "paused", "cancelled"] }).notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const subscriptionServices = pgTable("subscription_services", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  subscriptionId: varchar("subscription_id").references(() => subscriptions.id).notNull(),
  description: text("description").notNull(),
  isCompleted: boolean("is_completed").default(false),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  subscriptionId: varchar("subscription_id").references(() => subscriptions.id).notNull(),
  amount: real("amount").notNull(),
  paymentDate: timestamp("payment_date").notNull(),
  referenceMonth: integer("reference_month").notNull(), // 1-12
  referenceYear: integer("reference_year").notNull(),
  receiptFileId: varchar("receipt_file_id"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const paymentFiles = pgTable("payment_files", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  filePath: text("file_path").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const projectCosts = pgTable("project_costs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").references(() => projects.id).notNull(),
  description: text("description").notNull(),
  amount: real("amount").notNull(),
  category: text("category"), // optional categorization
  costDate: timestamp("cost_date").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const replitUnits = pgTable("replit_units", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  valor: real("valor").notNull(),
  email: text("email").notNull(),
  nome: text("nome", { enum: ["Camargo", "Marquez"] }).notNull(),
  dataHorario: text("data_horario").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users, {
  id: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateUserProfileSchema = insertUserSchema.partial();



export const insertClientSchema = createInsertSchema(clients, {
  id: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateClientSchema = insertClientSchema.partial();

export const insertProjectSchema = createInsertSchema(projects, {
  id: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});


export const insertInteractionSchema = createInsertSchema(interactions, {
  id: z.string().optional(),
  createdAt: z.date().optional(),
}).omit({
  id: true,
  createdAt: true,
});

export const insertAnalyticsSchema = createInsertSchema(analytics, {
  id: z.string().optional(),
  createdAt: z.date().optional(),
}).omit({
  id: true,
  createdAt: true,
});

export const insertAlertSchema = createInsertSchema(alerts, {
  id: z.string().optional(),
  createdAt: z.date().optional(),
}).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationRuleSchema = createInsertSchema(notificationRules, {
  id: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateNotificationRuleSchema = insertNotificationRuleSchema.partial();

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSubscriptionServiceSchema = createInsertSchema(subscriptionServices).omit({
  id: true,
  createdAt: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
});

export const insertPaymentFileSchema = createInsertSchema(paymentFiles).omit({
  id: true,
  createdAt: true,
});

export const insertProjectCostSchema = createInsertSchema(projectCosts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateProjectCostSchema = createInsertSchema(projectCosts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).partial();

export const insertReplitUnitSchema = createInsertSchema(replitUnits).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateReplitUnitSchema = insertReplitUnitSchema.partial();

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpdateUserProfile = z.infer<typeof updateUserProfileSchema>;


export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;
export type UpdateClient = z.infer<typeof updateClientSchema>;

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;


export type Interaction = typeof interactions.$inferSelect;
export type InsertInteraction = z.infer<typeof insertInteractionSchema>;

export type Analytics = typeof analytics.$inferSelect;
export type InsertAnalytics = z.infer<typeof insertAnalyticsSchema>;

export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = z.infer<typeof insertAlertSchema>;

export type NotificationRule = typeof notificationRules.$inferSelect;
export type InsertNotificationRule = z.infer<typeof insertNotificationRuleSchema>;
export type UpdateNotificationRule = z.infer<typeof updateNotificationRuleSchema>;

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;

export type SubscriptionService = typeof subscriptionServices.$inferSelect;
export type InsertSubscriptionService = z.infer<typeof insertSubscriptionServiceSchema>;

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;

export type PaymentFile = typeof paymentFiles.$inferSelect;
export type InsertPaymentFile = z.infer<typeof insertPaymentFileSchema>;

export type ProjectCost = typeof projectCosts.$inferSelect;
export type InsertProjectCost = z.infer<typeof insertProjectCostSchema>;
export type UpdateProjectCost = z.infer<typeof updateProjectCostSchema>;

export type ReplitUnit = typeof replitUnits.$inferSelect;
export type InsertReplitUnit = z.infer<typeof insertReplitUnitSchema>;
export type UpdateReplitUnit = z.infer<typeof updateReplitUnitSchema>;

// Derived types for API responses
export type ProjectWithClient = Project & {
  client: Client;
};

export type ClientWithStats = Client & {
  projectCount: number;
  totalValue: number;
  lastInteraction?: Interaction;
  hasActiveSubscription?: boolean;
};

export type SubscriptionWithClient = Subscription & {
  client: Client;
  services: SubscriptionService[];
  lastPayment?: Payment;
  nextBillingDate: Date;
};

export type PaymentWithFile = Payment & {
  file?: PaymentFile;
};

export type SubscriptionWithDetails = Subscription & {
  client: Client;
  services: SubscriptionService[];
  payments: PaymentWithFile[];
  nextBillingDate: Date;
};
