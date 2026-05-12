# DataBridge Pro

A professional yet approachable React-based database migration assistant that helps teams connect two MySQL databases, map source and target schemas, queue migration plans, and execute structured transfer workflows through a guided UI.

## 📋 Project Description

DataBridge Pro is a step-driven migration workspace designed to simplify relational data movement between systems. Instead of manually tracking table selections and column mappings, users move through a clear process:

1. Configure source and destination database connections.
2. List and select relevant tables from each side.
3. Build and queue column mapping plans.
4. Proceed to transfer execution with visibility into migration context.

The project focuses on reducing migration friction, improving consistency, and making migration setup easier for engineering and operations teams.

## ✨ Features

- **Guided 4-step workflow** for connection, table selection, mapping, and transfer.
- **Dual database connection forms** for source and destination MySQL instances.
- **Table selection workflow** for source and target schemas.
- **Column mapping builder** for source-to-target field binding.
- **Queued migration plans** with add/remove/reorder capabilities.
- **Modern UI/UX** with sidebar navigation, status indicators, and responsive layout.
- **Type-safe frontend code** using TypeScript.

## 🧱 Tech Stack

- **Languages:** TypeScript, CSS, HTML
- **Frontend:** React 19, Vite
- **Styling/UI:** Tailwind CSS, Lucide icons, Motion
- **Backend/Runtime deps (project-level):** Node.js, Express, MySQL2, dotenv
- **Tooling:** TypeScript compiler, Vite build pipeline

## 🚀 Quick Start

```bash
npm install
cp .env.example .env.local
npm run dev
```

Then open:

- `http://localhost:3000`

## 📦 Installation

### Prerequisites

- **Node.js** 18+ (recommended latest LTS)
- **npm** 9+
- Access to your source and destination MySQL databases

### Steps

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd DataBridgeProfessional
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create local environment file:
   ```bash
   cp .env.example .env.local
   ```
4. Start development server:
   ```bash
   npm run dev
   ```

## ⚙️ Configuration

Create or update `.env.local` using `.env.example` as a reference.

### Environment variables

- `GEMINI_API_KEY` — API key used for Gemini AI calls in supported environments.
- `APP_URL` — Application URL used for runtime integration scenarios.

> Note: If you are running outside AI Studio, ensure these values are explicitly set.

## 💻 Usage Examples

### Example workflow: create a migration plan

1. Open the app and stay on **Database Connection**.
2. Enter source database credentials.
3. Enter destination database credentials.
4. Continue to **Table Listing** and choose source/target tables.
5. Go to **Column Mapping** and bind source columns to target columns.
6. Add the mapping to the queue.
7. Reorder queued mappings if needed.
8. Continue to **Data Transfer** and execute your migration process.

### Development commands

```bash
# Start local dev server
npm run dev

# Type-check (lint step in this project)
npm run lint

# Create production build
npm run build

# Preview production build
npm run preview
```

## 🧪 Running Tests

This project currently includes a **type-check validation** command and a plugin test helper script.

```bash
# Type checking
npm run lint

# Optional: run plugin-oriented test helper (if applicable to your setup)
npx tsx testDbConnectionPlugin.ts
```

If you want full unit/integration coverage, consider adding Vitest + React Testing Library and CI workflows.

## 📝 Contributing

Contributions are welcome.

1. Fork the repository.
2. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Commit your changes:
   ```bash
   git commit -m "feat: add your feature"
   ```
4. Push your branch:
   ```bash
   git push origin feature/your-feature-name
   ```
5. Open a pull request with:
   - Problem statement
   - Proposed solution
   - Screenshots (if UI changes)
   - Test notes

## 📄 License

No license file is currently included in this repository.

If you plan to distribute or open-source this project, add a `LICENSE` file (for example, MIT or Apache-2.0) and update this section accordingly.
