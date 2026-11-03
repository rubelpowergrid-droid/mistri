# mistri – Home & Professional Services Marketplace
**আপনার এলাকার দক্ষ ও বিশ্বস্ত মিস্ত্রী, এখন হাতের মুঠোয়**

A modern, high-performance, location-based service marketplace connecting customers with verified skilled professionals (electricians, plumbers, painters, carpenters, masons, appliance repairers, etc.) across Bangladesh, starting in **Thakurgaon**, **Panchagarh**, and **Dinajpur**.

---

## 🚀 Key Architectural Highlights

- **Next.js 15+ App Router & React 19:** Server and client components, strict suspense boundaries, edge-ready API routes.
- **Tiro Bangla Typography:** Google Fonts `Tiro Bangla` integrated globally across all headings, badges, dialogs, and body elements.
- **PostGIS Geospatial Engine:** Spatial indexing (GIST), geodesic distance calculation, and radial boundary searches (`search_nearby_mistris`).
- **Two-Tier Location Privacy:** Worker residential GPS is masked with district/upazila centroids in public searches; real-time high-precision coordinates stream only during active en-route service delivery with automatic teardown on completion.
- **Zero-Trust Document Security:** National ID (NID) cards stored in private Supabase Storage buckets, inspected exclusively by verified administrators via 15-minute expiring signed URLs.
- **5-Criteria Verified Reviews:** Quality, Behaviour, Punctuality, and Pricing ratings restricted to customers of completed bookings, with automated rating recalculation and admin moderation.
- **In-App Realtime Notifications & PWA:** Notification drawer with unread count pills, Web Push Notification prompts, and offline service worker caching (`public/sw.js`).

---

## 🏗️ System & Database Architecture

The platform is backed by a 16-table relational schema with Row Level Security (RLS) enabled on every table:

```
public.users (UUID, phone, role, preferred_language)
  ├── public.customer_profiles (name, address, default_location)
  ├── public.mistri_profiles (nid_number, nid_front, nid_back, experience, rating, verification_status)
  │     ├── public.mistri_skills (categories & subcategories)
  │     └── public.mistri_service_areas (district, upazilas, radius_km)
  ├── public.bookings (booking_number, status, preferred_date, budget, agreed_price)
  │     ├── public.booking_status_logs (history & state transitions)
  │     ├── public.location_shares (ephemeral active GPS tracking pings)
  │     └── public.reviews (4 sub-criteria + overall rating + photos)
  ├── public.categories & subcategories (12 standard trade categories)
  ├── public.districts & upazilas (Thakurgaon, Panchagarh, Dinajpur)
  ├── public.favorites (saved professionals)
  ├── public.notifications & device_tokens (FCM push & web notifications)
  └── public.admin_users & admin_activity_logs (RBAC & audit trail)
```

---

## 🛠️ Quick Start & Local Setup

### 1. Prerequisites
- **Node.js:** `v18.18+` or `v20+` (tested on Node `v26.12.1`)
- **Package Manager:** `npm` or `pnpm`
- **Database:** Supabase project or local PostgreSQL instance with `postgis` and `uuid-ossp` extensions

### 2. Clone & Install
```bash
git clone <repository-url>
cd mistri
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env.local` and configure your credentials:
```bash
cp .env.example .env.local
```

| Key | Description | Default / Example |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL | `https://xyz.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public client anonymous key | `eyJhbGci...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only admin role key | `eyJhbGci...` |
| `SMS_PROVIDER` | SMS OTP Gateway (`sslwireless` \| `greenweb` \| `mock`) | `mock` |
| `NEXT_PUBLIC_DEFAULT_DISTRICT` | Default operating district | `ঠাকুরগাঁও` |

### 4. Database Migrations & Seed Data
Execute the SQL files in order inside your Supabase SQL editor or via `psql`:

```bash
# 1. Base tables, enums, and foreign keys
supabase/migrations/20261103000001_initial_schema.sql

# 2. PostGIS spatial functions and discovery algorithms
supabase/migrations/20261103000002_postgis_and_spatial_indexes.sql

# 3. Row Level Security policies
supabase/migrations/20261103000003_rls_security_policies.sql

# 4. Triggers (auto-recalculating ratings, tracking teardown)
supabase/migrations/20261103000004_triggers_and_functions.sql

# 5. Seed data (Districts, Upazilas, 12 Core Trade Categories)
supabase/seed.sql
```

### 5. Run the Application
```bash
# Development mode
npm run dev

# Production build test
npm run build
npm start
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📱 Application Screens & Features

### 👤 Customer Experience
1. **Home Discovery (`/`):** Hero search banner, quick trade categories, top-rated local professionals carousel, why-choose-mistri features.
2. **Search & Directory (`/search`):** Daraz-style search with side drawer filters (Service distance radius slider, 1-5 star rating filter, minimum experience, admin verified toggle, availability today), plus List and Interactive Map toggle views.
3. **Professional Profile (`/mistri/[id]`):** Verified blue badge, bio, service areas, work photo gallery with zoom lightbox, verified customer reviews with breakdown, sticky mobile booking action bar.
4. **Direct Comparison (`/compare`):** Side-by-side comparison of up to 3 Mistris (pricing, rating, experience, completed jobs).
5. **Booking Request Form (`/bookings/new/[mistriId]`):** Interactive map pin-drop for job site, problem photo attachments, preferred date & time slots, proposed budget in BDT.
6. **Customer Booking Hub (`/bookings`):** Tabbed booking history (All, Active, Pending, Completed, Cancelled) with 1-click calls, live tracking, cancellation, and rating modals.
7. **Live GPS Tracking Screen (`/bookings/[id]/live-track`):** Interactive canvas showing customer location, live moving worker marker, route bearing, remaining distance in meters/km, and countdown ETA.
8. **In-App Notification Drawer:** Accessible from the top header bell icon across all pages. Shows unread badges, filter tabs, push permission banner, and direct links to active jobs.

### 🔧 Mistri (Worker) Experience
1. **5-Step Onboarding Wizard (`/onboarding`):**
   - Step 1: Personal info, phone, and district/upazila selection.
   - Step 2: Trade category and subcategories selection.
   - Step 3: National ID (NID) front and back card upload + live selfie.
   - Step 4: Service radius slider (1 km to 50 km) and base charge.
   - Step 5: Review and submit for admin verification.
2. **Verification Status Tracker (`/onboarding/status`):** Real-time status badge (`pending` -> `under_review` -> `approved` / `rejected`), review notes from admin, and re-upload triggers.
3. **Job Requests Desk (`/requests`):** Real-time incoming job cards with customer area, distance, and problem description. 1-touch Accept or Decline (with mandatory reason).
4. **Mistri Bookings Roster (`/mistri/bookings`):** Active and completed bookings list.
5. **Job Execution & GPS Broadcast (`/bookings/[id]`):** Start journey toggle, live GPS streaming, mark arrived, mark started, mark completed.

### 🛡️ Admin Management & Operations
1. **Admin KPI Dashboard (`/admin/dashboard`):** Total verified workers, active jobs, completed jobs, today's revenue, and quick access queues.
2. **NID Verification Queue (`/admin/verification`):** Filter by pending/under-review applications, inspect worker submitted documents.
3. **Zoomable Document Inspector (`/admin/verification/[id]`):** High-resolution NID document viewer with rotation, zoom, side-by-side comparison with selfie, Approve / Reject buttons with custom admin feedback.
4. **Review Moderation Desk (`/admin/reviews`):** Inspect customer reviews across all 4 criteria, filter flagged reviews, toggle public visibility, or dismiss abuse.
5. **Category Manager (`/admin/categories`):** Add, edit, or toggle trade categories and subcategories.
6. **Location Manager (`/admin/locations`):** Manage districts, upazilas, unions, and coverage zones.
7. **Mistri Directory (`/admin/mistris`):** Search, inspect, suspend, or reactivate service provider accounts.

---

## 🔒 Security & Privacy Guarantees

- **No Public Worker Address Exposure:** Public API endpoints never return the exact GPS coordinates of a worker's residence. Searches calculate distances server-side via PostGIS functions.
- **Ephemeral Tracking Lifespan:** Tracking is strictly restricted to active bookings. A database trigger automatically wipes and terminates location sessions upon job completion or cancellation.
- **Signed Private NID URLs:** Worker identity documents are locked in private storage buckets and only viewable by admins via 15-minute expiring signed URLs.
- **One Review Per Job:** Authenticated customers can only review completed jobs once, preventing rating manipulation.

---

## 📲 Native Mobile Apps (Flutter)

The web codebase is built with responsive mobile-first architecture and PWA capabilities. To launch the native mobile client (Android & iOS) in Phase 8:
- The Flutter codebase will reside in `mobile/`.
- Both apps consume the exact same Supabase PostgreSQL backend, REST endpoints, and WebSocket channels.
