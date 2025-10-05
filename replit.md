# Overview

This is the Evolutia Dashboard - a comprehensive business management application built as a full-stack web application. The system serves as a client relationship management (CRM) and project management platform that helps businesses track clients, manage projects, handle subscriptions, generate proposals, and monitor business metrics through an interactive dashboard.

The application follows a modern full-stack architecture with a React frontend, Express.js backend, and PostgreSQL database. It's designed for business owners and managers who need to track client relationships, project progress, subscription billing, and generate automated proposals.

# User Preferences

Preferred communication style: Simple, everyday language.

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
  - Replit Units: Tracking of Replit unit purchases with value, email, assignee (Camargo/Marquez), and timestamp

## Authentication & Authorization
- Currently uses a simple user system without complex authentication
- User profiles stored in PostgreSQL with basic company information
- No JWT or OAuth implementation - relies on session-based approach

## Business Logic Features
- **Dashboard Analytics**: Real-time KPI calculation, revenue tracking, project pipeline visualization
- **Client Management**: Customer lifecycle tracking from prospect to active client
- **Project Management**: Status-based project tracking with overdue detection
- **Subscription Billing**: Recurring payment management with service checklists
- **Proposal Generation**: Integration with external webhook for automated proposal creation
- **Notification System**: Rule-based alerting for delayed projects, payment reminders, and upselling opportunities
- **Kanban Board**: Drag-and-drop interface for visual project and client management
- **Replit Units Management**: Full CRUD operations for managing Replit unit purchases with monetary values (Brazilian Real), email tracking, assignee selection, and datetime stamps

## External Dependencies

- **Database**: PostgreSQL (expects connection via DATABASE_URL environment variable)
- **Proposal Generation**: External webhook service at `WebhookProposta` environment variable for AI-powered proposal generation
- **Landing Page Database**: Separate PostgreSQL connection via `DatabaseLandingPage` environment variable
- **File Storage**: Local file system storage in `/uploads` directory
- **Fonts**: Google Fonts integration (Inter, Architects Daughter, DM Sans, Fira Code, Geist Mono)
- **Development Tools**: Replit integration for development environment
- **Deployment**: Configured for EasyPanel hosting with Heroku buildpacks