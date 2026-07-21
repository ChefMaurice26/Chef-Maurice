# Chef Maurice's Kitchen Version 13.1

## Included fixes
- Separate owner sign-in protected by Supabase role and active-status checks.
- Complete password-reset page and recovery flow.
- Live order viewing and order-status updates.
- Owner menu manager for adding, editing, hiding, selling out, and deleting items.
- Shared Supabase storefront configuration so owner menu changes appear to customers on every device.
- Online ordering pause/resume control.

## Required setup
1. In Supabase SQL Editor, run `supabase-setup-v13.1.sql` once.
2. In Authentication > URL Configuration, add:
   - `https://YOUR-DOMAIN/admin.html`
   - `https://YOUR-DOMAIN/reset-password.html`
   - Your preview-domain versions while testing.
3. Upload all Version 13.1 files to the GitHub `main` branch.
4. Deploy with Vercel: Vite, build `npm run build`, output `dist`.
5. Sign in at `/admin.html`, open Menu Manager, make one small change, and verify it appears on `/index.html` in an incognito window.

## Important
The publishable Supabase key in browser JavaScript is expected to be public. Security depends on Row Level Security policies, including those installed by the SQL file. Never place the Supabase service-role key in this project.
