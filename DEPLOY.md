# Guia de Deploy no Easypanel com Heroku Buildpacks

Este guia explica como fazer o deploy deste projeto no Easypanel usando o método Buildpacks com o construtor `heroku/builder:24`.

## 📋 Pré-requisitos

1. Conta no Easypanel
2. Repositório Git com o código do projeto
3. Banco de dados PostgreSQL configurado

## 🚀 Configuração do Deploy no Easypanel

### 1. Criar Novo Projeto no Easypanel

1. Acesse seu painel do Easypanel
2. Clique em "Create New Project"
3. Escolha "Build from Source Code"
4. Selecione o método: **Buildpacks**
5. Configure o builder: `heroku/builder:24`

### 2. Configurar Repositório

1. Conecte seu repositório Git (GitHub, GitLab, etc.)
2. Selecione o branch principal (geralmente `main` ou `master`)
3. O Easypanel detectará automaticamente o projeto Node.js

### 3. Variáveis de Ambiente Obrigatórias

Configure as seguintes variáveis de ambiente no Easypanel:

#### **Obrigatórias:**

```bash
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Session Security
SESSION_SECRET=seu-secret-key-seguro-aleatorio-aqui

# Authentication
LOGIN=admin
SENHA=sua-senha-segura-aqui
```

#### **Opcionais:**

```bash
# Webhook (se usar)
WebhookProposta=https://your-webhook-url.com/webhook/endpoint

# Database alternativo para landing pages (se usar)
DatabaseLandingPage=postgresql://user:password@host:port/database
```

**IMPORTANTE:** Não configure a variável `PORT`. O Easypanel/Heroku buildpack define automaticamente.

### 4. Configuração do Build

O projeto já está configurado para build automático. O Easypanel irá:

1. Executar `npm install` (que automaticamente executa `npm run build` via postinstall)
2. Criar o bundle de produção em `dist/`
3. Preparar o ambiente para execução

### 5. Inicialização

O Procfile está configurado para:
- Executar migrações do banco de dados (`npm run db:push`)
- Iniciar o servidor (`npm start`)

## 🔧 Arquivos de Configuração

### Procfile
```
web: npm run db:push && npm start
```

### .slugignore
Otimiza o tamanho do deploy removendo arquivos desnecessários após o build.

### package.json - Scripts principais
```json
{
  "scripts": {
    "build": "node build.js",
    "start": "cross-env NODE_ENV=production node dist/index.js",
    "postinstall": "npm run build",
    "db:push": "drizzle-kit push"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=8.0.0"
  }
}
```

## 📊 Banco de Dados

### Configuração PostgreSQL

1. **No Easypanel:**
   - Crie um serviço PostgreSQL
   - Copie a URL de conexão
   - Configure como variável `DATABASE_URL`

2. **Migrações:**
   - As migrações são executadas automaticamente no deploy
   - O comando `npm run db:push` sincroniza o schema do banco

### Schema
O schema do banco está definido em `shared/schema.ts` usando Drizzle ORM.

## 🔐 Segurança

### Recomendações:

1. **SESSION_SECRET**: Use um valor aleatório e seguro
   ```bash
   # Gerar um secret seguro:
   openssl rand -base64 32
   ```

2. **Credenciais de Login**: 
   - Altere os valores padrão de `LOGIN` e `SENHA`
   - Use senhas fortes

3. **DATABASE_URL**:
   - Use conexões SSL quando possível
   - Mantenha as credenciais seguras

## 📝 Processo de Build

O build acontece em duas etapas:

### 1. Frontend (Vite)
- Compila React + TypeScript
- Gera bundle otimizado em `dist/public/`
- Processa Tailwind CSS

### 2. Backend (esbuild)
- Compila servidor Express + TypeScript
- Gera bundle em `dist/index.js`
- Mantém dependências externas

## 🌐 Após o Deploy

### Verificações:

1. ✅ Aplicação está online
2. ✅ Banco de dados conectado
3. ✅ Migrações executadas
4. ✅ Login funcionando
5. ✅ Sessões persistindo

### Logs e Debug:

- Use os logs do Easypanel para debug
- Verifique se todas as variáveis de ambiente estão definidas
- Confirme se o banco de dados está acessível

## 🔄 Atualizações

Para atualizar a aplicação:

1. Faça push das alterações para o repositório
2. O Easypanel detectará automaticamente
3. Executará novo build
4. Aplicará migrações se necessário
5. Reiniciará a aplicação

## 📞 Troubleshooting

### Problema: Aplicação não inicia
- Verifique se `DATABASE_URL` está definida
- Confirme se o banco está acessível
- Verifique os logs de erro

### Problema: Erro de build
- Confirme que Node.js >= 18.0.0
- Verifique se todas as dependências estão no package.json
- Revise logs de build no Easypanel

### Problema: Erro de migração
- Verifique permissões do usuário do banco
- Confirme conectividade com o PostgreSQL
- Execute `npm run db:push` manualmente para debug

#### Estratégias para Migrações em Produção:

**Opção 1: Migração Automática (Padrão)**
- As migrações são executadas automaticamente no startup via Procfile
- Pode causar downtime temporário durante migrações grandes
- Simples e funciona bem para aplicações pequenas/médias

**Opção 2: Release Phase (Recomendado para produção)**
Se o Easypanel suportar release phase do Heroku:
1. Crie `release-tasks.sh`:
   ```bash
   #!/bin/bash
   npm run db:push
   ```
2. Adicione ao `Procfile`:
   ```
   release: bash release-tasks.sh
   web: npm start
   ```
3. As migrações rodarão antes do deploy, separadas do startup

**Opção 3: Migração Manual**
Para controle total em janelas de manutenção:
1. Remova `npm run db:push` do Procfile
2. Execute migrações manualmente antes do deploy:
   ```bash
   # Localmente ou via job separado
   npm run db:push
   ```
3. Faça deploy da aplicação

#### Tratamento de Falhas de Migração:

Se uma migração falhar durante o startup:
1. A aplicação não iniciará (comportamento seguro)
2. Revise os logs de erro
3. Corrija o problema no banco ou schema
4. Force novo deploy ou reinicie manualmente

## 📚 Recursos

- [Documentação Easypanel](https://easypanel.io/docs)
- [Heroku Buildpacks](https://devcenter.heroku.com/articles/buildpacks)
- [Drizzle ORM](https://orm.drizzle.team/)

---

**Projeto configurado e pronto para deploy! 🚀**
