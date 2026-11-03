# MISTRI Platform - Project Status & Roadmap

**Application Name:** mistri  
**Initial Operational Area:** Thakurgaon, Panchagarh, Dinajpur, Bangladesh  
**Current Phase:** Phase 6 (Rating, Reviews & Notification Engine) – **COMPLETED**  
**Next Phase:** Phase 7 (Comprehensive QA, Security Audit & Launch Documentation)

---

## Phase Status Summary

| Phase | Description | Status | Deliverables Completed |
| :--- | :--- | :--- | :--- |
| **Phase 1** | Project Foundation & Database Setup | ✅ **Completed** | Full-stack Next.js 15+ & TypeScript workspace, Tailwind v4 design system with universal **Tiro Bangla** typography, PWA manifest, Supabase SQL schema migrations, PostGIS spatial indexing & discovery function, Row Level Security (RLS) policies, triggers for ratings/status logging, seed data for Thakurgaon/Panchagarh/Dinajpur & 12 categories, bilingual dictionary (bn/en), core atomic UI & navigation components. |
| **Phase 2** | Admin Dashboard & Verification Workflow | ✅ **Completed** | Mistri 5-step onboarding wizard, private NID document viewer with zoomable lightbox inspection, verification status tracking screen, responsive Admin Dashboard with dynamic KPIs, NID Verification Queue, Category & Subcategory manager, District & Upazila Geo-location manager, Mistris directory manager (suspend/reactivate), admin API endpoints. |
| **Phase 3** | Customer Discovery & Advanced Filters | ✅ **Completed** | Daraz-inspired search engine with multi-criteria filtering drawer, list & map view toggle, 12 categories directory, comprehensive Mistri public profile with portfolio lightbox & verified reviews, side-by-side comparison matrix (up to 3), customer favorites persistence, dynamic search & profile APIs. |
| **Phase 4** | GPS, Spatial Radius & Live Tracking | ✅ **Completed** | Geodesic Haversine & PostGIS calculators, `useGeolocation` browser permission hook with local district fallbacks, `InteractiveMap` canvas with live moving markers and pulse radius, `LocationPickerModal` for manual map-pin adjustment, Customer Live GPS tracking screen (`/bookings/[id]/live-track`), Mistri traveling broadcast toggle screen (`/bookings/[id]`), tracking API endpoints (`/api/tracking/ping`, `[bookingId]`, `stop`). |
| **Phase 5** | Booking Management Engine | ✅ **Completed** | Customer booking request form (`/bookings/new/[mistriId]`) with problem photos and map-pin attachment, Customer Booking Hub with categorized tabs (`/bookings`), Mistri incoming request center with 1-touch Accept/Decline (`/requests`), Mistri bookings dashboard (`/mistri/bookings`), Booking lifecycle REST APIs (`/api/bookings`, `/api/bookings/[id]/status`). |
| **Phase 6** | Rating, Reviews & Notifications | ✅ **Completed** | 5-criteria rating modal restricted to completed bookings (Work Quality, Behaviour, Punctuality, Pricing, Overall), customer review submission API with duplicate-prevention, Admin Review Moderation Desk (`/admin/reviews`), In-app Realtime Notification Drawer (`NotificationDrawer`) with unread count badge & push permissions banner, FCM push token registration API (`/api/notifications/device-token`). |
| **Phase 7** | Comprehensive Testing & MVP Launch | ⏳ **In Progress** | RLS security audit, cross-browser responsive testing, location accuracy testing, production environment configuration and deployment guide. |
| **Phase 8** | Native Mobile Applications (Flutter) | ⏳ Planned | Flutter mobile application for Android & iOS sharing the same Supabase backend. |

---

## Phase 6 Deliverables Breakdown
- [x] **5-Criteria Customer Rating & Review Modal (`src/components/reviews/review-modal.tsx`):**
  - Star sliders for: Work Quality (কাজের মান), Behaviour (ব্যবহার ও আচরণ), Punctuality (সময়ানুবর্তিতা), and Pricing Satisfaction (মজুরি সন্তুষ্টি).
  - Dynamic weighted overall score calculation.
  - Review comment text area and proof photo uploader.
  - Submits directly to `/api/reviews` and updates booking state to `hasReviewed: true`.
- [x] **Review API Endpoints (`/api/reviews`):**
  - `POST /api/reviews`: Validates payload with Zod, restricts submissions to verified completed bookings, prevents double reviews, recalculates mistri average rating.
  - `GET /api/reviews`: Returns public reviews or admin moderation queue.
  - `PATCH /api/reviews`: Admin visibility toggle and moderation flag approval/dismissal.
- [x] **Admin Review Moderation Desk (`/admin/reviews`):**
  - Full review inspection dashboard with breakdown of all 4 sub-criteria.
  - Quick action buttons to Approve, Flag as Inappropriate, or Hide/Restore from public view.
  - Filter by flagged status and search by mistri name or customer name.
- [x] **In-App Notification Center Drawer (`src/components/notifications/notification-drawer.tsx`):**
  - Slide-out drawer accessible from any page via the top navigation bar.
  - Dynamic unread count badge on the notification bell.
  - Categorized notification tabs: All (সকল), Bookings (বুকিং), Verification (ভেরিফিকেশন), and System (সিস্টেম).
  - Web Push Notification permission banner with 1-click browser notification request.
  - Interactive click-throughs directly linking to booking live-track, requests, and verification status.
  - "Mark all as read (সব পঠিত)" and individual read toggles.
- [x] **Device Token & Notifications REST APIs:**
  - `GET /api/notifications`: Retrieves notifications sorted by `created_at desc`.
  - `PATCH /api/notifications`: Marks single or all items as read.
  - `POST /api/notifications/device-token`: Registers/upserts Web/Android/iOS device push tokens.
