CHEF MAURICE VERSION 13 — SEPARATE OWNER PORTAL

CUSTOMER SITE
- index.html
- No owner login, prototype password, or dashboard controls are shown to customers.

OWNER PORTAL
- admin.html
- Live URL after deployment: https://YOUR-VERCEL-DOMAIN/admin.html
- Owner signs in with the Supabase email/password account.
- The profile must have role = owner or manager and is_active = true.
- Displays live orders, full order details, customer email/phone, customer profiles, rewards points, and order status controls.
- Automatically refreshes when orders, order items, or profiles change in Supabase.

IMPORTANT SUPABASE SETUP
1. Authentication > Users must contain the owner email.
2. public.profiles must contain the same user's UUID and:
   role = owner
   is_active = true
3. Authentication > URL Configuration:
   Site URL = your Vercel production or preview URL
   Redirect URLs must include:
   https://YOUR-VERCEL-DOMAIN/admin.html
   https://YOUR-VERCEL-DOMAIN/*

VERCEL SETTINGS
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
Root Directory: ./

UPLOAD
Upload all files inside this folder to the supabase-development branch.
Do not promote to Production until the preview works.
