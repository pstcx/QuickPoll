# QuickPoll - Digital Survey Tool for Higher Education

## Overview

QuickPoll is a comprehensive web application designed as a digital survey tool for higher education. It allows instructors to create, manage, and conduct real-time polls with students through a simple, anonymous interface. The application features real-time response tracking, QR code sharing, and immediate result visualization.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Routing**: Wouter for lightweight client-side routing
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query for server state management
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **WebSocket**: Native WebSocket Server for real-time updates
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Session Management**: connect-pg-simple for PostgreSQL-based sessions

### Data Storage
- **Primary Database**: PostgreSQL via Neon Database
- **ORM**: Drizzle ORM with type-safe queries
- **Schema**: Three main entities - polls, questions, and responses with proper relations
- **Storage Interface**: DatabaseStorage implementation using PostgreSQL for persistence

## Key Components

### Core Entities
1. **Polls**: Main survey containers with unique codes and active/inactive states
2. **Questions**: Individual poll questions supporting multiple-choice and free-text types
3. **Responses**: User answers linked to questions and polls

### User Interface Pages
- **Home**: Landing page with navigation to main features
- **Create Poll**: Form-based poll creation with dynamic question management
- **Poll Display**: Instructor view for managing active polls with QR codes
- **Join Poll**: Student entry point using poll codes
- **Poll Participation**: Student interface for answering questions
- **Poll Results**: Real-time results visualization with charts

### Real-time Features
- **WebSocket Integration**: Live updates for poll responses and status changes
- **Result Visualization**: Bar charts for multiple-choice questions, text lists for free-text
- **QR Code Generation**: Dynamic QR codes for easy poll access

## Data Flow

1. **Poll Creation**: Instructors create polls with questions through the creation interface
2. **Poll Activation**: Polls are started via the display interface, generating unique codes
3. **Student Participation**: Students join using poll codes or QR codes
4. **Real-time Updates**: WebSocket connections broadcast new responses immediately
5. **Result Visualization**: Results are displayed in real-time with appropriate chart types

## External Dependencies

### Core Libraries
- **@tanstack/react-query**: Server state management and caching
- **@radix-ui/***: Accessible UI primitives for components
- **drizzle-orm**: Type-safe database operations
- **@neondatabase/serverless**: Serverless PostgreSQL connection
- **wouter**: Lightweight routing solution
- **react-hook-form**: Form state management
- **zod**: Schema validation
- **recharts**: Chart visualization library

### UI and Styling
- **tailwindcss**: Utility-first CSS framework
- **shadcn/ui**: Pre-built component library
- **class-variance-authority**: Component variant management
- **lucide-react**: Icon library

### Development Tools
- **vite**: Build tool and development server
- **typescript**: Type safety and developer experience
- **drizzle-kit**: Database migration and schema management

## Deployment Strategy

### Development
- **Local Development**: Vite dev server with hot module replacement
- **Database**: Neon Database with connection pooling
- **Environment**: NODE_ENV=development with comprehensive logging

### Production
- **Build Process**: Vite builds frontend, esbuild bundles backend
- **Server**: Express.js serving both API and static files
- **Database**: PostgreSQL via Neon Database with connection string
- **Static Assets**: Frontend assets served from dist/public

### Configuration
- **Environment Variables**: DATABASE_URL for database connection
- **TypeScript**: Strict mode with path mapping for clean imports
- **Bundling**: ESM format with external packages for optimal performance

## User Preferences

Preferred communication style: Simple, everyday language.

## Changelog

- July 04, 2025: Database integration completed
  - Added PostgreSQL database with Neon Database provider
  - Implemented DatabaseStorage replacing in-memory storage
  - Added Drizzle relations between polls, questions, and responses
  - Successfully migrated from MemStorage to persistent database storage
- July 04, 2025: Initial setup