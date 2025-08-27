# Bravend Education Ecosystem Platform

## Overview

The Bravend Education Ecosystem is a comprehensive multi-tenant, white-label SaaS platform designed for corporate learning and business management. The platform serves as both an internal governance tool for holding companies and an external B2B solution that can be sold to other organizations.

The system features a modular architecture supporting learning trails, gamification, community features, analytics, and white-label customization. Built with modern web technologies, it emphasizes scalability, multi-tenancy, and seamless user experience across different organizational contexts.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React + TypeScript**: Modern component-based architecture using functional components and hooks
- **Vite**: Fast development server and build tool optimized for modern frontend development
- **Tailwind CSS + shadcn/ui**: Utility-first CSS framework with pre-built component library for consistent design
- **Zustand**: Lightweight state management for auth and tenant data without Redux complexity
- **React Query**: Server state management with caching, background updates, and error handling
- **Wouter**: Minimalist client-side routing for single-page application navigation

### Backend Architecture
- **Express.js + TypeScript**: RESTful API server with type safety and middleware support
- **JWT Authentication**: Stateless authentication with role-based access control (RBAC)
- **Multi-tenant Architecture**: Tenant isolation through database-level separation and domain-based routing
- **Storage Abstraction**: Interface-based storage layer allowing easy database switching

### Database Design
- **Drizzle ORM**: Type-safe database queries with PostgreSQL dialect
- **Multi-tenant Schema**: Separate tenant contexts with shared user management
- **Core Entities**: Users, Tenants, Learning Trails, Modules, Progress Tracking, Badges, Communities, Events
- **Audit Trail**: Points history and user activity tracking for gamification

### Authentication & Authorization
- **JWT-based Authentication**: Secure token-based auth with configurable expiration
- **Role-based Access Control**: Super admin, admin, educator, and student roles with different permissions
- **Tenant-scoped Access**: Users can only access data within their assigned tenant
- **Session Management**: Token storage and automatic refresh handling

### White-label Customization
- **Dynamic Theming**: CSS variable-based theming with per-tenant color schemes
- **Brand Customization**: Tenant-specific logos, brand names, and welcome messages
- **Feature Toggles**: Configurable feature sets per tenant subscription level
- **Domain Mapping**: Custom domain support for each tenant

### Gamification System
- **Points & Levels**: Comprehensive scoring system with user progression tracking
- **Badge System**: Achievement-based recognition with various badge types
- **Leaderboards**: Tenant-wide and department-specific rankings
- **Progress Tracking**: Module and trail completion with percentage calculations

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL database connection for Neon
- **@radix-ui/react-***: Accessible UI primitives for dropdown menus, dialogs, and form components
- **@tanstack/react-query**: Server state management and data fetching
- **drizzle-orm**: Type-safe database ORM with PostgreSQL support
- **drizzle-zod**: Schema validation integration between Drizzle and Zod

### Development Tools
- **TypeScript**: Static type checking across frontend and backend
- **Vite**: Development server with HMR and optimized builds
- **ESBuild**: Fast JavaScript bundler for production builds
- **Tailwind CSS**: Utility-first CSS framework

### Authentication & Security
- **jsonwebtoken**: JWT token generation and verification
- **bcrypt**: Password hashing and validation
- **connect-pg-simple**: PostgreSQL session store for Express

### UI/UX Libraries
- **class-variance-authority**: Dynamic class name generation for component variants
- **cmdk**: Command palette component for navigation
- **date-fns**: Date manipulation and formatting
- **lucide-react**: Modern icon library

### Validation & Forms
- **zod**: Runtime type validation and schema definition
- **react-hook-form**: Performant form handling with validation
- **@hookform/resolvers**: Integration between react-hook-form and validation libraries