# DataBridge Pro UI

This repository contains a frontend prototype for an enterprise database migration tool. It provides a multi-step wizard interface that simulates configuring source and destination database connections, selecting tables for replication, mapping schema columns, and monitoring real-time data transfer telemetry. Use it as a starting point or visual proof-of-concept for building complex data pipeline and migration dashboards.

## Prerequisites

- Node.js 20+
- npm

## Quickstart

```bash
# Install dependencies
npm install

# Start the local development server
npm run dev
```

The application will start on `http://localhost:3000`. The wizard flow starts at the Database Connection step and progresses through to the Data Transfer simulation.

## Configuration Options

- `DISABLE_HMR`: Set to `true` in your environment or `.env` file to disable Vite's Hot Module Replacement.
- `GEMINI_API_KEY`: Defined in `.env`, configured in `vite.config.ts` to be injected into the client environment (`process.env.GEMINI_API_KEY`).
- **Dev Server Port:** The dev server explicitly runs on port `3000` and binds to `0.0.0.0` as configured in the `package.json` `dev` script.

## Project Structure

```text
src/
  App.tsx      # Main application component containing the state and all wizard steps (Connection, Tables, Mapping, Transfer)
  types.ts     # TypeScript interfaces and hardcoded mock data for the simulation
  main.tsx     # React DOM rendering entry point
  index.css    # Tailwind CSS entry and global design tokens/theme variables
```

## Full Docs

[Link to full documentation]