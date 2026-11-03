# mistri – Home & Professional Services Marketplace
**আপনার এলাকার দক্ষ মিস্ত্রী, এখন হাতের মুঠোয়**

A modern, responsive, location-based service marketplace connecting customers with skilled professionals (electricians, plumbers, painters, carpenters, masons, etc.) across Bangladesh, starting with **Thakurgaon**, **Panchagarh**, and **Dinajpur**.

---

## 🚀 Tech Stack

- **Frontend & Web:** Next.js 15+ (App Router, Server & Client Components), React 19, TypeScript, Tailwind CSS, Lucide Icons, PWA Support.
- **Backend & Database:** Supabase (PostgreSQL 15+), PostGIS Geospatial Extension, Row Level Security (RLS), Supabase Storage, Supabase Realtime (WebSockets).
- **Mobile Apps (Phase 8):** Flutter (Android & iOS).
- **Primary Language:** Bengali (বাংলা) with English fallback.

---

## 🛠️ Project Setup & Installation

### 1. Prerequisites
- Node.js `v18.18+` or `v20+` (tested on Node `v26.12.1`)
- npm or pnpm
- Supabase CLI or active Supabase project with PostGIS extension

### 2. Clone and Install Dependencies
```bash
git clone <repository-url>
cd mistri
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env.local` and set your credentials:
```bash
cp .env.example .env.local
```

### 4. Database Setup & Migrations
Run the SQL migrations in order located in `supabase/migrations/`:
1. `20261103000001_initial_schema.sql`
2. `20261103000002_postgis_and_spatial_indexes.sql`
3. `20261103000003_rls_security_policies.sql`
4. `20261103000004_triggers_and_functions.sql`

Then run the seed script to populate initial districts, upazilas, and the 12 categories:
```bash
# Using Supabase CLI or SQL editor
psql <connection-string> -f supabase/seed.sql
```

### 5. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📱 Service Coverage

- **Thakurgaon:** Sadar, Pirganj, Ranisankail, Haripur, Baliadangi
- **Panchagarh:** Sadar, Boda, Debiganj, Atwari, Tetulia
- **Dinajpur:** Sadar, Birganj, Kaharole, Bochaganj, Birol, Chirirbandar, Parbatipur, Fulbari, Nawabganj, Birampur, Hakimpur, Ghoraghat, Khansama

---

## 🛡️ Security & Privacy Architecture
- **NID Document Protection:** All national identity cards are stored in a private Supabase Storage bucket (`mistri-documents`), accessible only via short-lived signed URLs generated for verified Admins.
- **Location Privacy:** Exact GPS coordinates are never leaked in public search queries. Distances are computed via PostGIS `ST_Distance` on the server.
- **Consent-based Live Tracking:** Mistri live GPS streaming is only enabled during active jobs with customer consent and automatically terminates upon job completion.

