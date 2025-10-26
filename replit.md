# Overview

This is the Evolutia Dashboard - a comprehensive business management application built as a full-stack web application. The system serves as a client relationship management (CRM) and project management platform that helps businesses track clients, manage projects, handle subscriptions, generate proposals, and monitor business metrics through an interactive dashboard.

The application follows a modern full-stack architecture with a React frontend, Express.js backend, and PostgreSQL database. It's designed for business owners and managers who need to track client relationships, project progress, subscription billing, and generate automated proposals.

# Recent Changes

## Oct 26, 2025 - UI/UX Improvements: Clean Focus States, Collapsible Sidebar, and Consistent Filters
- **Focus Outline Removal**: Removed all blue focus rings and outlines throughout the entire application for cleaner visual appearance
  - Applied `focus:outline-none focus:ring-0` to all interactive elements (buttons, inputs, selects, menu items)
  - Affected components: Client form, Project form, Subscription form, Sidebar navigation, Financial page dropdowns
  - Result: Clean, professional appearance without distracting blue outlines on click/focus
- **Collapsible Sidebar**: Implemented desktop sidebar collapse/expand functionality
  - Click logo to toggle between collapsed (80px/icons only) and expanded (256px/icons + text) states
  - Logo scales proportionally using `object-contain` to prevent distortion
  - Smooth 300ms transitions for all sidebar elements
  - Tooltips show menu item names when collapsed
  - Mobile sidebar remains unchanged with hamburger menu
- **Sidebar Border Removal**: Removed border from active menu items (`sidebar-active` class) for cleaner gradient-only highlighting
- **Subscription Filters Refactor**: Converted button-based filters to dropdown select (matching Financial page style)
  - Changed from 4 buttons (Todas, Ativas, Pausadas, Canceladas) to single Select dropdown with label "Status:"
  - Applied consistent styling: `rounded-lg`, `border-border/50`, soft semi-transparent backgrounds
  - Maintains all filter functionality with more compact, professional UI

## Oct 26, 2025 - Complete Transformation: Replit Units → Financial Expense Management
- **Major Refactoring**: Completely transformed the Replit Units tracking page into a comprehensive Financial Expense Management system
  - **Database Schema**: Created new `expenses` table with fields: description, amount, frequency (mensal/anual/semanal/unico), category, startDate, status (ativo/inativo), notes
  - **Backend Updates**:
    - Replaced all ReplitUnit types with Expense types in storage interface (server/storage.ts)
    - Implemented PostgresStorage methods: getExpenses(), getExpense(), createExpense(), updateExpense(), deleteExpense()
    - Created API routes at /api/despesas (replacing /api/unidades-replit) with proper validation and date conversion
  - **Database Migration**: Created expenses table and removed old replit_units table via Node.js migration script
  - **Frontend Refactoring** (client/src/pages/replit.tsx):
    - Page title: "Unidades Replit" → "Gestão Financeira"
    - Form fields completely redesigned: Descrição, Valor (R$), Periodicidade, Categoria, Data de Início, Status, Observações
    - Statistics cards: Show expense totals grouped by frequency (Mensal, Anual, Semanal, Único)
    - Chart visualization: Expense breakdown by frequency with total amounts and quantities
    - Filters: Replaced button-based filters with dropdown selects for Periodicidade (Todos/Mensal/Anual/Semanal/Único) and Status (Todos/Ativo/Inativo) with soft, rounded styling
    - Table columns: Descrição | Valor | Periodicidade | Categoria | Data de Início | Status | Ações
    - Excel export removed: Export functionality has been completely removed from the page
  - **Navigation**: Sidebar updated from "Servidores" to "Gestão Financeira" with DollarSign icon
  - **Data Preservation**: All date formatting in pt-BR locale (DD/MM/YYYY), currency in R$, proper ISO date conversion for API calls

## Oct 26, 2025 - Subscription Form UI Refactor with Collapsible Sections
- **UX Improvement**: Refactored "Nova Assinatura" (New Subscription) popup to use collapsible sections for better organization
  - **Four organized sections**:
    1. **Informações Básicas** (Basic Information) - Client selection, billing day, monthly amount - marked as "Obrigatório" (Required)
    2. **Observações** (Notes) - Client notes textarea - marked as "Opcional" (Optional)
    3. **Credenciais de Acesso** (Access Credentials) - Multiple credentials management - shows count badge when credentials exist
    4. **Arquivos** (Files) - File upload and management - shows count badge with total files (existing + pending)
  - **Improved UX**: All sections start collapsed by default, allowing users to focus on one section at a time
  - **Visual indicators**: Each section has icons (Info, MessagesSquare, Key, FileText) and chevron arrows (down/right) to indicate open/closed state
  - **Interactive triggers**: Click section headers to expand/collapse, with smooth transitions and hover effects
  - **Maintained functionality**: All existing features (credentials CRUD, file upload, validation) preserved without changes
  - **Better navigation**: Cleaner visual hierarchy makes it easier to navigate long forms

## Oct 8, 2025 - Complete URL Translation to Portuguese Brazilian
- **URL Translation**: All website routes and API endpoints translated from English to Portuguese Brazilian
  - Frontend routes: /clients → /clientes, /projects → /projetos, /subscriptions → /assinaturas, /proposals → /propostas, /replit → /servidores
  - Backend API routes: /api/clients → /api/clientes, /api/projects → /api/projetos, /api/subscriptions → /api/assinaturas, /api/proposals → /api/propostas, /api/alerts → /api/alertas, /api/replit-units → /api/unidades-replit
  - Sub-resources translated: /costs → /custos, /services → /servicos, /payments → /pagamentos, /interactions → /interacoes, /unread → /nao-lidos
  - Automatic redirects configured: Old English URLs automatically redirect to new Portuguese URLs for backward compatibility
  - All frontend API calls and navigation links updated to use Portuguese routes consistently

## Oct 8, 2025 - Deploy Configuration for Easypanel
- **Deployment Setup**: Configured project for Easypanel deployment using Heroku buildpacks (heroku/builder:24)
- **Security Fix (CRITICAL)**: Removed hardcoded PostgreSQL credentials from server/routes.ts
  - All proposal routes now require DatabaseLandingPage environment variable
  - No fallback credentials - fails safely if env var not configured
- **Build Optimization**: Created .slugignore to reduce deployment package size
- **Environment Variables**: Updated .env.example with all required and optional configuration
- **Documentation**: Created comprehensive DEPLOY.md with:
  - Step-by-step Easypanel deployment instructions
  - Environment variable documentation
  - Migration strategies and troubleshooting guide
  - Security best practices
- **Procfile**: Updated to execute database migrations before server startup

## Oct 6, 2025
- Fixed project date editing bug: Dates (startDate, dueDate) are now properly converted to ISO strings before sending to backend API
- Updated Dashboard: "Pipeline Ativo" changed to "Faturamento" with "Projetos" badge, showing total value of all projects
- Added missing project status filters: "Concluído" and "Cancelado" buttons on Projects page
- Corrected Portuguese translation: "Completado" → "Concluído" throughout the application
- Enhanced subscription form with searchable Sheet component for client selection

# User Preferences

Preferred communication style: Simple, everyday language.
Language: Brazilian Portuguese

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety
- **Styling**: Tailwind CSS with a dark theme design system using custom CSS variables
- **Component Library**: Radix UI primitives with shadcn/ui components for consistent design
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **Forms**: React Hook Form with Zod validation for type-safe form handling
- **Build Tool**: Vite for fast development and optimized production builds
- **Charts**: Recharts for data visualization and analytics displays

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript for full-stack type safety
- **API Design**: RESTful endpoints with JSON responses
- **File Handling**: Multer middleware for file uploads (images, PDFs)
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Schema Validation**: Zod schemas shared between frontend and backend
- **Build Process**: Custom build script using esbuild for server bundling

## Database Design
- **Primary Database**: PostgreSQL with connection pooling via pg library
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Key Entities**:
  - Users: Authentication and user profiles
  - Clients: Customer information with stats tracking (active subscriptions, project counts)
  - Projects: Project management with client relationships and status tracking
  - Subscriptions: Recurring billing with client relationships and service checklists
  - Payments: Payment tracking linked to subscriptions with file attachments
  - Interactions: Client communication history
  - Alerts: System notifications for business events
  - Notification Rules: Configurable business rule engine
  - Expenses: Financial expense tracking with description, amount, frequency (mensal/anual/semanal/unico), category, start date, and status

## Authentication & Authorization
- Currently uses a simple user system without complex authentication
- User profiles stored in PostgreSQL with basic company information
- No JWT or OAuth implementation - relies on session-based approach

## Business Logic Features
- **Dashboard Analytics**: Real-time KPI calculation, revenue tracking, project pipeline visualization
- **Client Management**: Customer lifecycle tracking from prospect to active client
- **Project Management**: Status-based project tracking with overdue detection
- **Subscription Billing**: Recurring payment management with service checklists. Enhanced client selection in subscription form with searchable sheet interface for better UX when selecting clients from the database.
- **Proposal Generation**: Integration with external webhook for automated proposal creation
- **Notification System**: Rule-based alerting for delayed projects, payment reminders, and upselling opportunities
- **Financial Expense Management**: Complete expense tracking system with CRUD operations, categorization by frequency (monthly/annual/weekly/one-time), category filtering, status management (active/inactive), and visual analytics with charts showing expense breakdown

## External Dependencies

- **Database**: PostgreSQL (expects connection via DATABASE_URL environment variable)
- **Proposal Generation**: External webhook service at `WebhookProposta` environment variable for AI-powered proposal generation
- **Landing Page Database**: Separate PostgreSQL connection via `DatabaseLandingPage` environment variable
- **File Storage**: Local file system storage in `/uploads` directory
- **Fonts**: Google Fonts integration (Inter, Architects Daughter, DM Sans, Fira Code, Geist Mono)
- **Development Tools**: Replit integration for development environment
- **Deployment**: Configured for EasyPanel hosting with Heroku buildpacks