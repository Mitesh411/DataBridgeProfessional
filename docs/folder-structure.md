# Folder Structure

This document provides a breakdown of the DataBridge Pro repository and the purpose of each directory and key file.

## 📁 Root Directory

```text
.
├── docs/                   # Project documentation (Markdown)
├── src/                    # Frontend source code
├── .env.example            # Template for environment variables
├── index.html              # Entry point for the Vite application
├── package.json            # Project dependencies and scripts
├── testDbConnectionPlugin.ts # Vite plugin for backend API simulation
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite build and server configuration
```

## 📁 `src/` Directory

The `src/` directory contains the React application logic and UI components.

```text
src/
├── App.tsx                 # Main application component and wizard logic
├── index.css               # Global styles and Tailwind CSS directives
├── main.tsx                # React application entry point
└── types.ts                # TypeScript interfaces and type definitions
```

### Key Source Files

- **`App.tsx`**: The heart of the application. It manages the multi-step state, handles API interactions, and renders the specific step components (`ConnectionStep`, `TableListingStep`, `MappingStep`, `TransferStep`).
- **`types.ts`**: Centralized location for all shared types, ensuring type safety across the frontend and when interacting with the API plugin.
- **`index.css`**: Contains custom Tailwind utilities and global styles, including the "glassmorphism" effects used in the UI.

## 📁 `docs/` Directory

Contains modular documentation files for developers and operators.

- **`README.md`**: High-level overview and quick start.
- **`architecture.md`**: System design and diagrams.
- **`folder-structure.md`**: This file.
- **`development-guide.md`**: Detailed setup and workflow instructions.
- **`operations.md`**: Deployment and configuration.
- **`api-reference.md`**: API endpoint specifications.

## ⚙️ Configuration Files

- **`vite.config.ts`**: Configures the development server, aliases (`@`), and integrates the custom API plugin.
- **`testDbConnectionPlugin.ts`**: Implements the backend logic using Vite's `configureServer` hook. It handles MySQL connections and data transfer batches.
- **`package.json`**: Lists essential dependencies like `react`, `framer-motion`, `lucide-react`, and `mysql2`.
