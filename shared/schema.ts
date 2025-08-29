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

export const userSettings = pgTable("user_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  notifications: json("notifications").$type<{
    email: boolean;
    push: boolean;
    projectUpdates: boolean;
    clientMessages: boolean;
    deadlineAlerts: boolean;
    weeklyReports: boolean;
  }>().default({
    email: true,
    push: true,
    projectUpdates: true,
    clientMessages: true,
    deadlineAlerts: true,
    weeklyReports: false,
  }),
  uiSettings: json("ui_settings").$type<{
    theme: string;
    language: string;
    dateFormat: string;
    currency: string;
    autoSave: boolean;
  }>().default({
    theme: "dark",
    language: "pt-BR",
    dateFormat: "DD/MM/YYYY",
    currency: "BRL",
    autoSave: true,
  }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const clients = pgTable("clients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  company: text("company").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  status: text("status", { enum: ["active", "inactive", "prospect"] }).notNull().default("prospect"),
  source: text("source").notNull(), // acquisition source
  sector: text("sector").notNull(),
  nps: real("nps"), // Net Promoter Score
  ltv: real("ltv").default(0), // Lifetime Value
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
  estimatedHours: integer("estimated_hours").notNull(),
  workedHours: integer("worked_hours").default(0),
  profitMargin: real("profit_margin").default(0),
  progress: integer("progress").default(0), // percentage
  startDate: timestamp("start_date").notNull(),
  dueDate: timestamp("due_date").notNull(),
  isRecurring: boolean("is_recurring").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const milestones = pgTable("milestones", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").references(() => projects.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: timestamp("due_date").notNull(),
  isCompleted: boolean("is_completed").default(false),
  requiresClientApproval: boolean("requires_client_approval").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
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
  type: text("type", { enum: ["project_delayed", "payment_pending", "upsell_opportunity", "milestone_due"] }).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  entityId: varchar("entity_id").notNull(), // project_id or client_id
  entityType: text("entity_type", { enum: ["project", "client"] }).notNull(),
  priority: text("priority", { enum: ["low", "medium", "high", "critical"] }).default("medium"),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateUserProfileSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).partial();


export const insertUserSettingsSchema = createInsertSchema(userSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateUserSettingsSchema = createInsertSchema(userSettings).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
}).partial();

export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMilestoneSchema = createInsertSchema(milestones).omit({
  id: true,
  createdAt: true,
});

export const insertInteractionSchema = createInsertSchema(interactions).omit({
  id: true,
  createdAt: true,
});

export const insertAnalyticsSchema = createInsertSchema(analytics).omit({
  id: true,
  createdAt: true,
});

export const insertAlertSchema = createInsertSchema(alerts).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpdateUserProfile = z.infer<typeof updateUserProfileSchema>;

export type UserSettings = typeof userSettings.$inferSelect;
export type InsertUserSettings = z.infer<typeof insertUserSettingsSchema>;
export type UpdateUserSettings = z.infer<typeof updateUserSettingsSchema>;

export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type Milestone = typeof milestones.$inferSelect;
export type InsertMilestone = z.infer<typeof insertMilestoneSchema>;

export type Interaction = typeof interactions.$inferSelect;
export type InsertInteraction = z.infer<typeof insertInteractionSchema>;

export type Analytics = typeof analytics.$inferSelect;
export type InsertAnalytics = z.infer<typeof insertAnalyticsSchema>;

export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = z.infer<typeof insertAlertSchema>;

// Derived types for API responses
export type ProjectWithClient = Project & {
  client: Client;
};

export type ClientWithStats = Client & {
  projectCount: number;
  totalValue: number;
  lastInteraction?: Interaction;
};
