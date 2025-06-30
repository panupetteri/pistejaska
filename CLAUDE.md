# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Pistejaska is a React-based web application for tracking board game scores with Firebase backend. It requires Google authentication with whitelisted emails and provides game templates, score tracking, and reporting features.

## Development Commands

- `npm start` - Start development server with Vite
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run analyze` - Analyze bundle size with vite-bundle-visualizer

## Technology Stack

- **Frontend**: React 18 + TypeScript, Vite build system
- **Styling**: Tailwind CSS with PostCSS
- **Backend**: Firebase (Authentication + Firestore)
- **Routing**: React Router DOM
- **State Management**: React hooks with Firebase hooks (react-firebase-hooks)
- **Utilities**: lodash-es, Temporal polyfill
- **Dev Tools**: ESLint, Prettier, TypeScript, vite-plugin-checker

## Architecture

### Core Domain Models
- **Game** (`src/domain/game.ts`): Game definitions with score fields and misc fields
- **Play** (`src/domain/play.ts`): Game session data with players, scores, and metadata
- **User** (`src/domain/user.ts`): User authentication and profile data
- **Comment** (`src/domain/comment.ts`): Comments on game plays

### Key Directories
- `src/domain/` - Core business logic and type definitions
- `src/common/` - Shared utilities, hooks, and components
- `src/admin/` - Admin interfaces for game management
- `src/actions/` - Firebase write operations
- `src/utils/` - Helper functions for specific operations
- `src/migrations/` - Database migration scripts

### Firebase Integration
- Configuration in `src/common/firebase.ts`
- Custom hooks in `src/common/hooks/` for data fetching
- Write operations centralized in `src/actions/`

### Component Structure
- Common UI components in `src/common/components/`
- Feature-specific views at root level (PlayView, ReportGameView, etc.)
- Modular component design with CSS modules for some components

### Routing
React Router with main routes:
- `/` - Game selection
- `/play/:gameId` - New play entry
- `/play/:gameId/:playId` - View/edit existing play
- `/games` - Game list and reports
- `/players` - Player reports
- `/admin` - Game management (requires admin privileges)

### Authentication & Authorization
- Google OAuth via Firebase Auth
- Email whitelist managed in Firebase console
- User data automatically synced to Firestore on login

## Development Notes

- Uses Vite with TypeScript checking and ESLint during development
- Tailwind CSS for styling with utility-first approach
- Custom component library in `src/common/components/`
- Firebase Security Rules manage data access permissions
- Manual testing required before deployments
- Hosted on Netlify with automatic deployment from master branch