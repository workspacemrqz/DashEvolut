# Overview

The Evolutia Dashboard is a comprehensive full-stack web application designed for business management. It functions as a Client Relationship Management (CRM) and project management platform, enabling businesses to track clients, manage projects, handle subscriptions, generate proposals, and monitor key business metrics through an interactive dashboard. Its primary purpose is to assist business owners and managers in overseeing client relationships, project progress, subscription billing, and automated proposal generation.

## Recent Changes (October 26, 2025)

### Mobile Responsiveness Improvements
- **Clean Mobile Menu**: Single elegant floating button (gradient background, rounded-xl, hover scale effect) that opens sidebar overlay
- **Unified Sidebar Design**: Mobile sidebar includes gradient header with logo - no duplicate headers
- **Page Containers**: All pages use `overflow-x-hidden`, `min-w-0` to prevent horizontal scrolling, `pl-16` for menu button clearance
- **KPI Cards**: Adjusted padding from `p-6` to `p-4 sm:p-6` for better mobile spacing
- **Typography**: Implemented responsive text sizes (e.g., `text-lg sm:text-xl lg:text-2xl`)
- **Button Actions**: Simplified button structure in headers, removed unnecessary wrapper divs
- **Filter Controls**: Using responsive pattern `w-full sm:w-[Xpx]` across all pages
- **Gestão Financeira Page**: Completely refactored to match the standard Header pattern used in other pages
- **Sidebar Enhancement**: Mobile sidebar includes gradient header with logo, smooth slide-in animation

# User Preferences

Preferred communication style: Simple, everyday language.
Language: Brazilian Portuguese

# System Architecture

## UI/UX Decisions
- **Mobile-First Responsive Design**: Full mobile responsiveness with card layouts for tables and KPIs, single-column forms on mobile, and appropriate touch targets. All tables (subscriptions, clients, projects, expenses) convert to vertical card layouts on mobile. Proposal list cards stack buttons vertically on mobile. All filter dropdowns and search inputs use full-width on mobile (w-full) and fixed widths only on larger screens (sm:w-[Xpx]) to prevent horizontal overflow.
- **Dark Theme Design System**: Utilizes Tailwind CSS with custom CSS variables for a consistent dark theme.
- **Clean Visuals**: Removal of default focus outlines for a cleaner aesthetic.
- **Collapsible Sidebar**: Desktop sidebar toggles between collapsed (icon-only) and expanded states with smooth transitions.
- **Consistent Filtering**: Standardized dropdown selects for filters across the application.
- **Organized Forms**: Subscription form uses collapsible sections (Basic Info, Notes, Credentials, Files) for improved UX.
- **Localization**: Complete translation of URLs and UI text to Portuguese Brazilian.

## Technical Implementations
- **Frontend**: React 18, TypeScript, Tailwind CSS, Radix UI/shadcn/ui, Wouter for routing, TanStack Query for state management, React Hook Form with Zod validation, Vite for building, Recharts for data visualization.
- **Backend**: Node.js, Express.js, TypeScript, RESTful API, Multer for file uploads, Drizzle ORM for PostgreSQL interactions, Zod for schema validation, esbuild for server bundling.
- **Database**: PostgreSQL with Drizzle Kit for schema management. Key entities include Users, Clients, Projects, Subscriptions, Payments, Interactions, Alerts, Notification Rules, and Expenses.
- **Authentication**: Simple session-based user system without complex JWT or OAuth.

## Feature Specifications
- **Dashboard Analytics**: Real-time KPI tracking, revenue visualization, and project pipeline monitoring.
- **Client Management**: Comprehensive tracking of client lifecycle and interactions.
- **Project Management**: Status-based project tracking with overdue notifications.
- **Subscription Billing**: Recurring payment management, service checklists, and enhanced client selection via a searchable interface.
- **Proposal Generation**: Integration with an external webhook for automated proposal creation.
- **Notification System**: Rule-based alerts for business events (e.g., delayed projects, payment reminders).
- **Financial Expense Management**: Full CRUD operations for expense tracking, categorization (monthly/annual/weekly/one-time), status management, and visual expense breakdown.

# External Dependencies

- **Database**: PostgreSQL (main application data)
- **Proposal Generation**: External webhook service (configured via `WebhookProposta` environment variable)
- **Landing Page Database**: Separate PostgreSQL database (configured via `DatabaseLandingPage` environment variable)
- **File Storage**: Local file system (`/uploads` directory)
- **Fonts**: Google Fonts (Inter, Architects Daughter, DM Sans, Fira Code, Geist Mono)
- **Deployment**: Easypanel hosting with Heroku buildpacks