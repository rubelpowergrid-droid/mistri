# MISTRI Platform - Project Status & Roadmap

**Application Name:** mistri  
**Initial Operational Area:** Thakurgaon, Panchagarh, Dinajpur, Bangladesh  
**Current Phase:** Phase 1 (Project Foundation & Database Setup) – **COMPLETED**  
**Next Phase:** Phase 2 (Admin Dashboard & Mistri Verification Workflow)

---

## Phase Status Summary

| Phase | Description | Status | Deliverables Completed |
| :--- | :--- | :--- | :--- |
| **Phase 1** | Project Foundation & Database Setup | ✅ **Completed** | Full-stack Next.js 15+ & TypeScript workspace, Tailwind v4 design system, PWA manifest, Supabase SQL schema migrations, PostGIS spatial indexing & discovery function, Row Level Security (RLS) policies, triggers for ratings/status logging, seed data for Thakurgaon/Panchagarh/Dinajpur & 12 categories, bilingual dictionary (bn/en), core atomic UI & navigation components. |
| **Phase 2** | Admin & Mistri Verification Workflow | ⏳ **Next** | Admin login & analytics dashboard, Mistri multi-step onboarding & secure NID upload, private storage bucket with signed URLs, Admin verification queue & document inspector. |
| **Phase 3** | Customer Discovery & Advanced Filters | ⏳ Planned | Daraz-inspired search engine, multi-criteria filtering drawer, list & map view toggle, detailed Mistri public profile, side-by-side comparison (up to 3), favorites bookmarking. |
| **Phase 4** | GPS, Spatial Radius & Live Tracking | ⏳ Planned | Browser Geolocation API, PostGIS radius search (1–50km), interactive customer/mistri maps, consent-based `location_shares`, Supabase Realtime tracking stream, auto-teardown. |
| **Phase 5** | Booking Management Engine | ⏳ Planned | Customer booking request form with problem photos, Mistri incoming request center with Accept/Reject, status state machine, booking history, agreed-price confirmation. |
| **Phase 6** | Rating, Reviews & Notifications | ⏳ Planned | 5-criteria rating modal restricted to completed bookings, automated rating recalculation, admin moderation, FCM push notifications & in-app notifications center. |
| **Phase 7** | Comprehensive Testing & MVP Launch | ⏳ Planned | RLS security audit, cross-browser responsive testing, location accuracy testing, production environment configuration and deployment guide. |
| **Phase 8** | Native Mobile Applications (Flutter) | ⏳ Planned | Flutter mobile application for Android & iOS sharing the same Supabase backend. |

---

## Phase 1 Deliverables Breakdown
- [x] **Next.js 15+ Workspace Setup:** Configured with TypeScript, App Router, `@supabase/ssr`, `lucide-react`, `zod`, `clsx`, `tailwind-merge`.
- [x] **PWA Configuration:** Web App Manifest (`public/manifest.json`) supporting standalone installation on Android & iOS.
- [x] **Design Tokens & Bengali Branding:** Bengali-first typography, mobile bottom navigation, responsive header with district pill switcher and language toggle (`বাংলা` / `EN`).
- [x] **Database Schema Migrations (`supabase/migrations/`):**
  - `20261103000001_initial_schema.sql`: Core tables, enums, constraints, foreign keys.
  - `20261103000002_postgis_and_spatial_indexes.sql`: PostGIS spatial GIST indexes and `search_nearby_mistris` PL/pgSQL function.
  - `20261103000003_rls_security_policies.sql`: Row Level Security policies for all tables.
  - `20261103000004_triggers_and_functions.sql`: Automated booking status logger, rating aggregator, and tracking session cleanup.
- [x] **Seed Data (`supabase/seed.sql`):** Preloaded 3 districts, 23 upazilas, and 12 initial service categories with subcategories in both Bengali and English.
- [x] **Client Infrastructure:** Supabase browser client, server client, and privileged admin client with TypeScript definitions (`src/types/database.types.ts`).
- [x] **Authentication Foundation:** Customer and Mistri registration switcher, login with Password/SMS OTP options, OTP verification screen.
- [x] **Home Discovery Page:** Dynamic 12-category grid, GPS nearby Mistris carousel with distance calculations, and worker recruitment banner.

---

## Known Issues / Backlog Notes
- SMS OTP Gateway adapter uses mock mode in local development until live Bangladesh SMS provider API credentials (SSL Wireless / Greenweb / BulkSMS BD) are plugged into `.env.local`.
- PostGIS functions require PostgreSQL instance with `postgis` extension enabled (standard in Supabase).

