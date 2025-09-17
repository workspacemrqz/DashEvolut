import { 
  type User, type InsertUser, type UpdateUserProfile,
  type Client, type InsertClient,
  type Project, type InsertProject, type ProjectWithClient,
  type Interaction, type InsertInteraction,
  type Analytics, type InsertAnalytics,
  type Alert, type InsertAlert,
  type NotificationRule, type InsertNotificationRule, type UpdateNotificationRule,
  type ClientWithStats,
  type Subscription, type InsertSubscription,
  type SubscriptionService, type InsertSubscriptionService,
  type Payment, type InsertPayment,
  type PaymentFile, type InsertPaymentFile,
  type ProjectCost, type InsertProjectCost, type UpdateProjectCost,
  type SubscriptionWithClient, type SubscriptionWithDetails, type PaymentWithFile,
  users, clients, projects, interactions, analytics, alerts, notificationRules, subscriptions, subscriptionServices, payments, paymentFiles, projectCosts
} from "@shared/schema";
import { randomUUID } from "crypto";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { eq, and, desc, sql } from "drizzle-orm";
import type { IStorage } from "./storage";

export class PostgresStorage implements IStorage {
  private db: ReturnType<typeof drizzle>;
  private pool: Pool;

  constructor() {
    // Usar sempre o banco PostgreSQL correto (porta 5502)
    const connectionString = 'postgres://dashevolutia:@Ev0luTi42025@easypanel.evolutionmanagerevolutia.space:5502/dashevolutia?sslmode=disable';
    
    this.pool = new Pool({
      connectionString: connectionString,
    });
    
    this.db = drizzle(this.pool);
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const newUser = { ...user, id: randomUUID(), createdAt: new Date(), updatedAt: new Date() };
    await this.db.insert(users).values(newUser);
    return newUser;
  }

  async updateUserProfile(id: string, updates: UpdateUserProfile): Promise<User | undefined> {
    const updatedUser = { ...updates, updatedAt: new Date() };
    const result = await this.db.update(users).set(updatedUser).where(eq(users.id, id)).returning();
    return result[0];
  }


  // Clients
  async getClients(): Promise<Client[]> {
    return await this.db.select().from(clients).orderBy(desc(clients.createdAt));
  }

  async getClientsWithStats(): Promise<ClientWithStats[]> {
    const clientsData = await this.getClients();
    
    // Get all active subscriptions to determine client status
    const activeSubscriptions = await this.db
      .select({ clientId: subscriptions.clientId })
      .from(subscriptions)
      .where(eq(subscriptions.status, "active"));
    
    const activeClientIds = new Set(activeSubscriptions.map(sub => sub.clientId));
    
    return clientsData.map(client => ({
      ...client,
      projectCount: 0,
      totalValue: 0,
      lastInteraction: undefined,
      hasActiveSubscription: activeClientIds.has(client.id)
    }));
  }

  async getClient(id: string): Promise<Client | undefined> {
    const result = await this.db.select().from(clients).where(eq(clients.id, id)).limit(1);
    return result[0];
  }

  async createClient(client: InsertClient): Promise<Client> {
    const newClient = { ...client, id: randomUUID(), createdAt: new Date(), updatedAt: new Date() };
    await this.db.insert(clients).values(newClient);
    return newClient;
  }

  async updateClient(id: string, client: Partial<InsertClient>): Promise<Client | undefined> {
    const updatedClient = { ...client, updatedAt: new Date() };
    const result = await this.db.update(clients).set(updatedClient).where(eq(clients.id, id)).returning();
    return result[0];
  }

  async deleteClient(id: string): Promise<boolean> {
    try {
      // First, check if client exists
      const client = await this.getClient(id);
      if (!client) {
        return false;
      }

      // Delete related data first (in order of dependencies)
      // 1. Delete payment files related to payments of subscriptions of this client
      await this.db.delete(paymentFiles)
        .where(sql`id IN (
          SELECT pf.id FROM payment_files pf
          JOIN payments p ON pf.id = p.receipt_file_id
          JOIN subscriptions s ON p.subscription_id = s.id
          WHERE s.client_id = ${id}
        )`);

      // 2. Delete payments of subscriptions of this client
      await this.db.delete(payments)
        .where(sql`subscription_id IN (
          SELECT id FROM subscriptions WHERE client_id = ${id}
        )`);

      // 3. Delete subscription services of subscriptions of this client
      await this.db.delete(subscriptionServices)
        .where(sql`subscription_id IN (
          SELECT id FROM subscriptions WHERE client_id = ${id}
        )`);

      // 4. Delete subscriptions of this client
      await this.db.delete(subscriptions).where(eq(subscriptions.clientId, id));


      // 6. Delete projects of this client
      await this.db.delete(projects).where(eq(projects.clientId, id));

      // 7. Delete interactions of this client
      await this.db.delete(interactions).where(eq(interactions.clientId, id));

      // 8. Finally, delete the client
      const result = await this.db.delete(clients).where(eq(clients.id, id));
      return result.rowCount > 0;
    } catch (error) {
      console.error('Error deleting client:', error);
      return false;
    }
  }

  // Projects
  async getProjects(): Promise<Project[]> {
    return await this.db.select().from(projects).orderBy(desc(projects.createdAt));
  }

  async getProjectsWithClients(): Promise<ProjectWithClient[]> {
    const result = await this.db
      .select({
        project: projects,
        client: clients
      })
      .from(projects)
      .leftJoin(clients, eq(projects.clientId, clients.id))
      .orderBy(desc(projects.createdAt));
    
    return result.map(row => ({
      ...row.project,
      client: row.client
    }));
  }

  async getProject(id: string): Promise<Project | undefined> {
    const result = await this.db.select().from(projects).where(eq(projects.id, id)).limit(1);
    return result[0];
  }

  async getProjectsByClient(clientId: string): Promise<Project[]> {
    return await this.db.select().from(projects).where(eq(projects.clientId, clientId)).orderBy(desc(projects.createdAt));
  }

  async createProject(project: InsertProject): Promise<Project> {
    const newProject = { ...project, id: randomUUID(), createdAt: new Date(), updatedAt: new Date() };
    await this.db.insert(projects).values(newProject);
    return newProject;
  }

  async updateProject(id: string, project: Partial<InsertProject>): Promise<Project | undefined> {
    const updatedProject = { ...project, updatedAt: new Date() };
    const result = await this.db.update(projects).set(updatedProject).where(eq(projects.id, id)).returning();
    return result[0];
  }

  async deleteProject(id: string): Promise<boolean> {
    const result = await this.db.delete(projects).where(eq(projects.id, id));
    return result.rowCount > 0;
  }

  // Project Costs
  async getProjectCosts(projectId: string): Promise<ProjectCost[]> {
    return await this.db.select().from(projectCosts).where(eq(projectCosts.projectId, projectId)).orderBy(desc(projectCosts.costDate));
  }

  async getProjectCost(costId: string): Promise<ProjectCost | undefined> {
    const result = await this.db.select().from(projectCosts).where(eq(projectCosts.id, costId)).limit(1);
    return result[0];
  }

  async createProjectCost(cost: InsertProjectCost): Promise<ProjectCost> {
    const newCost = { 
      ...cost, 
      id: randomUUID(), 
      createdAt: new Date(), 
      updatedAt: new Date() 
    };
    const result = await this.db.insert(projectCosts).values(newCost).returning();
    return result[0];
  }

  async updateProjectCost(costId: string, cost: UpdateProjectCost): Promise<ProjectCost | undefined> {
    const updatedCost = { ...cost, updatedAt: new Date() };
    const result = await this.db.update(projectCosts).set(updatedCost).where(eq(projectCosts.id, costId)).returning();
    return result[0];
  }

  async deleteProjectCost(costId: string): Promise<boolean> {
    const result = await this.db.delete(projectCosts).where(eq(projectCosts.id, costId));
    return result.rowCount > 0;
  }

  // Interactions
  async getInteractions(): Promise<Interaction[]> {
    return await this.db.select().from(interactions).orderBy(desc(interactions.createdAt));
  }

  async getInteractionsByClient(clientId: string): Promise<Interaction[]> {
    return await this.db.select().from(interactions).where(eq(interactions.clientId, clientId)).orderBy(desc(interactions.createdAt));
  }

  async getInteraction(id: string): Promise<Interaction | undefined> {
    const result = await this.db.select().from(interactions).where(eq(interactions.id, id)).limit(1);
    return result[0];
  }

  async createInteraction(interaction: InsertInteraction): Promise<Interaction> {
    const newInteraction = { ...interaction, id: randomUUID(), createdAt: new Date() };
    await this.db.insert(interactions).values(newInteraction);
    return newInteraction;
  }

  async updateInteraction(id: string, interaction: Partial<InsertInteraction>): Promise<Interaction | undefined> {
    const result = await this.db.update(interactions).set(interaction).where(eq(interactions.id, id)).returning();
    return result[0];
  }

  async deleteInteraction(id: string): Promise<boolean> {
    const result = await this.db.delete(interactions).where(eq(interactions.id, id));
    return result.rowCount > 0;
  }

  // Analytics
  async getAnalytics(): Promise<Analytics[]> {
    return await this.db.select().from(analytics).orderBy(desc(analytics.date));
  }

  async getAnalyticsByDateRange(startDate: Date, endDate: Date): Promise<Analytics[]> {
    return await this.db
      .select()
      .from(analytics)
      .where(and(
        sql`${analytics.date} >= ${startDate}`,
        sql`${analytics.date} <= ${endDate}`
      ))
      .orderBy(desc(analytics.date));
  }

  async getAnalyticsById(id: string): Promise<Analytics | undefined> {
    const result = await this.db.select().from(analytics).where(eq(analytics.id, id)).limit(1);
    return result[0];
  }

  async createAnalytics(analyticsData: InsertAnalytics): Promise<Analytics> {
    const newAnalytics = { ...analyticsData, id: randomUUID() };
    await this.db.insert(analytics).values(newAnalytics);
    return newAnalytics;
  }

  async updateAnalytics(id: string, analyticsData: Partial<InsertAnalytics>): Promise<Analytics | undefined> {
    const result = await this.db.update(analytics).set(analyticsData).where(eq(analytics.id, id)).returning();
    return result[0];
  }

  async deleteAnalytics(id: string): Promise<boolean> {
    const result = await this.db.delete(analytics).where(eq(analytics.id, id));
    return result.rowCount > 0;
  }

  async getLatestAnalytics(): Promise<Analytics | undefined> {
    const result = await this.db.select().from(analytics).orderBy(desc(analytics.date)).limit(1);
    return result[0];
  }

  // Alerts
  async getAlerts(): Promise<Alert[]> {
    return await this.db.select().from(alerts).orderBy(desc(alerts.createdAt));
  }

  async getUnreadAlerts(): Promise<Alert[]> {
    return await this.db.select().from(alerts).where(eq(alerts.isRead, false)).orderBy(desc(alerts.createdAt));
  }

  async getAlert(id: string): Promise<Alert | undefined> {
    const result = await this.db.select().from(alerts).where(eq(alerts.id, id)).limit(1);
    return result[0];
  }

  async createAlert(alert: InsertAlert): Promise<Alert> {
    const newAlert = { ...alert, id: randomUUID(), createdAt: new Date() };
    await this.db.insert(alerts).values(newAlert);
    return newAlert;
  }

  async updateAlert(id: string, alert: Partial<InsertAlert>): Promise<Alert | undefined> {
    const result = await this.db.update(alerts).set(alert).where(eq(alerts.id, id)).returning();
    return result[0];
  }

  async deleteAlert(id: string): Promise<boolean> {
    const result = await this.db.delete(alerts).where(eq(alerts.id, id));
    return result.rowCount > 0;
  }

  async markAlertAsRead(id: string): Promise<Alert | undefined> {
    const result = await this.db.update(alerts).set({ isRead: true }).where(eq(alerts.id, id)).returning();
    return result[0];
  }

  // Notification Rules
  async getNotificationRules(): Promise<NotificationRule[]> {
    return await this.db.select().from(notificationRules).orderBy(desc(notificationRules.createdAt));
  }

  async getActiveNotificationRules(): Promise<NotificationRule[]> {
    return await this.db.select().from(notificationRules).where(eq(notificationRules.isActive, true)).orderBy(desc(notificationRules.createdAt));
  }

  async getNotificationRule(id: string): Promise<NotificationRule | undefined> {
    const result = await this.db.select().from(notificationRules).where(eq(notificationRules.id, id)).limit(1);
    return result[0];
  }

  async createNotificationRule(rule: InsertNotificationRule): Promise<NotificationRule> {
    const result = await this.db.insert(notificationRules).values({
      ...rule,
      id: randomUUID(),
      updatedAt: new Date(),
    }).returning();
    return result[0];
  }

  async updateNotificationRule(id: string, rule: UpdateNotificationRule): Promise<NotificationRule | undefined> {
    const result = await this.db.update(notificationRules).set({
      ...rule,
      updatedAt: new Date(),
    }).where(eq(notificationRules.id, id)).returning();
    return result[0];
  }

  async deleteNotificationRule(id: string): Promise<boolean> {
    const result = await this.db.delete(notificationRules).where(eq(notificationRules.id, id));
    return result.rowCount > 0;
  }

  // Subscriptions
  async getSubscriptions(): Promise<Subscription[]> {
    return await this.db.select().from(subscriptions).orderBy(desc(subscriptions.createdAt));
  }

  async getSubscriptionsWithClients(): Promise<SubscriptionWithClient[]> {
    console.log('🔍 [DEBUG] Starting getSubscriptionsWithClients...');
    
    const result = await this.db
      .select({
        subscription: subscriptions,
        client: clients
      })
      .from(subscriptions)
      .innerJoin(clients, eq(subscriptions.clientId, clients.id))
      .orderBy(desc(subscriptions.createdAt));
    
    console.log('🔍 [DEBUG] Raw query result:', JSON.stringify(result, null, 2));
    
    // Get services for each subscription
    const subscriptionsWithServices = await Promise.all(
      result.map(async (row) => {
        console.log(`🔍 [DEBUG] Processing subscription ${row.subscription.id}:`);
        console.log(`  - clientId: ${row.subscription.clientId}`);
        console.log(`  - client: ${row.client ? JSON.stringify(row.client) : 'NULL'}`);
        
        const services = await this.getSubscriptionServicesBySubscription(row.subscription.id);
        console.log(`  - services count: ${services.length}`);
        
        // Calculate next billing date
        const now = new Date();
        const nextBillingDate = new Date(now.getFullYear(), now.getMonth(), row.subscription.billingDay);
        if (nextBillingDate <= now) {
          nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
        }
        console.log(`  - nextBillingDate: ${nextBillingDate.toISOString()}`);
        
        const finalResult = {
          ...row.subscription,
          client: row.client,
          services,
          nextBillingDate
        };
        
        console.log(`  - final result client: ${finalResult.client ? 'EXISTS' : 'NULL'}`);
        
        return finalResult;
      })
    );
    
    console.log('🔍 [DEBUG] Final subscriptionsWithServices:', JSON.stringify(subscriptionsWithServices, null, 2));
    
    return subscriptionsWithServices;
  }

  async getSubscription(id: string): Promise<Subscription | undefined> {
    const result = await this.db.select().from(subscriptions).where(eq(subscriptions.id, id)).limit(1);
    return result[0];
  }

  async getSubscriptionsByClient(clientId: string): Promise<Subscription[]> {
    return await this.db.select().from(subscriptions).where(eq(subscriptions.clientId, clientId)).orderBy(desc(subscriptions.createdAt));
  }

  async createSubscription(subscription: InsertSubscription): Promise<SubscriptionWithClient> {
    const newSubscription = { ...subscription, id: randomUUID(), createdAt: new Date(), updatedAt: new Date() };
    await this.db.insert(subscriptions).values(newSubscription);
    
    // Get the complete subscription with client data
    const result = await this.db
      .select({
        subscription: subscriptions,
        client: clients
      })
      .from(subscriptions)
      .leftJoin(clients, eq(subscriptions.clientId, clients.id))
      .where(eq(subscriptions.id, newSubscription.id))
      .limit(1);
    
    if (result.length === 0) {
      throw new Error("Failed to create subscription");
    }
    
    const row = result[0];
    
    // Get services for the subscription
    const services = await this.getSubscriptionServicesBySubscription(newSubscription.id);
    
    // Calculate next billing date
    const now = new Date();
    const nextBillingDate = new Date(now.getFullYear(), now.getMonth(), row.subscription.billingDay);
    if (nextBillingDate <= now) {
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
    }
    
    return {
      ...row.subscription,
      client: row.client,
      services,
      nextBillingDate
    };
  }

  async updateSubscription(id: string, subscription: Partial<InsertSubscription>): Promise<Subscription | undefined> {
    const updatedSubscription = { ...subscription, updatedAt: new Date() };
    const result = await this.db.update(subscriptions).set(updatedSubscription).where(eq(subscriptions.id, id)).returning();
    return result[0];
  }

  async deleteSubscription(id: string): Promise<boolean> {
    const result = await this.db.delete(subscriptions).where(eq(subscriptions.id, id));
    return result.rowCount > 0;
  }

  // Subscription Services
  async getSubscriptionServices(): Promise<SubscriptionService[]> {
    return await this.db.select().from(subscriptionServices).orderBy(desc(subscriptionServices.createdAt));
  }

  async getSubscriptionServicesBySubscription(subscriptionId: string): Promise<SubscriptionService[]> {
    return await this.db.select().from(subscriptionServices).where(eq(subscriptionServices.subscriptionId, subscriptionId)).orderBy(desc(subscriptionServices.createdAt));
  }

  async getSubscriptionService(id: string): Promise<SubscriptionService | undefined> {
    const result = await this.db.select().from(subscriptionServices).where(eq(subscriptionServices.id, id)).limit(1);
    return result[0];
  }

  async createSubscriptionService(service: InsertSubscriptionService): Promise<SubscriptionService> {
    const newService = { ...service, id: randomUUID(), createdAt: new Date(), updatedAt: new Date() };
    await this.db.insert(subscriptionServices).values(newService);
    return newService;
  }

  async updateSubscriptionService(id: string, service: Partial<InsertSubscriptionService>): Promise<SubscriptionService | undefined> {
    const updatedService = { ...service, updatedAt: new Date() };
    const result = await this.db.update(subscriptionServices).set(updatedService).where(eq(subscriptionServices.id, id)).returning();
    return result[0];
  }

  async deleteSubscriptionService(id: string): Promise<boolean> {
    const result = await this.db.delete(subscriptionServices).where(eq(subscriptionServices.id, id));
    return result.rowCount > 0;
  }

  // Payments
  async getPayments(): Promise<Payment[]> {
    return await this.db.select().from(payments).orderBy(desc(payments.createdAt));
  }

  async getPaymentsBySubscription(subscriptionId: string): Promise<Payment[]> {
    return await this.db.select().from(payments).where(eq(payments.subscriptionId, subscriptionId)).orderBy(desc(payments.createdAt));
  }

  async getPayment(id: string): Promise<Payment | undefined> {
    const result = await this.db.select().from(payments).where(eq(payments.id, id)).limit(1);
    return result[0];
  }

  async createPayment(payment: InsertPayment): Promise<Payment> {
    const newPayment = { ...payment, id: randomUUID(), createdAt: new Date(), updatedAt: new Date() };
    await this.db.insert(payments).values(newPayment);
    return newPayment;
  }

  async updatePayment(id: string, payment: Partial<InsertPayment>): Promise<Payment | undefined> {
    const updatedPayment = { ...payment, updatedAt: new Date() };
    const result = await this.db.update(payments).set(updatedPayment).where(eq(payments.id, id)).returning();
    return result[0];
  }

  async deletePayment(id: string): Promise<boolean> {
    const result = await this.db.delete(payments).where(eq(payments.id, id));
    return result.rowCount > 0;
  }

  // Payment Files
  async getPaymentFiles(): Promise<PaymentFile[]> {
    return await this.db.select().from(paymentFiles).orderBy(desc(paymentFiles.createdAt));
  }

  async getPaymentFilesByPayment(paymentId: string): Promise<PaymentFile[]> {
    return await this.db.select().from(paymentFiles).where(eq(paymentFiles.paymentId, paymentId)).orderBy(desc(paymentFiles.createdAt));
  }

  async getPaymentFile(id: string): Promise<PaymentFile | undefined> {
    const result = await this.db.select().from(paymentFiles).where(eq(paymentFiles.id, id)).limit(1);
    return result[0];
  }

  async createPaymentFile(file: InsertPaymentFile): Promise<PaymentFile> {
    const newFile = { ...file, id: randomUUID(), createdAt: new Date() };
    await this.db.insert(paymentFiles).values(newFile);
    return newFile;
  }

  async updatePaymentFile(id: string, file: Partial<InsertPaymentFile>): Promise<PaymentFile | undefined> {
    const result = await this.db.update(paymentFiles).set(file).where(eq(paymentFiles.id, id)).returning();
    return result[0];
  }

  async deletePaymentFile(id: string): Promise<boolean> {
    const result = await this.db.delete(paymentFiles).where(eq(paymentFiles.id, id));
    return result.rowCount > 0;
  }
}