# Deploy no EasyPanel com Heroku Buildpacks

## Pré-requisitos

1. Conta no EasyPanel
2. Repositório Git com o código
3. Banco de dados PostgreSQL configurado

## Configuração das Variáveis de Ambiente

No EasyPanel, configure as seguintes variáveis de ambiente:

```bash
NODE_ENV=production
PORT=3000
DATABASE_URL=postgres://username:password@host:port/database?sslmode=disable
WebhookProposta=https://your-webhook-url.com/webhook/endpoint
DatabaseLandingPage=postgres://username:password@host:port/database?sslmode=disable
```

## Passos para Deploy

### 1. No EasyPanel

1. Acesse seu painel do EasyPanel
2. Clique em "Create Service" > "App"
3. Configure:
   - **Name**: evolutia-dashboard
   - **Source**: Git Repository
   - **Repository URL**: URL do seu repositório
   - **Branch**: main
   - **Build Method**: Buildpacks
   - **Builder**: heroku/builder:24

### 2. Configurações de Build

- **Build Command**: Automático (detectado pelo buildpack)
- **Start Command**: `npm start`
- **Port**: 3000

### 3. Variáveis de Ambiente

Adicione todas as variáveis listadas acima na seção "Environment Variables"

### 4. Deploy

1. Clique em "Deploy"
2. Aguarde o build completar
3. Verifique os logs para confirmar que tudo está funcionando

## Estrutura do Projeto

```
├── client/          # Frontend React
├── server/          # Backend Express
├── shared/          # Código compartilhado
├── dist/            # Build de produção
├── Procfile         # Configuração Heroku
├── package.json     # Dependências e scripts
└── .env.example     # Exemplo de variáveis
```

## Scripts Disponíveis

- `npm run dev` - Desenvolvimento local
- `npm run build` - Build de produção
- `npm start` - Iniciar servidor de produção
- `npm run db:push` - Aplicar migrações do banco

## Troubleshooting

### Build Falha
- Verifique se todas as dependências estão em `dependencies` (não `devDependencies`)
- Confirme que a versão do Node.js é compatível (>=18.0.0)
- Se houver erro com plugins do Replit, eles foram removidos da produção

### Erro de Módulo não Encontrado (@replit/*)
- **CORRIGIDO**: Os plugins do Replit agora são carregados apenas em desenvolvimento
- O build de produção não inclui mais dependências específicas do Replit

### Erro de Conexão com Banco
- Verifique se `DATABASE_URL` está correta
- Confirme que o banco está acessível da rede do EasyPanel

### Aplicação não Inicia
- Verifique os logs no EasyPanel
- Confirme que a `PORT` está configurada corretamente
- Verifique se o comando `npm start` está funcionando

### Build Script Personalizado
- Agora usa `build.js` para um processo de build mais robusto
- Verifica automaticamente se todos os arquivos necessários foram criados

## Monitoramento

- Use os logs do EasyPanel para monitorar a aplicação
- Configure alertas para falhas de deploy
- Monitore o uso de recursos (CPU/Memória)