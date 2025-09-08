import { storage } from "./storage";
import { insertNotificationRuleSchema } from "@shared/schema";

async function seedNotificationRules() {
  try {
    console.log("🌱 Seeding notification rules...");

    // Primeira regra: Projetos Atrasados
    const overdueProjectsRule = {
      name: "Projetos Atrasados",
      description: "Notificar quando há projetos com data de entrega passada e status diferente de 'completed' ou 'cancelled'",
      condition: {
        type: "project_delayed",
        field: "dueDate",
        operator: "less_than",
        value: "now",
        entityType: "project"
      },
      isActive: true
    };

    const validatedRule = insertNotificationRuleSchema.parse(overdueProjectsRule);
    const createdRule = await storage.createNotificationRule(validatedRule);
    
    console.log("✅ Created notification rule:", createdRule.name);
    console.log("   ID:", createdRule.id);
    console.log("   Description:", createdRule.description);
    
    console.log("🎉 Notification rules seeded successfully!");
    
  } catch (error) {
    console.error("❌ Error seeding notification rules:", error);
    throw error;
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  seedNotificationRules()
    .then(() => {
      console.log("✅ Seeding completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Seeding failed:", error);
      process.exit(1);
    });
}

export { seedNotificationRules };
