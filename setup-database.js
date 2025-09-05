const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgres://dashevolutia:@Ev0luTi42025@easypanel.evolutionmanagerevolutia.space:5502/dashevolutia?sslmode=disable'
});

async function setupDatabase() {
  try {
    await client.connect();
    console.log('Conectado ao banco de dados');

    // Ler o arquivo de migração
    const fs = require('fs');
    const migrationSQL = fs.readFileSync('./migrations/0000_blue_firedrake.sql', 'utf8');
    
    // Executar a migração
    await client.query(migrationSQL);
    console.log('Migração aplicada com sucesso');

    // Inserir dados de exemplo
    await insertSampleData();
    
    console.log('Banco de dados configurado com sucesso!');
  } catch (error) {
    console.error('Erro ao configurar banco:', error);
  } finally {
    await client.end();
  }
}

async function insertSampleData() {
  console.log('Inserindo dados de exemplo...');

  // Inserir usuário padrão
  const userResult = await client.query(`
    INSERT INTO users (name, email, company, phone) 
    VALUES ('Admin User', 'admin@evolutia.com', 'Evolut IA', '+55 11 99999-9999')
    ON CONFLICT (email) DO NOTHING
    RETURNING id
  `);
  
  let userId;
  if (userResult.rows.length > 0) {
    userId = userResult.rows[0].id;
  } else {
    const existingUser = await client.query('SELECT id FROM users WHERE email = $1', ['admin@evolutia.com']);
    userId = existingUser.rows[0].id;
  }

  // Inserir configurações do usuário
  await client.query(`
    INSERT INTO user_settings (user_id, notifications, ui_settings)
    VALUES ($1, $2, $3)
    ON CONFLICT (user_id) DO NOTHING
  `, [
    userId,
    JSON.stringify({
      push: true,
      projectUpdates: true,
      clientMessages: true,
      deadlineAlerts: true,
      weeklyReports: false
    }),
    JSON.stringify({
      theme: "dark",
      language: "pt-BR",
      dateFormat: "DD/MM/YYYY",
      currency: "BRL",
      autoSave: true
    })
  ]);

  // Inserir clientes de exemplo
  const clients = [
    {
      name: 'João Silva',
      company: 'TechCorp Ltda',
      email: 'joao@techcorp.com',
      phone: '+55 11 99999-0001',
      status: 'active',
      source: 'LinkedIn',
      sector: 'Tecnologia',
      nps: 9.0,
      ltv: 50000.00,
      upsell_potential: 'high'
    },
    {
      name: 'Maria Santos',
      company: 'Inovação Digital',
      email: 'maria@inovacao.com',
      phone: '+55 11 99999-0002',
      status: 'active',
      source: 'Indicação',
      sector: 'Marketing Digital',
      nps: 8.5,
      ltv: 35000.00,
      upsell_potential: 'medium'
    },
    {
      name: 'Pedro Costa',
      company: 'StartupXYZ',
      email: 'pedro@startupxyz.com',
      phone: '+55 11 99999-0003',
      status: 'prospect',
      source: 'Google Ads',
      sector: 'E-commerce',
      nps: null,
      ltv: 0,
      upsell_potential: 'low'
    }
  ];

  const clientIds = [];
  for (const clientData of clients) {
    const result = await client.query(`
      INSERT INTO clients (name, company, email, phone, status, source, sector, nps, ltv, upsell_potential)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (email) DO NOTHING
      RETURNING id
    `, [
      clientData.name, clientData.company, clientData.email, clientData.phone,
      clientData.status, clientData.source, clientData.sector, clientData.nps,
      clientData.ltv, clientData.upsell_potential
    ]);
    
    if (result.rows.length > 0) {
      clientIds.push(result.rows[0].id);
    } else {
      const existing = await client.query('SELECT id FROM clients WHERE email = $1', [clientData.email]);
      clientIds.push(existing.rows[0].id);
    }
  }

  // Inserir projetos de exemplo
  const projects = [
    {
      name: 'Sistema de Gestão ERP',
      description: 'Desenvolvimento de sistema completo de gestão empresarial',
      client_id: clientIds[0],
      status: 'development',
      value: 25000.00,
      estimated_hours: 200,
      worked_hours: 120,
      profit_margin: 0.25,
      progress: 60,
      start_date: new Date('2024-01-15'),
      due_date: new Date('2024-03-15'),
      is_recurring: false
    },
    {
      name: 'Site Institucional',
      description: 'Criação de site institucional com blog e sistema de contato',
      client_id: clientIds[1],
      status: 'delivery',
      value: 8000.00,
      estimated_hours: 80,
      worked_hours: 75,
      profit_margin: 0.30,
      progress: 95,
      start_date: new Date('2024-02-01'),
      due_date: new Date('2024-02-28'),
      is_recurring: false
    },
    {
      name: 'E-commerce Completo',
      description: 'Plataforma de e-commerce com painel administrativo',
      client_id: clientIds[2],
      status: 'discovery',
      value: 15000.00,
      estimated_hours: 150,
      worked_hours: 0,
      profit_margin: 0.20,
      progress: 5,
      start_date: new Date('2024-03-01'),
      due_date: new Date('2024-05-01'),
      is_recurring: false
    }
  ];

  const projectIds = [];
  for (const projectData of projects) {
    const result = await client.query(`
      INSERT INTO projects (name, description, client_id, status, value, estimated_hours, worked_hours, profit_margin, progress, start_date, due_date, is_recurring)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING id
    `, [
      projectData.name, projectData.description, projectData.client_id, projectData.status,
      projectData.value, projectData.estimated_hours, projectData.worked_hours, projectData.profit_margin,
      projectData.progress, projectData.start_date, projectData.due_date, projectData.is_recurring
    ]);
    projectIds.push(result.rows[0].id);
  }

  // Inserir marcos de exemplo
  const milestones = [
    {
      project_id: projectIds[0],
      title: 'Análise de Requisitos',
      description: 'Documentação completa dos requisitos do sistema',
      due_date: new Date('2024-01-30'),
      is_completed: true,
      requires_client_approval: true
    },
    {
      project_id: projectIds[0],
      title: 'Desenvolvimento Backend',
      description: 'Implementação da API e lógica de negócio',
      due_date: new Date('2024-02-15'),
      is_completed: true,
      requires_client_approval: false
    },
    {
      project_id: projectIds[0],
      title: 'Interface do Usuário',
      description: 'Desenvolvimento do frontend e integração',
      due_date: new Date('2024-03-01'),
      is_completed: false,
      requires_client_approval: true
    },
    {
      project_id: projectIds[1],
      title: 'Design e Prototipagem',
      description: 'Criação do design e protótipos interativos',
      due_date: new Date('2024-02-10'),
      is_completed: true,
      requires_client_approval: true
    },
    {
      project_id: projectIds[1],
      title: 'Desenvolvimento',
      description: 'Implementação do site e funcionalidades',
      due_date: new Date('2024-02-25'),
      is_completed: true,
      requires_client_approval: false
    }
  ];

  for (const milestone of milestones) {
    await client.query(`
      INSERT INTO milestones (project_id, title, description, due_date, is_completed, requires_client_approval)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [
      milestone.project_id, milestone.title, milestone.description,
      milestone.due_date, milestone.is_completed, milestone.requires_client_approval
    ]);
  }

  // Inserir interações de exemplo
  const interactions = [
    {
      client_id: clientIds[0],
      type: 'meeting',
      subject: 'Reunião de alinhamento do projeto ERP',
      notes: 'Cliente aprovou a fase de análise. Próximo passo: desenvolvimento do backend.'
    },
    {
      client_id: clientIds[1],
      type: 'email',
      subject: 'Aprovação do design do site',
      notes: 'Cliente aprovou o design. Iniciando desenvolvimento.'
    },
    {
      client_id: clientIds[2],
      type: 'call',
      subject: 'Proposta comercial para e-commerce',
      notes: 'Cliente interessado. Aguardando aprovação do orçamento.'
    }
  ];

  for (const interaction of interactions) {
    await client.query(`
      INSERT INTO interactions (client_id, type, subject, notes)
      VALUES ($1, $2, $3, $4)
    `, [interaction.client_id, interaction.type, interaction.subject, interaction.notes]);
  }

  // Inserir assinaturas de exemplo
  const subscriptions = [
    {
      client_id: clientIds[0],
      billing_day: 15,
      amount: 2000.00,
      notes: 'Manutenção mensal do sistema ERP',
      status: 'active'
    },
    {
      client_id: clientIds[1],
      billing_day: 5,
      amount: 500.00,
      notes: 'Hospedagem e suporte do site',
      status: 'active'
    }
  ];

  const subscriptionIds = [];
  for (const subscription of subscriptions) {
    const result = await client.query(`
      INSERT INTO subscriptions (client_id, billing_day, amount, notes, status)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `, [subscription.client_id, subscription.billing_day, subscription.amount, subscription.notes, subscription.status]);
    subscriptionIds.push(result.rows[0].id);
  }

  // Inserir serviços das assinaturas
  const services = [
    {
      subscription_id: subscriptionIds[0],
      description: 'Backup diário dos dados',
      is_completed: true,
      order: 1
    },
    {
      subscription_id: subscriptionIds[0],
      description: 'Atualizações de segurança',
      is_completed: true,
      order: 2
    },
    {
      subscription_id: subscriptionIds[0],
      description: 'Suporte técnico 24/7',
      is_completed: true,
      order: 3
    },
    {
      subscription_id: subscriptionIds[1],
      description: 'Hospedagem do site',
      is_completed: true,
      order: 1
    },
    {
      subscription_id: subscriptionIds[1],
      description: 'Backup semanal',
      is_completed: true,
      order: 2
    }
  ];

  for (const service of services) {
    await client.query(`
      INSERT INTO subscription_services (subscription_id, description, is_completed, "order")
      VALUES ($1, $2, $3, $4)
    `, [service.subscription_id, service.description, service.is_completed, service.order]);
  }

  // Inserir pagamentos de exemplo
  const payments = [
    {
      subscription_id: subscriptionIds[0],
      amount: 2000.00,
      payment_date: new Date('2024-01-15'),
      reference_month: 1,
      reference_year: 2024,
      notes: 'Pagamento via PIX'
    },
    {
      subscription_id: subscriptionIds[0],
      amount: 2000.00,
      payment_date: new Date('2024-02-15'),
      reference_month: 2,
      reference_year: 2024,
      notes: 'Pagamento via PIX'
    },
    {
      subscription_id: subscriptionIds[1],
      amount: 500.00,
      payment_date: new Date('2024-01-05'),
      reference_month: 1,
      reference_year: 2024,
      notes: 'Pagamento via cartão'
    },
    {
      subscription_id: subscriptionIds[1],
      amount: 500.00,
      payment_date: new Date('2024-02-05'),
      reference_month: 2,
      reference_year: 2024,
      notes: 'Pagamento via cartão'
    }
  ];

  for (const payment of payments) {
    await client.query(`
      INSERT INTO payments (subscription_id, amount, payment_date, reference_month, reference_year, notes)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [payment.subscription_id, payment.amount, payment.payment_date, payment.reference_month, payment.reference_year, payment.notes]);
  }

  // Inserir analytics de exemplo
  const analytics = [
    {
      date: new Date('2024-01-01'),
      mrr: 2500.00,
      churn_rate: 0.05,
      avg_lifetime_value: 42500.00,
      active_projects: 3,
      total_revenue: 48000.00
    },
    {
      date: new Date('2024-02-01'),
      mrr: 2500.00,
      churn_rate: 0.03,
      avg_lifetime_value: 45000.00,
      active_projects: 3,
      total_revenue: 51000.00
    }
  ];

  for (const analytic of analytics) {
    await client.query(`
      INSERT INTO analytics (date, mrr, churn_rate, avg_lifetime_value, active_projects, total_revenue)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [analytic.date, analytic.mrr, analytic.churn_rate, analytic.avg_lifetime_value, analytic.active_projects, analytic.total_revenue]);
  }

  // Inserir alertas de exemplo
  const alerts = [
    {
      type: 'milestone_due',
      title: 'Marco próximo do vencimento',
      description: 'Interface do Usuário - Projeto Sistema ERP vence em 3 dias',
      entity_id: projectIds[0],
      entity_type: 'project',
      priority: 'medium'
    },
    {
      type: 'subscription_due',
      title: 'Assinatura vencendo',
      description: 'Pagamento da assinatura TechCorp Ltda vence em 5 dias',
      entity_id: subscriptionIds[0],
      entity_type: 'subscription',
      priority: 'high'
    },
    {
      type: 'upsell_opportunity',
      title: 'Oportunidade de upsell',
      description: 'Cliente TechCorp Ltda tem alto potencial de upsell',
      entity_id: clientIds[0],
      entity_type: 'client',
      priority: 'low'
    }
  ];

  for (const alert of alerts) {
    await client.query(`
      INSERT INTO alerts (type, title, description, entity_id, entity_type, priority)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [alert.type, alert.title, alert.description, alert.entity_id, alert.entity_type, alert.priority]);
  }

  console.log('Dados de exemplo inseridos com sucesso!');
}

setupDatabase();
