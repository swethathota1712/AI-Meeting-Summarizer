# AI Meeting Summarizer

## Overview

This is a full-stack web application that allows users to upload meeting transcripts and generate AI-powered summaries with customizable prompting. The application provides a step-by-step workflow from file upload through summary generation, editing, and sharing via email. Built with a modern tech stack including React, Express, and AI integration for intelligent content processing.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Design**: RESTful endpoints with file upload support using Multer
- **Session Management**: Express sessions with PostgreSQL session store
- **Error Handling**: Centralized error middleware with structured error responses
- **File Processing**: Support for .txt and .docx file uploads with 10MB size limit

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Design**: 
  - Users table for authentication
  - Summaries table storing original transcripts, prompts, and generated/edited summaries
  - Email shares table tracking summary distribution
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **Development Storage**: In-memory storage implementation for development/testing

### AI Integration
- **Provider**: Google Gemini (gemini-2.0-flash-exp) for summary generation
- **Prompt Templates**: Predefined templates for common summary formats (Executive Summary, Action Items, Project Status, Key Decisions)
- **Custom Prompting**: User-defined instructions for tailored summary generation
- **Output Format**: HTML-structured summaries for rich display
- **API Configuration**: Uses GEMINI_API_KEY environment variable for authentication

### Email Service
- **Provider**: Nodemailer with SMTP configuration
- **Features**: Multi-recipient sharing, custom subject lines, optional messages
- **Templates**: HTML email templates with professional formatting
- **Tracking**: Email share history linked to summaries

### Security & Authentication
- **Session-based authentication** with secure cookie configuration
- **File validation** for upload types and size limits
- **Environment-based configuration** for sensitive credentials
- **CORS and security headers** through Express middleware

### Development & Deployment
- **Development**: Hot reload with Vite, TypeScript checking, and development middleware
- **Build Process**: Separate client and server builds with ESBuild for server bundling
- **Database Migrations**: Drizzle Kit for schema management and migrations
- **Environment Variables**: Separate development and production configurations

### Multi-Step Workflow
The application implements a guided 4-step process:
1. **File Upload**: Drag-and-drop or click to upload transcripts
2. **Prompt Configuration**: Select templates or write custom instructions
3. **Summary Generation & Editing**: AI generation with rich text editing capabilities
4. **Email Sharing**: Multi-recipient distribution with tracking

This architecture supports scalable summary generation with a clean separation between content processing, user interface, and data persistence layers.