import { 
  type User, type InsertUser, type UpdateUserProfile,
  type UserSettings, type InsertUserSettings, type UpdateUserSettings,
  type Client, type InsertClient,
  type Project, type InsertProject, type ProjectWithClient,
  type Milestone, type InsertMilestone,
  type Interaction, type InsertInteraction,
  type Analytics, type InsertAnalytics,
  type Alert, type InsertAlert,
  type ClientWithStats,
  type Subscription, type InsertSubscription,
  type SubscriptionService, type InsertSubscriptionService,
  type Payment, type InsertPayment,
  type PaymentFile, type InsertPaymentFile,
  type SubscriptionWithClient, type SubscriptionWithDetails, type PaymentWithFile
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserProfile(id: string, updates: UpdateUserProfile): Promise<User | undefined>;
  
  // User Settings
  getUserSettings(userId: string): Promise<UserSettings | undefined>;
  createUserSettings(settings: InsertUserSettings): Promise<UserSettings>;
  updateUserSettings(userId: string, updates: UpdateUserSettings): Promise<UserSettings | undefined>;
  
  // Clients
  getClients(): Promise<Client[]>;
  getClientsWithStats(): Promise<ClientWithStats[]>;
  getClient(id: string): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: string, client: Partial<InsertClient>): Promise<Client | undefined>;
  
  // Projects
  getProjects(): Promise<Project[]>;
  getProjectsWithClients(): Promise<ProjectWithClient[]>;
  getProject(id: string): Promise<Project | undefined>;
  getProjectsByClient(clientId: string): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, project: Partial<InsertProject>): Promise<Project | undefined>;
  
  // Milestones
  getMilestones(): Promise<Milestone[]>;
  getMilestonesByProject(projectId: string): Promise<Milestone[]>;
  createMilestone(milestone: InsertMilestone): Promise<Milestone>;
  updateMilestone(id: string, milestone: Partial<InsertMilestone>): Promise<Milestone | undefined>;
  
  // Interactions
  getInteractions(): Promise<Interaction[]>;
  getInteractionsByClient(clientId: string): Promise<Interaction[]>;
  createInteraction(interaction: InsertInteraction): Promise<Interaction>;
  
  // Analytics
  getLatestAnalytics(): Promise<Analytics | undefined>;
  createAnalytics(analytics: InsertAnalytics): Promise<Analytics>;
  
  // Alerts
  getAlerts(): Promise<Alert[]>;
  getUnreadAlerts(): Promise<Alert[]>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  markAlertAsRead(id: string): Promise<Alert | undefined>;
  
  // Subscriptions
  getSubscriptions(): Promise<SubscriptionWithClient[]>;
  getSubscription(id: string): Promise<SubscriptionWithDetails | undefined>;
  getSubscriptionsByClient(clientId: string): Promise<Subscription[]>;
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  updateSubscription(id: string, subscription: Partial<InsertSubscription>): Promise<Subscription | undefined>;
  
  // Subscription Services
  getSubscriptionServices(subscriptionId: string): Promise<SubscriptionService[]>;
  createSubscriptionService(service: InsertSubscriptionService): Promise<SubscriptionService>;
  updateSubscriptionService(id: string, service: Partial<InsertSubscriptionService>): Promise<SubscriptionService | undefined>;
  deleteSubscriptionService(id: string): Promise<boolean>;
  
  // Payments
  getPayments(): Promise<PaymentWithFile[]>;
  getPaymentsBySubscription(subscriptionId: string): Promise<PaymentWithFile[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  
  // Payment Files
  createPaymentFile(file: InsertPaymentFile): Promise<PaymentFile>;
  getPaymentFile(id: string): Promise<PaymentFile | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private userSettings: Map<string, UserSettings> = new Map();
  private clients: Map<string, Client> = new Map();
  private projects: Map<string, Project> = new Map();
  private milestones: Map<string, Milestone> = new Map();
  private interactions: Map<string, Interaction> = new Map();
  private analytics: Map<string, Analytics> = new Map();
  private alerts: Map<string, Alert> = new Map();
  private subscriptions: Map<string, Subscription> = new Map();
  private subscriptionServices: Map<string, SubscriptionService> = new Map();
  private payments: Map<string, Payment> = new Map();
  private paymentFiles: Map<string, PaymentFile> = new Map();

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Create sample user
    const user: User = {
      id: randomUUID(),
      name: "João Silva",
      email: "joao@exemplo.com",
      company: "Minha Empresa",
      phone: "(11) 99999-9999",
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.users.set(user.id, user);

    // Create default user settings
    const settings: UserSettings = {
      id: randomUUID(),
      userId: user.id,
      notifications: {
        push: true,
        projectUpdates: true,
        clientMessages: true,
        deadlineAlerts: true,
        weeklyReports: false,
      },
      uiSettings: {
        theme: "dark",
        language: "pt-BR",
        dateFormat: "DD/MM/YYYY",
        currency: "BRL",
        autoSave: true,
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.userSettings.set(settings.id, settings);

    // Create some sample clients
    const client1: Client = {
      id: randomUUID(),
      name: "TechStart LTDA",
      company: "TechStart LTDA",
      email: "contato@techstart.com",
      phone: "(11) 99999-0001",
      status: "active",
      source: "Indicação",
      sector: "Tecnologia",
      nps: 9.2,
      ltv: 15890,
      upsellPotential: "high",
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-12-01')
    };

    const client2: Client = {
      id: randomUUID(),
      name: "Inovação Digital",
      company: "Inovação Digital",
      email: "contato@inovacaodigital.com",
      phone: "(11) 99999-0002",
      status: "prospect",
      source: "Google Ads",
      sector: "Marketing",
      nps: null,
      ltv: 0,
      upsellPotential: "medium",
      createdAt: new Date('2024-11-20'),
      updatedAt: new Date('2024-11-20')
    };

    const client3: Client = {
      id: randomUUID(),
      name: "Global Solutions",
      company: "Global Solutions",
      email: "contato@globalsolutions.com",
      phone: "(11) 99999-0003",
      status: "active",
      source: "LinkedIn",
      sector: "Consultoria",
      nps: 7.8,
      ltv: 22450,
      upsellPotential: "high",
      createdAt: new Date('2024-03-10'),
      updatedAt: new Date('2024-12-01')
    };

    this.clients.set(client1.id, client1);
    this.clients.set(client2.id, client2);
    this.clients.set(client3.id, client3);

    // Create some sample projects
    const project1: Project = {
      id: randomUUID(),
      name: "Website E-commerce",
      description: "Desenvolvimento completo de plataforma e-commerce",
      clientId: client1.id,
      status: "development",
      value: 18500,
      estimatedHours: 120,
      workedHours: 90,
      profitMargin: 72,
      progress: 75,
      startDate: new Date('2024-11-01'),
      dueDate: new Date('2024-12-15'),
      isRecurring: false,
      createdAt: new Date('2024-11-01'),
      updatedAt: new Date('2024-12-10')
    };

    const project2: Project = {
      id: randomUUID(),
      name: "App Mobile",
      description: "Aplicativo iOS e Android",
      clientId: client3.id,
      status: "discovery",
      value: 35000,
      estimatedHours: 200,
      workedHours: 25,
      profitMargin: 65,
      progress: 25,
      startDate: new Date('2024-12-01'),
      dueDate: new Date('2025-01-20'),
      isRecurring: false,
      createdAt: new Date('2024-12-01'),
      updatedAt: new Date('2024-12-10')
    };

    const project3: Project = {
      id: randomUUID(),
      name: "Sistema CRM",
      description: "Customização e integração de CRM",
      clientId: client2.id,
      status: "delivery",
      value: 12800,
      estimatedHours: 80,
      workedHours: 76,
      profitMargin: 58,
      progress: 95,
      startDate: new Date('2024-10-15'),
      dueDate: new Date('2024-12-18'),
      isRecurring: false,
      createdAt: new Date('2024-10-15'),
      updatedAt: new Date('2024-12-10')
    };

    this.projects.set(project1.id, project1);
    this.projects.set(project2.id, project2);
    this.projects.set(project3.id, project3);

    // Create sample analytics
    const currentAnalytics: Analytics = {
      id: randomUUID(),
      date: new Date(),
      mrr: 45890,
      churnRate: 2.8,
      avgLifetimeValue: 8450,
      activeProjects: 24,
      totalRevenue: 78950,
      createdAt: new Date()
    };

    this.analytics.set(currentAnalytics.id, currentAnalytics);

    // Create sample alerts
    const alert1: Alert = {
      id: randomUUID(),
      type: "project_delayed",
      title: "Projeto Website E-commerce - Atrasado",
      description: "Prazo: 15/12/2024 | Cliente: TechStart LTDA",
      entityId: project1.id,
      entityType: "project",
      priority: "high",
      isRead: false,
      createdAt: new Date()
    };

    const alert2: Alert = {
      id: randomUUID(),
      type: "payment_pending",
      title: "Pagamento Pendente - R$ 5.800",
      description: "Vencimento: 10/12/2024 | Cliente: Inovação Digital",
      entityId: client2.id,
      entityType: "client",
      priority: "medium",
      isRead: false,
      createdAt: new Date()
    };

    const alert3: Alert = {
      id: randomUUID(),
      type: "upsell_opportunity",
      title: "Oportunidade de Upsell Identificada",
      description: "Cliente: Global Solutions | Potencial: R$ 12.000",
      entityId: client3.id,
      entityType: "client",
      priority: "medium",
      isRead: false,
      createdAt: new Date()
    };

    this.alerts.set(alert1.id, alert1);
    this.alerts.set(alert2.id, alert2);
    this.alerts.set(alert3.id, alert3);

    // Create sample subscriptions
    const subscription1: Subscription = {
      id: randomUUID(),
      clientId: client1.id,
      billingDay: 15,
      amount: 2500,
      notes: "Serviços de marketing digital mensal incluindo SEO e social media",
      status: "active",
      createdAt: new Date('2024-08-15'),
      updatedAt: new Date('2024-12-10')
    };

    const subscription2: Subscription = {
      id: randomUUID(),
      clientId: client2.id,
      billingDay: 1,
      amount: 1800,
      notes: "Manutenção mensal do sistema CRM",
      status: "active",
      createdAt: new Date('2024-09-01'),
      updatedAt: new Date('2024-12-10')
    };

    const subscription3: Subscription = {
      id: randomUUID(),
      clientId: client3.id,
      billingDay: 10,
      amount: 3200,
      notes: "Consultoria estratégica e suporte técnico",
      status: "paused",
      createdAt: new Date('2024-07-10'),
      updatedAt: new Date('2024-11-20')
    };

    this.subscriptions.set(subscription1.id, subscription1);
    this.subscriptions.set(subscription2.id, subscription2);
    this.subscriptions.set(subscription3.id, subscription3);

    // Create sample subscription services
    const service1: SubscriptionService = {
      id: randomUUID(),
      subscriptionId: subscription1.id,
      description: "Análise de palavras-chave mensais",
      isCompleted: true,
      order: 1,
      createdAt: new Date()
    };

    const service2: SubscriptionService = {
      id: randomUUID(),
      subscriptionId: subscription1.id,
      description: "Criação de conteúdo para redes sociais",
      isCompleted: true,
      order: 2,
      createdAt: new Date()
    };

    const service3: SubscriptionService = {
      id: randomUUID(),
      subscriptionId: subscription1.id,
      description: "Relatório mensal de performance",
      isCompleted: false,
      order: 3,
      createdAt: new Date()
    };

    const service4: SubscriptionService = {
      id: randomUUID(),
      subscriptionId: subscription2.id,
      description: "Backup e monitoramento do sistema",
      isCompleted: true,
      order: 1,
      createdAt: new Date()
    };

    const service5: SubscriptionService = {
      id: randomUUID(),
      subscriptionId: subscription2.id,
      description: "Atualizações de segurança",
      isCompleted: false,
      order: 2,
      createdAt: new Date()
    };

    this.subscriptionServices.set(service1.id, service1);
    this.subscriptionServices.set(service2.id, service2);
    this.subscriptionServices.set(service3.id, service3);
    this.subscriptionServices.set(service4.id, service4);
    this.subscriptionServices.set(service5.id, service5);

    // Create sample payments
    const payment1: Payment = {
      id: randomUUID(),
      subscriptionId: subscription1.id,
      amount: 2500,
      paymentDate: new Date('2024-11-15'),
      referenceMonth: 11,
      referenceYear: 2024,
      receiptFileId: null,
      notes: "Pagamento via PIX",
      createdAt: new Date('2024-11-15')
    };

    const payment2: Payment = {
      id: randomUUID(),
      subscriptionId: subscription2.id,
      amount: 1800,
      paymentDate: new Date('2024-12-01'),
      referenceMonth: 12,
      referenceYear: 2024,
      receiptFileId: null,
      notes: "Pagamento via boleto bancário",
      createdAt: new Date('2024-12-01')
    };

    this.payments.set(payment1.id, payment1);
    this.payments.set(payment2.id, payment2);

    // Add subscription alerts
    const subscriptionAlert1: Alert = {
      id: randomUUID(),
      type: "subscription_due",
      title: "Cobrança de Assinatura - TechStart LTDA",
      description: "Vencimento: 15/01/2025 | Valor: R$ 2.500,00",
      entityId: subscription1.id,
      entityType: "subscription",
      priority: "medium",
      isRead: false,
      createdAt: new Date()
    };

    const subscriptionAlert2: Alert = {
      id: randomUUID(),
      type: "subscription_overdue",
      title: "Assinatura em Atraso - Inovação Digital",
      description: "Venceu em: 01/01/2025 | Valor: R$ 1.800,00",
      entityId: subscription2.id,
      entityType: "subscription",
      priority: "high",
      isRead: false,
      createdAt: new Date()
    };

    this.alerts.set(subscriptionAlert1.id, subscriptionAlert1);
    this.alerts.set(subscriptionAlert2.id, subscriptionAlert2);
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      ...insertUser,
      id: randomUUID(),
      company: insertUser.company ?? null,
      phone: insertUser.phone ?? null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(user.id, user);
    return user;
  }

  async updateUserProfile(id: string, updates: UpdateUserProfile): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updatedUser: User = {
      ...user,
      ...updates,
      updatedAt: new Date()
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }


  // User Settings methods
  async getUserSettings(userId: string): Promise<UserSettings | undefined> {
    return Array.from(this.userSettings.values()).find(settings => settings.userId === userId);
  }

  async createUserSettings(insertSettings: InsertUserSettings): Promise<UserSettings> {
    const settings: UserSettings = {
      ...insertSettings,
      id: randomUUID(),
      notifications: insertSettings.notifications || {
        push: true,
        projectUpdates: true,
        clientMessages: true,
        deadlineAlerts: true,
        weeklyReports: false,
      },
      uiSettings: insertSettings.uiSettings || {
        theme: "dark",
        language: "pt-BR",
        dateFormat: "DD/MM/YYYY",
        currency: "BRL",
        autoSave: true,
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.userSettings.set(settings.id, settings);
    return settings;
  }

  async updateUserSettings(userId: string, updates: UpdateUserSettings): Promise<UserSettings | undefined> {
    const settings = Array.from(this.userSettings.values()).find(s => s.userId === userId);
    if (!settings) return undefined;

    const updatedSettings: UserSettings = {
      ...settings,
      ...updates,
      updatedAt: new Date()
    };
    this.userSettings.set(settings.id, updatedSettings);
    return updatedSettings;
  }

  // Clients methods
  async getClients(): Promise<Client[]> {
    return Array.from(this.clients.values());
  }

  async getClientsWithStats(): Promise<ClientWithStats[]> {
    const clients = Array.from(this.clients.values());
    const projects = Array.from(this.projects.values());
    const interactions = Array.from(this.interactions.values());

    return clients.map(client => {
      const clientProjects = projects.filter(p => p.clientId === client.id);
      const clientInteractions = interactions.filter(i => i.clientId === client.id);
      const lastInteraction = clientInteractions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];

      return {
        ...client,
        projectCount: clientProjects.length,
        totalValue: clientProjects.reduce((sum, p) => sum + p.value, 0),
        lastInteraction
      };
    });
  }

  async getClient(id: string): Promise<Client | undefined> {
    return this.clients.get(id);
  }

  async createClient(insertClient: InsertClient): Promise<Client> {
    const client: Client = {
      ...insertClient,
      id: randomUUID(),
      phone: insertClient.phone ?? null,
      status: insertClient.status ?? "prospect",
      nps: insertClient.nps ?? null,
      ltv: insertClient.ltv ?? null,
      upsellPotential: insertClient.upsellPotential ?? null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.clients.set(client.id, client);
    return client;
  }

  async updateClient(id: string, updates: Partial<InsertClient>): Promise<Client | undefined> {
    const client = this.clients.get(id);
    if (!client) return undefined;

    const updatedClient: Client = {
      ...client,
      ...updates,
      updatedAt: new Date()
    };
    this.clients.set(id, updatedClient);
    return updatedClient;
  }

  // Projects methods
  async getProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }

  async getProjectsWithClients(): Promise<ProjectWithClient[]> {
    const projects = Array.from(this.projects.values());
    return projects.map(project => {
      const client = this.clients.get(project.clientId)!;
      return { ...project, client };
    });
  }

  async getProject(id: string): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async getProjectsByClient(clientId: string): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(p => p.clientId === clientId);
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const project: Project = {
      ...insertProject,
      id: randomUUID(),
      status: insertProject.status ?? "discovery",
      progress: insertProject.progress ?? 0,
      profitMargin: insertProject.profitMargin ?? 0,
      workedHours: insertProject.workedHours ?? null,
      isRecurring: insertProject.isRecurring ?? null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.projects.set(project.id, project);
    return project;
  }

  async updateProject(id: string, updates: Partial<InsertProject>): Promise<Project | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;

    const updatedProject: Project = {
      ...project,
      ...updates,
      updatedAt: new Date()
    };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }

  // Milestones methods
  async getMilestones(): Promise<Milestone[]> {
    return Array.from(this.milestones.values());
  }

  async getMilestonesByProject(projectId: string): Promise<Milestone[]> {
    return Array.from(this.milestones.values()).filter(m => m.projectId === projectId);
  }

  async createMilestone(insertMilestone: InsertMilestone): Promise<Milestone> {
    const milestone: Milestone = {
      ...insertMilestone,
      id: randomUUID(),
      description: insertMilestone.description ?? null,
      isCompleted: insertMilestone.isCompleted ?? null,
      requiresClientApproval: insertMilestone.requiresClientApproval ?? null,
      createdAt: new Date()
    };
    this.milestones.set(milestone.id, milestone);
    return milestone;
  }

  async updateMilestone(id: string, updates: Partial<InsertMilestone>): Promise<Milestone | undefined> {
    const milestone = this.milestones.get(id);
    if (!milestone) return undefined;

    const updatedMilestone: Milestone = {
      ...milestone,
      ...updates
    };
    this.milestones.set(id, updatedMilestone);
    return updatedMilestone;
  }

  // Interactions methods
  async getInteractions(): Promise<Interaction[]> {
    return Array.from(this.interactions.values());
  }

  async getInteractionsByClient(clientId: string): Promise<Interaction[]> {
    return Array.from(this.interactions.values()).filter(i => i.clientId === clientId);
  }

  async createInteraction(insertInteraction: InsertInteraction): Promise<Interaction> {
    const interaction: Interaction = {
      ...insertInteraction,
      id: randomUUID(),
      notes: insertInteraction.notes ?? null,
      createdAt: new Date()
    };
    this.interactions.set(interaction.id, interaction);
    return interaction;
  }

  // Analytics methods
  async getLatestAnalytics(): Promise<Analytics | undefined> {
    const analytics = Array.from(this.analytics.values());
    return analytics.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
  }

  async createAnalytics(insertAnalytics: InsertAnalytics): Promise<Analytics> {
    const analytics: Analytics = {
      ...insertAnalytics,
      id: randomUUID(),
      mrr: insertAnalytics.mrr ?? null,
      churnRate: insertAnalytics.churnRate ?? null,
      avgLifetimeValue: insertAnalytics.avgLifetimeValue ?? null,
      activeProjects: insertAnalytics.activeProjects ?? null,
      totalRevenue: insertAnalytics.totalRevenue ?? null,
      createdAt: new Date()
    };
    this.analytics.set(analytics.id, analytics);
    return analytics;
  }

  // Alerts methods
  async getAlerts(): Promise<Alert[]> {
    return Array.from(this.alerts.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getUnreadAlerts(): Promise<Alert[]> {
    return Array.from(this.alerts.values()).filter(a => !a.isRead);
  }

  async createAlert(insertAlert: InsertAlert): Promise<Alert> {
    const alert: Alert = {
      ...insertAlert,
      id: randomUUID(),
      priority: insertAlert.priority ?? null,
      isRead: insertAlert.isRead ?? null,
      createdAt: new Date()
    };
    this.alerts.set(alert.id, alert);
    return alert;
  }

  async markAlertAsRead(id: string): Promise<Alert | undefined> {
    const alert = this.alerts.get(id);
    if (!alert) return undefined;

    const updatedAlert: Alert = {
      ...alert,
      isRead: true
    };
    this.alerts.set(id, updatedAlert);
    return updatedAlert;
  }

  // Subscription methods
  async getSubscriptions(): Promise<SubscriptionWithClient[]> {
    const subscriptions = Array.from(this.subscriptions.values());
    const clients = Array.from(this.clients.values());
    const services = Array.from(this.subscriptionServices.values());
    const payments = Array.from(this.payments.values());

    return subscriptions.map(subscription => {
      const client = clients.find(c => c.id === subscription.clientId)!;
      const subscriptionServices = services.filter(s => s.subscriptionId === subscription.id);
      const subscriptionPayments = payments.filter(p => p.subscriptionId === subscription.id);
      const lastPayment = subscriptionPayments.sort((a, b) => b.paymentDate.getTime() - a.paymentDate.getTime())[0];
      
      // Calculate next billing date
      const now = new Date();
      const nextBillingDate = new Date(now.getFullYear(), now.getMonth(), subscription.billingDay);
      if (nextBillingDate < now) {
        nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
      }

      return {
        ...subscription,
        client,
        services: subscriptionServices,
        lastPayment,
        nextBillingDate
      };
    });
  }

  async getSubscription(id: string): Promise<SubscriptionWithDetails | undefined> {
    const subscription = this.subscriptions.get(id);
    if (!subscription) return undefined;

    const client = this.clients.get(subscription.clientId)!;
    const services = Array.from(this.subscriptionServices.values()).filter(s => s.subscriptionId === id);
    const subscriptionPayments = Array.from(this.payments.values()).filter(p => p.subscriptionId === id);
    const paymentFiles = Array.from(this.paymentFiles.values());

    const payments: PaymentWithFile[] = subscriptionPayments.map(payment => ({
      ...payment,
      file: payment.receiptFileId ? paymentFiles.find(f => f.id === payment.receiptFileId) : undefined
    }));

    // Calculate next billing date
    const now = new Date();
    const nextBillingDate = new Date(now.getFullYear(), now.getMonth(), subscription.billingDay);
    if (nextBillingDate < now) {
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
    }

    return {
      ...subscription,
      client,
      services,
      payments,
      nextBillingDate
    };
  }

  async getSubscriptionsByClient(clientId: string): Promise<Subscription[]> {
    return Array.from(this.subscriptions.values()).filter(s => s.clientId === clientId);
  }

  async createSubscription(insertSubscription: InsertSubscription): Promise<Subscription> {
    const subscription: Subscription = {
      ...insertSubscription,
      id: randomUUID(),
      notes: insertSubscription.notes ?? null,
      status: insertSubscription.status ?? "active",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.subscriptions.set(subscription.id, subscription);
    return subscription;
  }

  async updateSubscription(id: string, updates: Partial<InsertSubscription>): Promise<Subscription | undefined> {
    const subscription = this.subscriptions.get(id);
    if (!subscription) return undefined;

    const updatedSubscription: Subscription = {
      ...subscription,
      ...updates,
      updatedAt: new Date()
    };
    this.subscriptions.set(id, updatedSubscription);
    return updatedSubscription;
  }

  // Subscription Services methods
  async getSubscriptionServices(subscriptionId: string): Promise<SubscriptionService[]> {
    return Array.from(this.subscriptionServices.values())
      .filter(s => s.subscriptionId === subscriptionId)
      .sort((a, b) => a.order - b.order);
  }

  async createSubscriptionService(insertService: InsertSubscriptionService): Promise<SubscriptionService> {
    const service: SubscriptionService = {
      ...insertService,
      id: randomUUID(),
      isCompleted: insertService.isCompleted ?? false,
      order: insertService.order ?? 0,
      createdAt: new Date()
    };
    this.subscriptionServices.set(service.id, service);
    return service;
  }

  async updateSubscriptionService(id: string, updates: Partial<InsertSubscriptionService>): Promise<SubscriptionService | undefined> {
    const service = this.subscriptionServices.get(id);
    if (!service) return undefined;

    const updatedService: SubscriptionService = {
      ...service,
      ...updates
    };
    this.subscriptionServices.set(id, updatedService);
    return updatedService;
  }

  async deleteSubscriptionService(id: string): Promise<boolean> {
    return this.subscriptionServices.delete(id);
  }

  // Payment methods
  async getPayments(): Promise<PaymentWithFile[]> {
    const payments = Array.from(this.payments.values());
    const files = Array.from(this.paymentFiles.values());

    return payments.map(payment => ({
      ...payment,
      file: payment.receiptFileId ? files.find(f => f.id === payment.receiptFileId) : undefined
    }));
  }

  async getPaymentsBySubscription(subscriptionId: string): Promise<PaymentWithFile[]> {
    const payments = Array.from(this.payments.values()).filter(p => p.subscriptionId === subscriptionId);
    const files = Array.from(this.paymentFiles.values());

    return payments.map(payment => ({
      ...payment,
      file: payment.receiptFileId ? files.find(f => f.id === payment.receiptFileId) : undefined
    }));
  }

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const payment: Payment = {
      ...insertPayment,
      id: randomUUID(),
      receiptFileId: insertPayment.receiptFileId ?? null,
      notes: insertPayment.notes ?? null,
      createdAt: new Date()
    };
    this.payments.set(payment.id, payment);
    return payment;
  }

  // Payment Files methods
  async createPaymentFile(insertFile: InsertPaymentFile): Promise<PaymentFile> {
    const file: PaymentFile = {
      ...insertFile,
      id: randomUUID(),
      createdAt: new Date()
    };
    this.paymentFiles.set(file.id, file);
    return file;
  }

  async getPaymentFile(id: string): Promise<PaymentFile | undefined> {
    return this.paymentFiles.get(id);
  }
}

export const storage = new MemStorage();
