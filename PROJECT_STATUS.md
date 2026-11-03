# MISTRI Platform - Project Status & Roadmap

**Application Name:** mistri  
**Initial Operational Area:** Thakurgaon, Panchagarh, Dinajpur, Bangladesh  
**Current Phase:** Phase 3 (Customer Discovery, Multi-Filter Search & Mistri Profiles) – **COMPLETED**  
**Next Phase:** Phase 4 (GPS, Spatial Radius & Live Location Tracking)

---

## Phase Status Summary

| Phase | Description | Status | Deliverables Completed |
| :--- | :--- | :--- | :--- |
| **Phase 1** | Project Foundation & Database Setup | ✅ **Completed** | Full-stack Next.js 15+ & TypeScript workspace, Tailwind v4 design system with universal **Tiro Bangla** typography, PWA manifest, Supabase SQL schema migrations, PostGIS spatial indexing & discovery function, Row Level Security (RLS) policies, triggers for ratings/status logging, seed data for Thakurgaon/Panchagarh/Dinajpur & 12 categories, bilingual dictionary (bn/en), core atomic UI & navigation components. |
| **Phase 2** | Admin Dashboard & Verification Workflow | ✅ **Completed** | Mistri 5-step onboarding wizard, private NID document viewer with zoomable lightbox inspection, verification status tracking screen, responsive Admin Dashboard with dynamic KPIs, NID Verification Queue, Category & Subcategory manager, District & Upazila Geo-location manager, Mistris directory manager (suspend/reactivate), admin API endpoints. |
| **Phase 3** | Customer Discovery & Advanced Filters | ✅ **Completed** | Daraz-inspired search engine with multi-criteria filtering drawer, list & map view toggle, 12 categories directory, comprehensive Mistri public profile with portfolio lightbox & verified reviews, side-by-side comparison matrix (up to 3), customer favorites persistence, dynamic search & profile APIs. |
| **Phase 4** | GPS, Spatial Radius & Live Tracking | ⏳ **Next** | Browser Geolocation API, PostGIS radius search (1–50km), interactive customer/mistri maps, consent-based `location_shares`, Supabase Realtime tracking stream, auto-teardown. |
| **Phase 5** | Booking Management Engine | ⏳ Planned | Customer booking request form with problem photos, Mistri incoming request center with Accept/Reject, status state machine, booking history, agreed-price confirmation. |
| **Phase 6** | Rating, Reviews & Notifications | ⏳ Planned | 5-criteria rating modal restricted to completed bookings, automated rating recalculation, admin moderation, FCM push notifications & in-app notifications center. |
| **Phase 7** | Comprehensive Testing & MVP Launch | ⏳ Planned | RLS security audit, cross-browser responsive testing, location accuracy testing, production environment configuration and deployment guide. |
| **Phase 8** | Native Mobile Applications (Flutter) | ⏳ Planned | Flutter mobile application for Android & iOS sharing the same Supabase backend. |

---

## Phase 3 Deliverables Breakdown
- [x] **Categories Directory (`/categories`):**
  - Full catalog of all 12 categories with active worker counts, subcategories list, and direct links to filtered discovery.
- [x] **Daraz-Inspired Discovery & Advanced Search (`/search`):**
  - Instant text search across worker names, titles, categories, and subcategories.
  - Multi-Filter Drawer (mobile) & Sticky Filter Sidebar (desktop):
    - Rating Filter: 5★, 4★+, 3★+
    - Experience Filter: 1+, 3+, 5+, 10+ years
    - Completed Jobs: 10+, 50+, 100+
    - Distance Radius Slider (1 km – 50 km)
    - Toggles: Admin Verified Only, Available Today
    - Category & District drop-down selectors
  - Sorting: Nearest First, Highest Rated, Most Completed Jobs, Most Experienced, Price Low/High.
  - Active filter badges with one-click removal and "Clear All".
- [x] **List View & Interactive Map View Toggle:**
  - Real-time switcher between detailed worker cards and an interactive map view with custom markers, distance indicators, and quick-profile popups.
- [x] **Mistri Detailed Public Profile (`/mistri/[id]`):**
  - Verified badge, rating & review distribution, experience, distance from customer.
  - Subcategories skill badges, bio description, starting charges.
  - Interactive portfolio lightbox image viewer.
  - Verified customer reviews with dates and star ratings.
  - Sticky mobile booking action bar.
- [x] **Side-by-Side Comparison Matrix (`/compare`):**
  - Compare up to 3 professionals side-by-side with horizontal scroll for mobile.
  - Direct 1-click booking per column.
- [x] **Customer Favorites System (`/favorites`):**
  - Saved professionals dashboard with instant removal and 1-click rebooking.
- [x] **Discovery & Profile REST APIs:**
  - `GET /api/mistris/search` (multi-criteria filtering, sorting, pagination)
  - `GET /api/mistris/[id]` (comprehensive profile payload)
