# The Himalayan Travels — Next.js Website

Complete travel site with admin panel and Supabase backend.

## Setup (5 steps)

### 1. Create Supabase project at supabase.com
### 2. Run supabase/schema.sql in SQL Editor
### 3. Create admin user:
   - Supabase → Auth → Users → Invite → confirm email
   - Run: INSERT INTO admin_profiles (id, email, full_name, role) VALUES ((SELECT id FROM auth.users WHERE email = 'your@email.com'), 'your@email.com', 'Admin', 'super_admin');
### 4. Copy .env.local.example to .env.local and fill values
### 5. npm install && npm run dev

## Itinerary AI
Add `GEMINI_API_KEY=your-rotated-key` to the ignored `.env.local` file to enable Gemini itinerary generation. The key is read only by the server-side API. `GEMINI_MODEL` is optional and defaults to `gemini-3.8-flash`. OpenRouter and OpenAI remain supported if Gemini is not configured.

## Deploy to Vercel
1. Push to GitHub
2. Import on vercel.com, add env vars, deploy
3. In Vercel Settings → Domains → add thehimalayantravels.com
4. In BigRock → Change Nameservers to Vercel's nameservers
5. Wait 24-48hrs for DNS propagation

## Admin Panel
URL: /admin
Features: Dashboard, Packages CRUD, Destinations, Enquiries, Blog, Settings
