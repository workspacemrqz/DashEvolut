import { 
  type Client, type InsertClient,
  type Project, type InsertProject, type ProjectWithClient,
  type Milestone, type InsertMilestone,
  type Interaction, type InsertInteraction,
  type Analytics, type InsertAnalytics,
  type Alert, type InsertAlert,
  type ClientWithStats
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
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
}

export class MemStorage implements IStorage {
  private clients: Map<string, Client> = new Map();
  private projects: Map<string, Project> = new Map();
  private milestones: Map<string, Milestone> = new Map();
  private interactions: Map<string, Interaction> = new Map();
  private analytics: Map<string, Analytics> = new Map();
  private alerts: Map<string, Alert> = new Map();

  constructor() {
    this.seedData();
  }

  private seedData() {
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
}

export const storage = new MemStorage();
