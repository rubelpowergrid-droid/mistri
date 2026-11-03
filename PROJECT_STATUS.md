# MISTRI Platform - Project Status & Roadmap

**Application Name:** mistri  
**Initial Operational Area:** Thakurgaon, Panchagarh, Dinajpur, Bangladesh  
**Current Phase:** Phase 2 (Admin Dashboard & Mistri Verification Workflow) – **COMPLETED**  
**Next Phase:** Phase 3 (Customer Discovery, Multi-Filter Search & Mistri Profiles)

---

## Phase Status Summary

| Phase | Description | Status | Deliverables Completed |
| :--- | :--- | :--- | :--- |
| **Phase 1** | Project Foundation & Database Setup | ✅ **Completed** | Full-stack Next.js 15+ & TypeScript workspace, Tailwind v4 design system, PWA manifest, Supabase SQL schema migrations, PostGIS spatial indexing & discovery function, Row Level Security (RLS) policies, triggers for ratings/status logging, seed data for Thakurgaon/Panchagarh/Dinajpur & 12 categories, bilingual dictionary (bn/en), core atomic UI & navigation components. |
| **Phase 2** | Admin Dashboard & Verification Workflow | ✅ **Completed** | Mistri 5-step onboarding wizard, private NID document viewer with zoomable lightbox inspection, verification status tracking screen, responsive Admin Dashboard with dynamic KPIs, NID Verification Queue, Category & Subcategory manager, District & Upazila Geo-location manager, Mistris directory manager (suspend/reactivate), admin API endpoints. |
| **Phase 3** | Customer Discovery & Advanced Filters | ⏳ **Next** | Daraz-inspired search engine, multi-criteria filtering drawer, list & map view toggle, detailed Mistri public profile, side-by-side comparison (up to 3), favorites bookmarking. |
| **Phase 4** | GPS, Spatial Radius & Live Tracking | ⏳ Planned | Browser Geolocation API, PostGIS radius search (1–50km), interactive customer/mistri maps, consent-based `location_shares`, Supabase Realtime tracking stream, auto-teardown. |
| **Phase 5** | Booking Management Engine | ⏳ Planned | Customer booking request form with problem photos, Mistri incoming request center with Accept/Reject, status state machine, booking history, agreed-price confirmation. |
| **Phase 6** | Rating, Reviews & Notifications | ⏳ Planned | 5-criteria rating modal restricted to completed bookings, automated rating recalculation, admin moderation, FCM push notifications & in-app notifications center. |
| **Phase 7** | Comprehensive Testing & MVP Launch | ⏳ Planned | RLS security audit, cross-browser responsive testing, location accuracy testing, production environment configuration and deployment guide. |
| **Phase 8** | Native Mobile Applications (Flutter) | ⏳ Planned | Flutter mobile application for Android & iOS sharing the same Supabase backend. |

---

## Phase 2 Deliverables Breakdown
- [x] **Mistri 5-Step Onboarding Wizard (`/onboarding`):**
  - Step 1: Personal Info (Full Name, Phone, DOB, Gender, Avatar photo upload).
  - Step 2: NID Identity Verification (NID Number, secure Front & Back document previews).
  - Step 3: Geographic Work Area (District, Upazila, Area, Street address, dynamic Max Radius slider).
  - Step 4: Skills & Pricing (Primary category, subcategory multi-select pills, experience years, title, charge model, starting charge).
  - Step 5: Information Review & Submission.
- [x] **Worker Verification Status Screen (`/onboarding/status`):**
  - Application progress tracker (`Submitted` -> `Under Review` -> `Approved & Live`).
  - Support helpline and navigation.
- [x] **Admin Layout & Navigation (`/admin`):**
  - Responsive layout with desktop sidebar, mobile menu, quick stats badge, language switcher, and public app return.
- [x] **Executive Admin Dashboard (`/admin/dashboard`):**
  - KPI counter cards: Total Customers, Approved Mistris, Pending NID Verifications, Completed Bookings.
  - District distribution progress bars (Thakurgaon, Panchagarh, Dinajpur).
  - Category booking shares breakdown.
- [x] **NID Verification Queue (`/admin/verification`):**
  - Search by name, phone, or NID; filter by district.
  - Review status indicators (`pending` / `under_review`).
- [x] **High-Security Document Inspector (`/admin/verification/[id]`):**
  - Side-by-side zoomable NID Front and Back photo viewer with lightbox.
  - Complete applicant details verification checklist.
  - Internal remarks & audit note box.
  - Action Modals: Approve Profile, Reject Profile (with mandatory reason), Request Re-upload.
- [x] **Category & Subcategory Manager (`/admin/categories`):**
  - Dynamic CRUD for service categories (Bangla & English names, slug, active toggle).
  - Subcategory management with active switches.
- [x] **Geo-Location Manager (`/admin/locations`):**
  - District and Upazila hierarchy editor for code-free geographic expansion.
- [x] **Mistri Worker Directory (`/admin/mistris`):**
  - Worker directory with ratings, completed jobs, and account suspension / reactivation.
- [x] **Admin REST APIs:**
  - `POST /api/admin/verification/[id]`
  - `GET / POST /api/admin/categories`
  - `GET / POST /api/admin/locations`
