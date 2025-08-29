# Business Dashboard Application

## Overview

This is a full-stack business dashboard application built for managing client relationships, projects, and business analytics. The system provides comprehensive tools for tracking client interactions, project milestones, financial metrics, and business performance through an intuitive web interface.

The application follows a modern web architecture with a React frontend, Express backend, and PostgreSQL database, designed to help businesses manage their client portfolio and project delivery effectively.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Framework**: Tailwind CSS with shadcn/ui components for consistent, accessible design
- **Build Tool**: Vite for fast development and optimized builds
- **Form Handling**: React Hook Form with Zod validation for type-safe forms

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript for full-stack type safety
- **API Design**: RESTful API with organized route handlers
- **Data Layer**: Drizzle ORM for type-safe database interactions
- **Storage Pattern**: Repository pattern with in-memory storage (development) and PostgreSQL (production)
- **Session Management**: Express sessions with PostgreSQL session store

### Database Design
- **Primary Database**: PostgreSQL with Drizzle ORM
- **Schema Management**: Code-first approach with migrations
- **Key Entities**:
  - Clients: Core customer data with NPS scores, LTV, and upsell potential
  - Projects: Project tracking with status, milestones, and financial metrics
  - Milestones: Project deliverables with approval workflows
  - Interactions: Client communication history
  - Analytics: Business performance metrics
  - Alerts: System notifications for important events

### Development Architecture
- **Monorepo Structure**: Client, server, and shared code in single repository
- **Hot Reloading**: Vite middleware integration for development
- **Type Sharing**: Shared schema definitions between frontend and backend
- **Build Process**: ESBuild for server compilation, Vite for client assets

### UI/UX Architecture
- **Design System**: Dark theme business dashboard with custom CSS variables
- **Component Library**: Radix UI primitives with custom styling
- **Charts**: Recharts for data visualization
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints
- **Accessibility**: ARIA compliant components and keyboard navigation

## External Dependencies

### Core Runtime Dependencies
- **@neondatabase/serverless**: PostgreSQL connection adapter for serverless environments
- **drizzle-orm**: Type-safe SQL query builder and ORM
- **@tanstack/react-query**: Server state management and caching
- **express**: Node.js web framework
- **wouter**: Lightweight React router

### UI and Styling
- **@radix-ui/***: Comprehensive set of accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Type-safe variant API for styling
- **recharts**: Composable charting library built on D3

### Development Tools
- **vite**: Fast build tool and development server
- **typescript**: Static type checking
- **@replit/vite-plugin-***: Replit-specific development tools
- **tsx**: TypeScript execution engine for Node.js

### Form and Validation
- **react-hook-form**: Performant form library
- **@hookform/resolvers**: Form validation resolvers
- **zod**: Schema validation library
- **drizzle-zod**: Zod schema generation from Drizzle schemas

### Utilities and Icons
- **lucide-react**: Modern icon library
- **date-fns**: Date manipulation utilities
- **clsx**: Conditional className utility
- **nanoid**: URL-safe unique ID generator

### Session and Storage
- **connect-pg-simple**: PostgreSQL session store for Express
- **embla-carousel-react**: Carousel component library