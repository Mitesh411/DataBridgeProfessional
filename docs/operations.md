# Operations Guide

This document covers deployment, configuration, and production considerations for DataBridge Pro.

## 🚀 Deployment

### Production Build

To create a production-ready bundle, run:

```bash
npm run build
```

This will generate an optimized `dist/` directory containing the static assets.

### Hosting Considerations

DataBridge Pro is a Single Page Application (SPA). However, it relies on the backend API functionality provided by the `testDbConnectionPlugin.ts`.

**Important Note for Production**:
The current backend implementation is designed as a Vite development plugin. For a production deployment:
1. **Static Hosting**: The `dist/` folder can be hosted on services like Vercel, Netlify, or AWS S3.
2. **Backend API**: You must port the logic from `testDbConnectionPlugin.ts` (which uses Express-like middleware) to a standalone Node.js/Express server or a set of Serverless Functions (e.g., AWS Lambda, Vercel Functions).

## ⚙️ Configuration Options

### Environment Variables

Ensure the following environment variables are set in your production environment:

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `NODE_ENV` | Yes | `development` | Set to `production` for optimized builds. |
| `GEMINI_API_KEY` | No | - | API key for Gemini AI integration. |

### Transfer Batch Size

The batch size for data transfers is currently hardcoded in the API layer. To adjust this for large-scale migrations, modify the `batchSize` variable in the `postMappedTransfer` function within `App.tsx` or the corresponding logic in the backend plugin.

- **Default**: 500 rows
- **Maximum**: 2000 rows (capped by the Vite plugin)

## 🔄 CI/CD Pipeline

A recommended CI/CD workflow should include:

1. **Linting**: Run `npm run lint` to ensure type safety.
2. **Build**: Run `npm run build` to verify the build process.
3. **Deployment**: Upload the `dist/` directory to your hosting provider.

Example GitHub Actions step:

```yaml
- name: Install dependencies
  run: npm install

- name: Run type check
  run: npm run lint

- name: Build project
  run: npm run build
```

## 🛡 Security and Maintenance

- **Database Access**: Ensure the production environment where the API is hosted has network access (whitelisted IPs) to both the source and target databases.
- **SSL/TLS**: Always use SSL/TLS connections for database traffic, especially when migrating data across public networks.
- **Logs**: Monitor the application logs for transfer failures or connection timeouts. The frontend provides basic logging, but backend-level logging should be implemented in a production-ready server.
