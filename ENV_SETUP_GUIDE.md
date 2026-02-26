# Environment Variables Setup Guide

## Overview
This project now uses environment variables to manage API URLs and other configuration settings. This prevents hardcoding sensitive information and makes it easier to switch between different environments (development, staging, production).

## Setup Instructions

### 1. Create Environment File

Create a `.env.local` file in the root directory of this project (idx-admin) with the following content:

```env
# Base URL for your backend API
NEXT_PUBLIC_API_BASE_URL=https://Robert.webnapps.net/api
```

### 2. Environment-Specific URLs

You can create different environment files for different environments:

- `.env.local` - for local development (highest priority, never committed)
- `.env.development` - for development environment
- `.env.production` - for production environment

**Example configurations:**

**Development (.env.local):**
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
```

**Staging:**
```env
NEXT_PUBLIC_API_BASE_URL=https://staging.webnapps.net/api
```

**Production:**
```env
NEXT_PUBLIC_API_BASE_URL=https://Robert.webnapps.net/api
```

### 3. How It Works

The API configuration in `services/Api.tsx` now reads from the environment variable:

```typescript
const axiosInstance: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://demorealestate2.webnapps.net/api/',
});
```

- If `NEXT_PUBLIC_API_BASE_URL` is set, it will use that value
- If not set, it will fall back to the default URL

### 4. Important Notes

- ✅ `.env.local` is already ignored by `.gitignore` and will NOT be committed to git
- ✅ Always use `NEXT_PUBLIC_` prefix for environment variables that need to be accessible in the browser
- ✅ Restart your development server after changing environment variables
- ✅ Never commit sensitive API keys or URLs to version control

### 5. Restart Development Server

After creating or modifying the `.env.local` file, restart your development server:

```bash
npm run dev
```

## Troubleshooting

**Q: Changes to .env.local are not taking effect**
A: Make sure to restart your development server after making changes.

**Q: Getting CORS errors**
A: Verify that your API URL is correct and the backend is running.

**Q: API calls are going to the wrong URL**
A: Check that you've created the `.env.local` file in the root directory (same level as package.json).

