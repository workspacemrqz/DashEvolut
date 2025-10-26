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
  type SubscriptionFile, type InsertSubscriptionFile,
  type SubscriptionCredential, type InsertSubscriptionCredential,
  type ProjectCost, type InsertProjectCost, type UpdateProjectCost,
  type ReplitUnit, type InsertReplitUnit, type UpdateReplitUnit,
  type SubscriptionWithClient, type SubscriptionWithDetails, type PaymentWithFile
} from "@shared/schema";
import { PostgresStorage } from "./postgres-storage";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserProfile(id: string, updates: UpdateUserProfile): Promise<User | undefined>;
  
  
  // Clients
  getClients(): Promise<Client[]>;
  getClientsWithStats(): Promise<ClientWithStats[]>;
  getClient(id: string): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: string, client: Partial<InsertClient>): Promise<Client | undefined>;
  deleteClient(id: string): Promise<boolean>;
  
  // Projects
  getProjects(): Promise<Project[]>;
  getProjectsWithClients(): Promise<ProjectWithClient[]>;
  getProject(id: string): Promise<Project | undefined>;
  getProjectsByClient(clientId: string): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, project: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: string): Promise<boolean>;
  
  // Project Costs
  getProjectCosts(projectId: string): Promise<ProjectCost[]>;
  getProjectCost(costId: string): Promise<ProjectCost | undefined>;
  createProjectCost(cost: InsertProjectCost): Promise<ProjectCost>;
  updateProjectCost(costId: string, cost: UpdateProjectCost): Promise<ProjectCost | undefined>;
  deleteProjectCost(costId: string): Promise<boolean>;
  
  // Interactions
  getInteractions(): Promise<Interaction[]>;
  getInteractionsByClient(clientId: string): Promise<Interaction[]>;
  getInteraction(id: string): Promise<Interaction | undefined>;
  createInteraction(interaction: InsertInteraction): Promise<Interaction>;
  updateInteraction(id: string, interaction: Partial<InsertInteraction>): Promise<Interaction | undefined>;
  deleteInteraction(id: string): Promise<boolean>;
  
  // Analytics
  getAnalytics(): Promise<Analytics[]>;
  getAnalyticsByDateRange(startDate: Date, endDate: Date): Promise<Analytics[]>;
  getAnalyticsById(id: string): Promise<Analytics | undefined>;
  createAnalytics(analytics: InsertAnalytics): Promise<Analytics>;
  updateAnalytics(id: string, analytics: Partial<InsertAnalytics>): Promise<Analytics | undefined>;
  deleteAnalytics(id: string): Promise<boolean>;
  
  // Alerts
  getAlerts(): Promise<Alert[]>;
  getUnreadAlerts(): Promise<Alert[]>;
  getAlert(id: string): Promise<Alert | undefined>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  updateAlert(id: string, alert: Partial<InsertAlert>): Promise<Alert | undefined>;
  deleteAlert(id: string): Promise<boolean>;
  markAlertAsRead(id: string): Promise<Alert | undefined>;
  
  // Notification Rules
  getNotificationRules(): Promise<NotificationRule[]>;
  getActiveNotificationRules(): Promise<NotificationRule[]>;
  getNotificationRule(id: string): Promise<NotificationRule | undefined>;
  createNotificationRule(rule: InsertNotificationRule): Promise<NotificationRule>;
  updateNotificationRule(id: string, rule: UpdateNotificationRule): Promise<NotificationRule | undefined>;
  deleteNotificationRule(id: string): Promise<boolean>;
  
  // Subscriptions
  getSubscriptions(): Promise<Subscription[]>;
  getSubscriptionsWithClients(): Promise<SubscriptionWithClient[]>;
  getSubscription(id: string): Promise<Subscription | undefined>;
  getSubscriptionsByClient(clientId: string): Promise<Subscription[]>;
  createSubscription(subscription: InsertSubscription): Promise<SubscriptionWithClient>;
  updateSubscription(id: string, subscription: Partial<InsertSubscription>): Promise<Subscription | undefined>;
  deleteSubscription(id: string): Promise<boolean>;
  
  // Subscription Services
  getSubscriptionServices(): Promise<SubscriptionService[]>;
  getSubscriptionServicesBySubscription(subscriptionId: string): Promise<SubscriptionService[]>;
  getSubscriptionService(id: string): Promise<SubscriptionService | undefined>;
  createSubscriptionService(service: InsertSubscriptionService): Promise<SubscriptionService>;
  updateSubscriptionService(id: string, service: Partial<InsertSubscriptionService>): Promise<SubscriptionService | undefined>;
  deleteSubscriptionService(id: string): Promise<boolean>;
  
  // Payments
  getPayments(): Promise<Payment[]>;
  getPaymentsBySubscription(subscriptionId: string): Promise<Payment[]>;
  getPayment(id: string): Promise<Payment | undefined>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePayment(id: string, payment: Partial<InsertPayment>): Promise<Payment | undefined>;
  deletePayment(id: string): Promise<boolean>;
  
  // Payment Files
  getPaymentFiles(): Promise<PaymentFile[]>;
  getPaymentFilesByPayment(paymentId: string): Promise<PaymentFile[]>;
  getPaymentFile(id: string): Promise<PaymentFile | undefined>;
  createPaymentFile(file: InsertPaymentFile): Promise<PaymentFile>;
  updatePaymentFile(id: string, file: Partial<InsertPaymentFile>): Promise<PaymentFile | undefined>;
  deletePaymentFile(id: string): Promise<boolean>;
  
  // Subscription Files
  getSubscriptionFiles(): Promise<SubscriptionFile[]>;
  getSubscriptionFilesBySubscription(subscriptionId: string): Promise<SubscriptionFile[]>;
  getSubscriptionFile(id: string): Promise<SubscriptionFile | undefined>;
  createSubscriptionFile(file: InsertSubscriptionFile): Promise<SubscriptionFile>;
  updateSubscriptionFile(id: string, file: Partial<InsertSubscriptionFile>): Promise<SubscriptionFile | undefined>;
  deleteSubscriptionFile(id: string): Promise<boolean>;
  
  // Subscription Credentials
  getSubscriptionCredentials(): Promise<SubscriptionCredential[]>;
  getSubscriptionCredentialsBySubscription(subscriptionId: string): Promise<SubscriptionCredential[]>;
  getSubscriptionCredential(id: string): Promise<SubscriptionCredential | undefined>;
  createSubscriptionCredential(credential: InsertSubscriptionCredential): Promise<SubscriptionCredential>;
  updateSubscriptionCredential(id: string, credential: Partial<InsertSubscriptionCredential>): Promise<SubscriptionCredential | undefined>;
  deleteSubscriptionCredential(id: string): Promise<boolean>;
  
  // Replit Units
  getReplitUnits(): Promise<ReplitUnit[]>;
  getReplitUnit(id: string): Promise<ReplitUnit | undefined>;
  createReplitUnit(unit: InsertReplitUnit): Promise<ReplitUnit>;
  updateReplitUnit(id: string, unit: UpdateReplitUnit): Promise<ReplitUnit | undefined>;
  deleteReplitUnit(id: string): Promise<boolean>;
}

export const storage = new PostgresStorage();
