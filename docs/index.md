# DataBridge Pro Documentation Index

Welcome to the comprehensive documentation suite for **DataBridge Pro**, an enterprise-grade database migration assistant.

## 🚀 Project Overview

DataBridge Pro is a guided, step-driven React application designed to simplify and secure relational database migrations. By offering a intuitive visual interface, teams can effortlessly map schemas, sequence transfer queues, execute batched transfers, and resolve foreign key order constraints between MySQL instances—all without drafting custom SQL scripts or risking data corruption.

### Key Aspects

- **Connection Setup**: Dual database forms enabling secure connections, complete with instant testing and diagnostic responses.
- **Table Listing**: Automatic metadata exploration, statistics discovery, and structural schema previews.
- **Column Mapping**: Interactive, drag-and-drop source-to-destination field binding, fallback overrides, and auto-suggest utilities.
- **Job Queuing**: Dynamic execution sequencing, ensuring parent tables resolve before dependent entities.
- **Batched Transfer Pipeline**: Dynamic data flows executing safe `INSERT` batches, complete with duplicate detection options and transactional integrity checks.

---

## 📖 Architecture & Design Documentation

Deep dives into design topologies, metadata structures, and application behaviors.

- ⚙️ **[REST API Reference](./architecture/api.md)**: Specification for endpoints, payloads, injection safeguards, and schema handlers.
- 🗃 **[Database Schema Design](./architecture/database.md)**: Relational ERD mapping operational projects, mappings, runs, and chronological logs.
- 📊 **[Object Class Design](./architecture/classes.md)**: Object-oriented representation of frontend views, models, and background services.
- 🏗 **[High-Level Architecture](./architecture.md)**: System interactions, components breakdown, and Mermaid request flow diagrams.

---

## 🛠 Guides & Operational References

Instructions for developers, operators, and compliance auditing.

- 🏁 **[System Overview & Quick Start](./README.md)**: Installation, prerequisites, and brief operational instructions.
- 📂 **[Folder Structure](./folder-structure.md)**: Guide to repository organization and configuration assets.
- 💻 **[Development Guide](./development-guide.md)**: Tech stack description, scripts, and local developer workflows.
- ⚡ **[Operations & Deployment Guide](./operations.md)**: Hosting paradigms, CI/CD integrations, and security controls.
- 🛡 **[STRIDE Threat Model Report](./stride-analysis-report.md)**: Threat modeling, control validations, and mitigation strategies.
