# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Development Commands

### Development Server
```bash
pnpm dev            # Start development server with Turbo
pnpm dev:legacy     # Start development server without Turbo
pnpm dev:https      # Start development server with HTTPS
pnpm dev:all        # Start both dev server and workers
```

### Testing
```bash
pnpm test           # Run all tests (Vitest unit tests)
pnpm test:watch     # Run tests in watch mode
pnpm test:coverage  # Run tests with coverage
pnpm test:browser   # Run browser tests with Vitest
pnpm test:node      # Run Node.js tests
pnpm test:e2e       # Run Playwright E2E tests
```

### Linting & Type Checking
```bash
pnpm lint           # Run all linting (Biome, ESLint, Prettier)
pnpm lint:fix       # Fix all linting issues
pnpm typecheck      # Run TypeScript type checking
```

### Database Operations
```bash
pnpm db:generate    # Generate Drizzle schema
pnpm db:migrate     # Run database migrations
pnpm db:push        # Push schema to database
pnpm db:studio      # Open Drizzle Studio
pnpm db:reset       # Reset database (drop, generate, migrate, push)
pnpm db:seed        # Seed database with test data
```

### Build & Deployment
```bash
pnpm build          # Build for production
pnpm build:vercel   # Build with increased memory (8GB heap)
pnpm start          # Start production server
pnpm analyze        # Analyze bundle size
```

## Architecture Overview

### Core Framework Stack
- **Next.js 15** with App Router - Full-stack React framework
- **TypeScript** - Type safety throughout
- **Tailwind CSS** - Utility-first styling
- **Shadcn/UI** - Component library built on Radix UI
- **Drizzle ORM** - Type-safe database operations
- **PNPM** - Package manager

### Authentication & Authorization
- **NextAuth.js v5** - Core authentication system
- **Better Auth** - Alternative auth provider
- **Payload CMS** - User management for credentials auth
- **Multi-provider support** - OAuth (Google, GitHub, Discord), Magic Link, Credentials, Guest access
- **Role-based access control** - Admin and user roles

### Database & Data Layer
- **PostgreSQL** - Primary database
- **Drizzle ORM** - Database schema and queries (src/server/db/schema.ts)
- **Schema prefix support** - Multi-tenant capable with `DB_PREFIX`
- **Comprehensive schema** - Users, payments, plans, API keys, teams, waitlists

### Content Management
- **Payload CMS v3** - Headless CMS with admin panel
- **Builder.io** - Visual page builder integration
- **MDX** - Rich content with React components
- **Fumadocs** - Documentation system

### Payment Processing
- **Multiple providers** - Lemon Squeezy, Stripe, Polar
- **Subscription management** - Plans, billing, webhooks
- **Usage-based billing** - Flexible pricing models

### Performance & Monitoring
- **Vercel Analytics** - Web analytics
- **PostHog** - Product analytics
- **OpenTelemetry** - Observability
- **Web Workers** - Background processing

## Key Architectural Patterns

### File Structure Convention
```
src/
├── app/                    # Next.js App Router
│   ├── (app)/             # Main app routes
│   ├── (authentication)/  # Auth pages  
│   ├── (dashboard)/       # Protected routes
│   ├── (demo)/           # Demo pages
│   └── api/              # API routes
├── components/            # Reusable UI components
├── server/               # Server-side code
│   ├── actions/          # Server actions
│   ├── services/         # Business logic
│   └── db/              # Database layer
├── lib/                  # Utilities and configurations
└── content/             # Static content (MDX, JSON)
```

### Component Architecture
- **Atomic design** - Primitives → Blocks → Layouts → Pages
- **Server Components first** - Minimize client-side JavaScript
- **Named exports** - Prefer `export const Component = () => {}` over default exports
- **TypeScript interfaces** - Type all props and return values

### Server-Side Patterns
- **Server Actions** - Form handling and mutations (in `server/actions/`)
- **Services** - Business logic and data access (in `server/services/`)
- **Separation of concerns** - Actions call services, components use actions
- **Never use server actions for data fetching** - Use Server Components instead

### State Management
- **Server state** - React Server Components handle most state
- **Client state** - Minimal use of useState/useEffect
- **URL state** - Use `nuqs` for search parameters
- **Form state** - React Hook Form with Zod validation

### Feature Flag System
Shipkit uses environment variables for feature toggles:
- `NEXT_PUBLIC_FEATURE_AUTH_*_ENABLED` - Authentication providers
- `NEXT_PUBLIC_FEATURE_PAYMENTS_*_ENABLED` - Payment providers
- `NEXT_PUBLIC_FEATURE_CMS_ENABLED` - CMS functionality
- **Graceful degradation** - Features disable cleanly when not configured

## Critical Development Rules

### Code Style (Enforced by Cursor Rules)
- **File size limit** - Keep files under 500 lines
- **Naming conventions** - kebab-case files, PascalCase components, camelCase variables
- **Function style** - Arrow functions for components, function keyword for utilities
- **TypeScript** - Interfaces over types, no enums (use objects/maps)
- **Comments** - Explain "why" not "what", preserve existing comments

### Performance Requirements
- **Minimize client components** - Use 'use client' sparingly
- **Suspense boundaries** - Wrap client components with fallbacks
- **Image optimization** - Use Next.js Image with proper sizing
- **Bundle analysis** - Run `pnpm analyze` before major changes

### Navigation Patterns
- **Prefer Link over router.push** - Use `src/components/primitives/link-with-transition`
- **Button-like links** - Use `<Link className={cn(buttonVariants(...))} ...>`
- **Multi-zone navigation** - Use anchor tags (`<a>`) for cross-zone links

### Database Best Practices
- **Use transactions** - `db.transaction()` for multi-operation changes
- **Avoid booleans** - Use timestamps instead (e.g., `activeAt` vs `isActive`)
- **Type safety** - All queries are type-safe through Drizzle
- **Error handling** - Wrap database operations in try-catch blocks

## Common Tasks

### Adding New Features
1. Check for existing environment variable feature flags
2. Add new feature flag if needed
3. Implement server action in `server/actions/`
4. Add service logic in `server/services/`
5. Create UI components following atomic design
6. Add tests for new functionality

### Database Schema Changes
1. Modify schema in `src/server/db/schema.ts`
2. Run `pnpm db:generate` to create migration
3. Run `pnpm db:migrate` to apply changes
4. Update TypeScript types if needed

### Adding New Routes
1. Create route in appropriate `app/` directory
2. Follow route grouping conventions: `(app)`, `(dashboard)`, etc.
3. Use Server Components when possible
4. Add proper error and loading states

### Testing Strategy
- **Unit tests** - Vitest for utilities and components (tests/unit/\*\*)
- **Integration tests** - Test server actions and services
- **E2E tests** - Playwright for critical user flows (tests/e2e/\*\*)
- **Run tests** - `pnpm test` before committing

## Multi-Zone Architecture

Shipkit supports multi-zone deployments for scalable applications:

### Zone Structure
- **Main zone** - Core app functionality
- **Content zones** - `/docs`, `/blog`, `/ui`, `/tools`
- **Shared authentication** - Single sign-on across zones
- **Consistent design** - Shared component library

### Zone Development
Each zone is a full Shipkit installation with:
- `basePath` and `assetPrefix` configuration
- Environment variables for zone-specific settings
- Anchor tag navigation between zones
- Shared authentication state

## Environment Configuration

### Required for Basic Functionality
```env
DATABASE_URL=                 # PostgreSQL connection string
NEXTAUTH_SECRET=             # Auth encryption key
NEXTAUTH_URL=               # App URL
```

### Optional Feature Enablement
```env
NEXT_PUBLIC_FEATURE_AUTH_GITHUB_ENABLED=true
NEXT_PUBLIC_FEATURE_PAYMENTS_LEMONSQUEEZY_ENABLED=true
NEXT_PUBLIC_FEATURE_CMS_ENABLED=true
BUILDER_IO_API_KEY=          # For visual editing
RESEND_API_KEY=             # For email
```

## Troubleshooting

### Common Issues
- **Type errors** - Run `pnpm typecheck` and fix before proceeding
- **Linting failures** - Run `pnpm lint:fix` to auto-fix issues
- **Database connection** - Check `DATABASE_URL` and run `pnpm db:push`
- **Build failures** - Try `pnpm clean` then `pnpm build`
- **Out of Memory (OOM) errors** - Use `pnpm build:vercel` for larger builds

### Debug Commands
```bash
pnpm deps:check             # Check for outdated dependencies
pnpm check:metadata         # Validate site metadata
pnpm check:performance      # Performance profiling
```

Always run `pnpm lint` and `pnpm typecheck` before committing changes.