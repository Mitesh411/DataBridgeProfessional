# DataBridge Pro Documentation

Welcome to the official documentation for **DataBridge Pro**, an enterprise-grade database migration assistant.

## 🚀 Overview

DataBridge Pro is a React-based workspace designed to streamline the process of migrating data between MySQL databases. It provides a guided, step-by-step workflow that allows engineers and operations teams to connect to source and target databases, map schemas, and execute data transfers with high visibility and control.

### Purpose

The primary goal of DataBridge Pro is to reduce the friction and risk associated with relational data movement. By providing a structured UI for table selection and column mapping, it eliminates the need for manual script writing and tracking, ensuring consistency and accuracy throughout the migration lifecycle.

## 🛠 Key Features

- **Guided Migration Wizard**: A 4-step process (Connection, Table Selection, Column Mapping, Transfer) that ensures all necessary configurations are met before execution.
- **Dynamic Schema Mapping**: A drag-and-drop interface for binding source columns to target columns, including support for literal/fixed values.
- **Job Queuing**: Ability to sequence multiple migration jobs, which is crucial for maintaining referential integrity across related tables.
- **Real-time Monitoring**: Live log console and progress indicators provide immediate feedback during the data transfer process.
- **Intelligent Validation**: Built-in checks for foreign key dependencies and duplicate key handling.

## ⏱ Quick Start Guide

To get started with DataBridge Pro locally, follow these steps:

### 1. Prerequisites

- **Node.js**: Version 18 or higher.
- **npm**: Version 9 or higher.
- **MySQL Instances**: Access to the source and destination MySQL databases.

### 2. Installation

Clone the repository and install the dependencies:

```bash
git clone <your-repo-url>
cd DataBridgeProfessional
npm install
```

### 3. Environment Setup

Create a local environment file by copying the template:

```bash
cp .env.example .env.local
```

*Note: Ensure you configure the necessary environment variables like `GEMINI_API_KEY` if required for AI-assisted features.*

### 4. Run the Development Server

Start the Vite development server:

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

---

## 📖 Documentation Index

- [Architecture](./architecture.md) - Deep dive into the system design and components.
- [Folder Structure](./folder-structure.md) - Explanation of the project's directory organization.
- [Development Guide](./development-guide.md) - Detailed setup and development workflow.
- [Operations](./operations.md) - Deployment and configuration details.
- [API Reference](./api-reference.md) - Documentation for the backend simulation API.
