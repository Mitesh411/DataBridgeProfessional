# Development Guide

This guide provides detailed instructions for setting up the development environment, understanding the tech stack, and working with the codebase.

## 🛠 Tech Stack

- **Frontend**: React 19, TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **Database Driver**: `mysql2/promise` (Node.js)

## 🚀 Environment Setup

### 1. Installation

Install all project dependencies:

```bash
npm install
```

### 2. Configuration

DataBridge Pro uses environment variables for configuration. Create a `.env.local` file:

```bash
cp .env.example .env.local
```

| Variable | Description |
| --- | --- |
| `GEMINI_API_KEY` | Optional. Used for AI-assisted mapping or schema analysis. |
| `APP_URL` | The base URL of the application. |

### 3. Running the App

Start the development server:

```bash
npm run dev
```

The server runs on `http://localhost:3000` by default.

## 📜 Available Scripts

- `npm run dev`: Starts the Vite development server with HMR and API plugin.
- `npm run build`: Generates the production-ready build in the `dist/` folder.
- `npm run preview`: Previews the production build locally.
- `npm run lint`: Runs TypeScript type checking (`tsc --noEmit`).
- `npm run clean`: Removes the `dist/` folder.

## 🏗 Development Workflow

### Working with the API Plugin

Since the "backend" is implemented as a Vite plugin (`testDbConnectionPlugin.ts`), you can modify the API logic without needing a separate server process.

- **Modifying Endpoints**: Edit `testDbConnectionPlugin.ts` and the Vite server will automatically restart (or HMR will update the context).
- **Frontend Integration**: Use standard `fetch()` calls in `App.tsx` pointing to `/api/...`.

### Adding New Components

- Place shared UI components in a new `src/components` directory (if expanding the project).
- Use Tailwind CSS for styling to maintain consistency with the existing enterprise design system.
- Ensure all new props and state variables are properly typed in `types.ts`.

## 🧪 Testing

### Manual Verification
1. Open the **Database Connection** step.
2. Enter valid MySQL credentials.
3. Verify that the "Test Connection" button returns a success message.
4. Proceed through the wizard to ensure table listing and mapping work as expected.

### Type Checking
Always run the lint script before committing changes to catch potential type mismatches:

```bash
npm run lint
```
