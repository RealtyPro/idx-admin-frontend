# Vercel Deployment Instructions for Next.js

1. Push your code to a GitHub, GitLab, or Bitbucket repository.
2. Go to https://vercel.com and sign in with your account.
3. Click "New Project" and import your repository.
4. Vercel will auto-detect Next.js. Click "Deploy".
5. (Optional) Set environment variables in the Vercel dashboard if your app needs them.
6. After deployment, your site will be live at the provided Vercel URL.

## Notes
- Make sure your `package.json` has the correct build and start scripts (Next.js default is fine).
- If you use custom domains, add them in the Vercel dashboard after deployment.
- For API routes or serverless functions, Vercel will handle them automatically.
- If you use environment variables (e.g., API URLs, secrets), add them in the Vercel dashboard under Project Settings > Environment Variables.

## Troubleshooting
- If the build fails, check the Vercel dashboard for logs and errors.
- Ensure all dependencies are listed in `package.json`.
- For monorepos, set the correct root directory in Vercel project settings.
