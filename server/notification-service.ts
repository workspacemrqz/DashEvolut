import { storage } from "./storage";
import { NotificationRule, Alert, Project, Client, Subscription } from "@shared/schema";

export class NotificationService {
  
  /**
   * Verifica todas as regras ativas e cria alertas quando necessário
   */
  async checkAllRules(): Promise<void> {
    try {
      console.log("🔍 Checking notification rules...");
      
      const activeRules = await storage.getActiveNotificationRules();
      console.log(`📋 Found ${activeRules.length} active rules`);
      
      for (const rule of activeRules) {
        await this.checkRule(rule);
      }
      
      console.log("✅ All rules checked successfully");
    } catch (error) {
      console.error("❌ Error checking notification rules:", error);
      throw error;
    }
  }

  /**
   * Verifica uma regra específica
   */
  private async checkRule(rule: NotificationRule): Promise<void> {
    try {
      console.log(`🔍 Checking rule: ${rule.name}`);
      
      switch (rule.condition.type) {
        case "project_delayed":
          await this.checkProjectDelayedRule(rule);
          break;
        case "payment_pending":
          await this.checkPaymentPendingRule(rule);
          break;
        case "upsell_opportunity":
          await this.checkUpsellOpportunityRule(rule);
          break;
        default:
          console.warn(`⚠️ Unknown rule type: ${rule.condition.type}`);
      }
    } catch (error) {
      console.error(`❌ Error checking rule ${rule.name}:`, error);
    }
  }

  /**
   * Verifica regra de projetos atrasados
   */
  private async checkProjectDelayedRule(rule: NotificationRule): Promise<void> {
    const projects = await storage.getProjectsWithClients();
    const now = new Date();
    
    const overdueProjects = projects.filter(project => {
      const dueDate = new Date(project.dueDate);
      const isOverdue = dueDate < now;
      const isNotCompleted = project.status !== "completed" && project.status !== "cancelled";
      return isOverdue && isNotCompleted;
    });

    console.log(`📊 Found ${overdueProjects.length} overdue projects`);

    for (const project of overdueProjects) {
      // Verificar se já existe um alerta para este projeto
      const existingAlerts = await storage.getAlerts();
      const hasExistingAlert = existingAlerts.some(alert => 
        alert.entityId === project.id && 
        alert.entityType === "project" && 
        alert.type === "project_delayed" &&
        !alert.isRead
      );

      if (!hasExistingAlert) {
        const daysOverdue = Math.ceil((now.getTime() - new Date(project.dueDate).getTime()) / (1000 * 60 * 60 * 24));
        
        await storage.createAlert({
          type: "project_delayed",
          title: `Projeto Atrasado: ${project.name}`,
          description: `O projeto "${project.name}" está atrasado há ${daysOverdue} dias. Data de entrega: ${new Date(project.dueDate).toLocaleDateString('pt-BR')}`,
          entityId: project.id,
          entityType: "project",
          priority: daysOverdue > 7 ? "high" : daysOverdue > 3 ? "medium" : "low"
        });

        console.log(`🚨 Created alert for overdue project: ${project.name}`);
      }
    }
  }

  /**
   * Verifica regra de pagamentos pendentes
   */
  private async checkPaymentPendingRule(rule: NotificationRule): Promise<void> {
    // Implementar lógica para pagamentos pendentes
    console.log("💳 Checking payment pending rule (not implemented yet)");
  }

  /**
   * Verifica regra de oportunidades de upsell
   */
  private async checkUpsellOpportunityRule(rule: NotificationRule): Promise<void> {
    // Implementar lógica para oportunidades de upsell
    console.log("📈 Checking upsell opportunity rule (not implemented yet)");
  }


  /**
   * Executa a verificação de regras em intervalos regulares
   */
  startPeriodicCheck(intervalMinutes: number = 30): void {
    console.log(`⏰ Starting periodic notification check every ${intervalMinutes} minutes`);
    
    // Executar imediatamente
    this.checkAllRules();
    
    // Executar em intervalos
    setInterval(() => {
      this.checkAllRules();
    }, intervalMinutes * 60 * 1000);
  }
}

// Instância singleton
export const notificationService = new NotificationService();
