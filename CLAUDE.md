# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React + TypeScript career services platform built with Vite. The application helps users manage their career information, get expert reviews, and obtain certificates. It features role-based access control for regular users, experts, and administrators.

### Tech Stack

- **Frontend**: React 18 + TypeScript, Vite for bundling
- **UI**: Tailwind CSS for styling
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **State Management**: React Context (AuthProvider)
- **Routing**: React Router v6
- **Payments**: Toss Payments integration
- **Testing**: Vitest + React Testing Library
- **Icons**: Lucide React

## Common Development Commands

### Development
```bash
npm run dev          # Start development server (localhost:5173)
npm run build        # Build for production
npm run preview      # Preview production build
```

### Code Quality
```bash
npm run lint         # Run ESLint
npm run test         # Run tests in watch mode
npm run test:run     # Run tests once
npm run test:coverage # Run tests with coverage
npm run test:ui      # Run tests with UI interface
```

## Architecture

### Directory Structure
- `src/components/` - Reusable UI components and admin components
- `src/pages/` - Page-level components for routes
- `src/lib/` - Core integrations (Supabase client, admin security)
- `src/types/` - TypeScript type definitions
- `src/utils/` - Utility functions (admin account creation, validation, error handling)
- `src/hooks/` - Custom React hooks
- `supabase/` - Database migrations, policies, and Edge Functions

### Authentication & Authorization
- Uses Supabase Auth with JWT tokens
- Role-based access control: `individual`, `expert`, `admin`
- Protected routes use `ProtectedRoute` component
- Admin security utilities in `src/lib/adminSecurity.ts`
- Development-only admin account creation in `src/utils/createAdminAccount.ts`

### Database Schema
The app uses several key tables:
- `users` - User profiles with account types
- `profiles` - Extended user information
- `careers` - Career entries (projects, education, certificates, experience)
- `certificates` - Issued certificates
- `payments` - Payment records
- `expert_applications` - Expert verification requests
- `companies` - Company information for verification

### Key Features
1. **User Management**: Registration, login, profile management
2. **Career Tracking**: Add and verify career entries
3. **Expert Review**: Experts can review and verify user career information
4. **Certificates**: Generate official certificates for verified careers
5. **Admin Dashboard**: Manage users, experts, payments, and system settings
6. **Payment Integration**: Toss Payments for service fees

### Environment Configuration
The app requires these environment variables (see `.env.example`):
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- `VITE_TOSS_CLIENT_KEY` - Toss Payments client key
- `VITE_PAYMENT_TEST_MODE` - Set to true for test payments

### Admin Development Setup
In development mode, the app automatically attempts to create an admin account using `src/utils/createAdminAccount.ts`. This helps with testing admin functionality without manual database setup.

### Testing Strategy
- Unit tests for utilities and components in `src/utils/__tests__/` and `src/components/__tests__/`
- Test utilities in `src/test/test-utils.tsx`
- Tests use Vitest with React Testing Library and jsdom environment

### Payment Flow
1. Users select service (verification or certificate)
2. Payment is processed through Toss Payments
3. Success/failure callbacks update database records
4. Services are delivered after successful payment

## Important Notes

- The app uses Row Level Security (RLS) policies in Supabase for data protection
- Admin functions have additional security checks beyond basic authentication
- All API calls go through the Supabase client for consistent security
- The codebase includes comprehensive error handling and validation
- Database migrations and schema changes are managed through the `supabase/` directory