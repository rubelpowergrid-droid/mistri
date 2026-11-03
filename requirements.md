# MISTRI – Complete Project Requirements & Development Blueprint
## AI Coding Agent Development Specification

**Project Name:** mistri  
**Project Type:** Home & Professional Services Marketplace  
**Initial Service Area:** Thakurgaon, Panchagarh & Dinajpur, Bangladesh  
**Target Platforms:** Responsive Web, PWA, Android & iOS  
**Primary Language:** Bengali (বাংলা)  
**Secondary Language:** English  
**Currency:** Bangladeshi Taka (BDT / ৳)

---

# PART 1: PROJECT OVERVIEW

## 1.1 Project Introduction

Build a modern, responsive, location-based service marketplace named **mistri**.

The platform will connect customers with skilled professionals and workers who provide services for residential houses, commercial buildings, offices, shops and other establishments.

Customers will be able to search, filter, compare, select and book service providers according to:

- Customer ratings and reviews
- Professional experience
- Number of completed jobs
- Distance from customer
- Service category
- Price or estimated charges
- Availability
- Verification status
- Personal preference and favorite list

The booking experience should be inspired by Daraz's product discovery and filtering system.

The location experience should be inspired by Uber and Pathao, including GPS-based nearby search, map locations and consent-based live tracking.

The platform must be scalable so that additional districts, services and users can be added without redesigning the entire system.

## 1.2 Main Objectives

1. Help customers easily find reliable local professionals.
2. Give skilled workers an opportunity to find customers.
3. Ensure professional identity verification through admin approval.
4. Provide transparent ratings, reviews and work history.
5. Make booking simple and trackable.
6. Provide GPS-based nearby professional discovery.
7. Build a trusted service marketplace for Bangladesh.

## 1.3 Initial Service Locations

Initially, the application will operate in these three districts:

1. Thakurgaon
2. Panchagarh
3. Dinajpur

Location hierarchy:

Country → District → Upazila → Union/Area → Exact GPS Location.

All locations must be database-driven and manageable through the Admin Dashboard.

The system must support adding new districts and locations in the future without changing application code.

---

# PART 2: USER TYPES AND PERMISSIONS

The platform will have three primary user interfaces.

## 2.1 Customer

Customers can:

- Register and log in.
- Browse service categories.
- Search for professionals.
- Find nearby professionals using GPS.
- Filter and sort professionals.
- View professional profiles.
- Compare multiple professionals.
- Add professionals to favorites.
- Send booking requests.
- Upload work-related photos.
- Track booking status.
- Share their location with the selected professional.
- View the professional's live location during an active booking, with permission.
- Contact professionals.
- Rate and review completed jobs.
- Submit complaints.
- View booking history.

## 2.2 Mistri (Service Provider)

Every professional must have an individual account.

Mistris can:

- Register an account.
- Submit personal and professional information.
- Upload NID documents.
- Upload profile photographs.
- Select multiple service categories.
- Set work experience.
- Add portfolio photographs.
- Set service charges or indicate negotiable pricing.
- Set their availability.
- Receive booking requests.
- Accept or reject booking requests.
- View customer details after booking acceptance according to privacy rules.
- Share live location during an active job when permitted.
- Update booking status.
- View completed jobs.
- View ratings and reviews.
- Manage their profile.
- View their work statistics.

Only admin-approved Mistris can appear in public search results and receive bookings.

## 2.3 Administrator

The administrator will have complete control over the platform.

Admin responsibilities:

- Manage customers.
- Manage Mistri accounts.
- Review NID submissions.
- Approve, reject or suspend Mistris.
- Manage service categories.
- Manage subcategories.
- Manage districts and upazilas.
- Manage bookings.
- Manage complaints.
- Moderate reviews.
- Manage notifications.
- View reports and analytics.
- Manage administrator roles.
- Configure platform settings.

---

# PART 3: SERVICE CATEGORY MANAGEMENT

Initially, create the following service categories:

1. Electrical Services (ইলেকট্রিক্যাল কাজ)
2. Plumbing Services (প্লাম্বিং)
3. Painting Services (রং করার কাজ)
4. Masonry Services (রাজমিস্ত্রীর কাজ)
5. Tin Roofing Services (ঘরের টিনের কাজ)
6. Carpentry Services (কাঠের কাজ)
7. Furniture Services (ফার্নিচারের কাজ)
8. Angle Iron & Metal Fabrication (এঙ্গেল মিস্ত্রী)
9. Thai Glass & Aluminium Services (থাই গ্লাস)
10. Ceiling Services (ঘরের সিলিং)
11. Daily Labour Services (দৈনিক লেবার)
12. Other Services (অন্যান্য)

## 3.1 Category Management Requirements

Admin must be able to:

- Add new categories.
- Edit existing categories.
- Delete or deactivate categories.
- Upload category icons and images.
- Add multiple subcategories.
- Change category display order.
- Enable or disable categories.

Example:

Electrical Services:
- House Wiring
- Fan Installation
- Switch and Socket Repair
- Distribution Board Installation
- Electrical Troubleshooting
- Lighting Installation
- Other Electrical Work

A Mistri can select multiple categories and subcategories.

A customer can search by either main category or subcategory.

---

# PART 4: CUSTOMER APPLICATION

## 4.1 Customer Registration and Authentication

Registration fields:

- Full Name
- Mobile Number
- OTP Verification
- Password or secure authentication method
- Profile Photo (optional)
- Preferred Language

Requirements:

- Mobile number verification is mandatory.
- Prevent duplicate accounts using the same mobile number.
- Provide secure login and logout.
- Provide password recovery.
- Maintain user session securely.

## 4.2 Customer Home Page

The home page should include:

1. mistri Logo and branding.
2. Current location.
3. Location change option.
4. Notification icon.
5. Search bar.
6. Service categories.
7. Nearby professionals.
8. Top-rated professionals.
9. Most experienced professionals.
10. Popular service providers.
11. Recently added professionals.
12. Promotional banners managed by Admin.

The interface must be mobile-first and responsive.

## 4.3 Search and Discovery System

This is one of the most important features.

Build a Daraz-inspired discovery system for professionals.

Customers must be able to search by:

- Professional name.
- Service category.
- Subcategory.
- Location.
- Service description.

Search results should support both List View and Map View.

### Advanced Filters

**Rating Filter**
- 5 stars
- 4 stars and above
- 3 stars and above

**Experience Filter**
- 1+ years
- 3+ years
- 5+ years
- 10+ years

**Completed Jobs**
- 10+
- 50+
- 100+
- 500+

**Price Filter**
- Minimum price
- Maximum price
- Negotiable price

**Distance Filter**
- 1 km
- 3 km
- 5 km
- 10 km
- 20 km
- 50 km
- Entire district

**Other Filters**
- Admin Verified
- Available Today
- Available Tomorrow
- Available Professionals
- Favorite Professionals

### Sorting Options

- Most Relevant
- Highest Rated
- Most Experienced
- Most Completed Jobs
- Lowest Price
- Highest Price
- Nearest First
- Recently Joined

Filters and sorting must work together.

Do not implement fake filters or static search results.

Search results must be fetched from the real database.

## 4.4 Mistri Profile

Each professional must have a detailed public profile.

Profile information:

- Profile photograph.
- Full name.
- Verification badge.
- Professional title.
- Service categories.
- Service subcategories.
- Years of experience.
- Number of completed jobs.
- Average rating.
- Total reviews.
- Service area.
- Approximate distance.
- Availability.
- Price information.
- Portfolio photographs.
- Customer reviews.
- Booking button.
- Favorite button.
- Compare button.

Privacy rules:

- Never display NID information publicly.
- Never expose sensitive documents.
- Do not reveal exact personal GPS location before authorized booking.
- Keep phone-number visibility configurable.
- Default to revealing direct contact details only after booking acceptance or explicit consent.

## 4.5 Compare Professionals

Allow customers to select up to three professionals and compare them side by side.

Comparison fields:

- Rating
- Experience
- Completed jobs
- Review count
- Verification status
- Service charges
- Distance
- Availability

Comparison must be available on both mobile and desktop.

On small screens, use horizontally scrollable comparison columns.

## 4.6 Favorite Professionals

Customers can add professionals to their favorite list.

Features:

- Add to favorites.
- Remove from favorites.
- View all favorites.
- Open professional profiles.
- Book a favorite professional again.

Favorites must be stored in the database.

---

# PART 5: GPS AND LIVE LOCATION SYSTEM

## 5.1 Core Location Concept

The location system must provide an Uber/Pathao-inspired experience.

Customers should not need to manually select their district and upazila every time.

The application should request location permission and use device GPS to identify the current location.

## 5.2 Customer GPS

When a customer opens the application:

1. Request location permission.
2. Detect current GPS coordinates.
3. Display customer position on the map.
4. Search for approved nearby Mistris.
5. Calculate distance.
6. Display nearby professionals.
7. Allow customers to increase search radius.

If GPS is disabled or permission is denied, provide manual map-pin selection and address entry.

## 5.3 Mistri Location

Mistris should have location-related controls:

- Enable Location.
- Set Available / Unavailable.
- Share Location.
- Update Service Area.
- Set maximum service distance.

Mistris must be able to provide an approximate searchable location when available without exposing their exact personal location to everyone.

## 5.4 Nearby Search

Search nearby professionals using geographic coordinates.

Use PostGIS for spatial queries.

Example:

Customer coordinates:
Latitude: Customer GPS latitude
Longitude: Customer GPS longitude

Search professionals within:

- 1 km
- 3 km
- 5 km
- 10 km
- 20 km
- 50 km

Only approved, active and relevant professionals should be returned.

Results must respect:

- Selected service category.
- Professional availability.
- Service area.
- Search radius.
- Account status.

If no nearby professional is found, offer a larger search radius.

## 5.5 Live Location Sharing

Implement consent-based location sharing.

Booking workflow:

1. Customer selects a Mistri.
2. Customer submits booking request and selected service location.
3. Mistri accepts the booking.
4. Customer authorizes location sharing.
5. Mistri can view the customer's shared job location.
6. Mistri may enable live location sharing while travelling.
7. Customer can view the Mistri's live location on the map.
8. Tracking stops when the job is completed or cancelled.

Important privacy rules:

- Never track a Mistri continuously without consent.
- Never track customers without permission.
- Never expose exact location publicly.
- Live tracking must only operate for authorized active bookings.
- Stop tracking automatically after job completion or cancellation.
- Define a location retention policy.
- Do not continue background GPS tracking unnecessarily.

## 5.6 Map and Navigation

Use Google Maps or Mapbox.

Required functionality:

- Customer location marker.
- Mistri location marker.
- Map zoom.
- Distance calculation.
- Directions.
- Open navigation in Google Maps.
- Location accuracy handling.
- Manual map-pin adjustment.

For the initial version, use map navigation links rather than building a complete turn-by-turn navigation engine.

---

# PART 6: BOOKING MANAGEMENT SYSTEM

## 6.1 Booking Concept

Customers independently select their preferred Mistri.

The Admin must not assign a Mistri automatically in the normal booking workflow.

The booking system should be inspired by selecting and purchasing a product on Daraz, but with a professional service request and acceptance process.

## 6.2 Booking Steps

Step 1: Customer selects a service category.

Step 2: Customer searches for professionals.

Step 3: Customer applies filters and sorting.

Step 4: Customer views professional profiles.

Step 5: Customer selects a preferred Mistri.

Step 6: Customer clicks Book Now.

Step 7: Booking form opens.

Booking form fields:

- Selected Mistri
- Selected Service
- Detailed Work Description
- Job Location
- GPS Coordinates
- Address
- Contact Number
- Preferred Date
- Preferred Time
- Estimated Budget (optional)
- Work Photographs (optional)

Step 8: Customer submits booking request.

Step 9: Mistri receives notification.

Step 10: Mistri accepts or rejects the request.

Step 11: If accepted, booking becomes confirmed.

Step 12: Work starts.

Step 13: Mistri marks the job as completed.

Step 14: Customer confirms completion or reports a dispute.

Step 15: Customer submits rating and review.

## 6.3 Booking Status

Use the following booking statuses:

- Pending
- Accepted
- Rejected
- Scheduled
- In Progress
- Completed
- Cancelled
- Disputed

Every status change must be recorded with timestamp and responsible user.

## 6.4 Booking History

Customers and Mistris must have separate booking history pages.

Customers can see:

- Pending bookings
- Accepted bookings
- Active jobs
- Completed jobs
- Cancelled bookings

Mistris can see:

- New requests
- Accepted jobs
- Scheduled jobs
- Active jobs
- Completed jobs
- Rejected requests

## 6.5 Rebooking

Customers should be able to book the same Mistri again from:

- Previous bookings
- Favorite list
- Professional profile

---

# PART 7: RATING AND REVIEW SYSTEM

Only customers associated with a verified completed booking can submit a review.

Rating scale: 1 to 5 stars.

Rating criteria:

1. Work Quality
2. Behaviour
3. Punctuality
4. Pricing Satisfaction
5. Overall Experience

Additional fields:

- Written Review
- Work Photographs (optional)

Display:

- Average Rating
- Total Reviews
- Rating Distribution
- Individual Reviews
- Completed Jobs

Prevent duplicate reviews for the same booking.

Allow Admin to moderate abusive, fraudulent or inappropriate reviews.

Do not allow Mistris or Admins to artificially increase ratings.

---

# PART 8: MISTRI REGISTRATION AND VERIFICATION

## 8.1 Registration Form

Required fields:

Personal Information:
- Full Name
- Mobile Number
- OTP Verification
- Date of Birth (if legally necessary)
- Gender (optional)
- Profile Photograph

Identity Information:
- NID Number
- NID Front Image
- NID Back Image

Location Information:
- District
- Upazila
- Area
- Address
- GPS Coordinates (permission-based)

Professional Information:
- Main Service Category
- Subcategories
- Years of Experience
- Skills Description
- Service Charges
- Work Portfolio
- Maximum Service Distance

## 8.2 Verification Workflow

Registration → Pending → Under Review → Approved / Rejected → Live Profile.

Admin must be able to:

- View submitted information.
- View NID images securely.
- Check mobile verification.
- Approve account.
- Reject account.
- Request corrections.
- Suspend account.
- Add internal verification notes.

Account statuses:

- Pending
- Under Review
- Approved
- Rejected
- Suspended
- Blocked

Only Approved accounts can appear in public search.

An admin approval badge must not be represented as government NID verification unless an authorized verification service has actually been integrated.

---

# PART 9: MISTRI DASHBOARD

Create a professional Mistri Dashboard.

Dashboard overview:

- Total Booking Requests
- Pending Requests
- Accepted Jobs
- Active Jobs
- Completed Jobs
- Average Rating
- Total Reviews

Main sections:

1. Dashboard
2. New Requests
3. My Bookings
4. Active Jobs
5. Completed Jobs
6. My Services
7. My Portfolio
8. Reviews
9. Availability
10. Location Settings
11. Notifications
12. Profile Settings

The Mistri must be able to control availability and update professional information.

---

# PART 10: ADMIN DASHBOARD

Build a separate responsive Admin Dashboard.

## 10.1 Admin Overview

Display real database statistics:

- Total Customers
- Total Mistris
- Approved Mistris
- Pending Mistris
- Rejected Mistris
- Total Bookings
- Active Bookings
- Completed Bookings
- Cancelled Bookings
- Total Reviews
- Open Complaints

Include charts for:

- Daily registrations
- Monthly registrations
- Booking statistics
- District-wise users
- Category-wise bookings
- Mistri performance

All statistics must be dynamically calculated.

## 10.2 Admin Modules

### User Management
- View customers.
- Search customers.
- Edit permitted information.
- Suspend or reactivate accounts.

### Mistri Management
- View all Mistris.
- Search and filter.
- Review profiles.
- Approve or reject applications.
- Suspend or reactivate accounts.

### NID Verification
- Secure document viewer.
- Review submitted information.
- Verification status.
- Admin remarks.
- Verification history.

### Category Management
- Add, edit and delete categories.
- Manage subcategories.
- Upload images and icons.
- Enable and disable services.

### Location Management
- Add districts.
- Add upazilas.
- Manage areas and unions.
- Enable or disable service areas.

### Booking Management
- View all bookings.
- Search by booking ID.
- Filter by status.
- View customer and Mistri details.
- Review disputes.
- Cancel bookings when authorized.

### Review Management
- View reviews.
- Moderate inappropriate content.
- Investigate complaints.

### Complaint Management
- Customer complaints.
- Mistri complaints.
- Dispute resolution.
- Resolution notes.
- Complaint status.

### Notification Management
- Send announcements.
- Send targeted notifications.
- Notify customers.
- Notify Mistris.

### Reports
- Daily report.
- Weekly report.
- Monthly report.
- District-wise report.
- Category-wise report.
- Booking report.
- Mistri performance report.

Allow CSV and PDF export where appropriate.

## 10.3 Admin Roles

Implement role-based access control.

Roles:

- Super Admin
- Verification Admin
- Booking Manager
- Support Admin
- Report Viewer

Maintain an audit log for important administrative actions.

---

# PART 11: NOTIFICATION SYSTEM

Implement:

1. In-App Notifications
2. Push Notifications
3. SMS OTP
4. Optional SMS Alerts

Events:

- New booking request.
- Booking accepted.
- Booking rejected.
- Booking cancelled.
- Job started.
- Job completed.
- New review.
- Account approved.
- Account rejected.
- Complaint update.

Use Firebase Cloud Messaging for push notifications.

Do not send duplicate notifications for the same event.

---

# PART 12: DATABASE ARCHITECTURE

Use PostgreSQL with Supabase and PostGIS.

Suggested database tables:

1. users
2. customer_profiles
3. mistri_profiles
4. mistri_documents
5. categories
6. subcategories
7. mistri_services
8. districts
9. upazilas
10. areas
11. bookings
12. booking_status_logs
13. reviews
14. favorites
15. mistri_portfolio
16. notifications
17. complaints
18. admin_users
19. admin_roles
20. admin_activity_logs
21. location_shares
22. device_tokens

## 12.1 Database Rules

- Use UUID primary keys.
- Use foreign key relationships.
- Use database indexes.
- Use timestamps for important records.
- Use soft deletion where appropriate.
- Prevent duplicate reviews.
- Prevent duplicate favorite records.
- Store GPS coordinates using PostGIS geography types.
- Use transactions for booking status changes.
- Validate all data on the server.
- Never trust client-submitted user roles.

## 12.2 Important Relationships

- One user can have one customer profile.
- One user can have one Mistri profile.
- One Mistri can offer multiple services.
- One category can have multiple subcategories.
- One customer can create multiple bookings.
- One Mistri can receive multiple bookings.
- One completed booking can have one customer review.
- One customer can have multiple favorites.
- One booking can have multiple status history records.

Design the schema so that future payment, subscription and commission modules can be added without major database restructuring.

---

# PART 13: TECHNOLOGY STACK

Use the following recommended architecture.

## Frontend – Web

- Next.js
- React
- TypeScript
- Tailwind CSS
- Responsive UI
- PWA Support

## Mobile Applications

- Flutter
- Android
- iOS
- Shared backend API

## Backend

- Supabase
- PostgreSQL
- Supabase Authentication
- Supabase Storage
- Supabase Realtime
- PostGIS

## Maps

- Google Maps or Mapbox
- Device GPS
- Geographic search
- Directions integration

## Notifications

- Firebase Cloud Messaging
- SMS OTP Provider

## Deployment

- Web: Vercel or equivalent
- Database and Backend: Supabase
- DNS/CDN: Cloudflare
- Android: Google Play Store
- iOS: Apple App Store

Keep all API keys, service credentials and secrets in environment variables.

Never expose secret keys in frontend code.

---

# PART 14: UI/UX DESIGN GUIDELINES

The application must look like a professional, modern marketplace.

Design references:

- Daraz: Product discovery, filters, sorting and comparison.
- Uber: GPS-based location experience.
- Pathao: Map interaction and live location.
- Modern service marketplaces: Professional profiles and booking experience.

## Branding

Application Name: mistri

Recommended primary color: Professional Blue.

Suggested color palette:

- Primary: #2563EB
- Secondary: #0F172A
- Background: #F8FAFC
- Surface: #FFFFFF
- Success: #16A34A
- Warning: #F59E0B
- Error: #DC2626

Use consistent typography, spacing, cards, buttons and icons.

## Responsive Requirements

Support:

- Small mobile phones.
- Large mobile phones.
- Tablets.
- Laptops.
- Desktop monitors.

Use responsive navigation:

Mobile:
- Bottom Navigation for Customer App.
- Mobile-friendly dashboard navigation.

Desktop:
- Sidebar navigation.
- Main content area.
- Responsive tables and dashboards.

## Language

Primary interface language: Bengali.

Provide an English language option.

All UI text should use centralized translation files rather than hardcoded strings throughout the application.

---

# PART 15: SECURITY AND PRIVACY

Security is mandatory.

Implement:

- Supabase Row Level Security.
- Role-based permissions.
- Secure authentication.
- OTP verification.
- Protected document storage.
- Private NID files.
- Server-side validation.
- Rate limiting.
- Secure upload validation.
- Audit logging.
- Database backup.
- Secure session management.

Important:

1. NID images must never be publicly accessible.
2. Customers cannot access other customers' private information.
3. Mistris cannot access other Mistris' private information.
4. Only authorized administrators can review NID documents.
5. Customers cannot create fake completed bookings.
6. Customers cannot review uncompleted bookings.
7. Users cannot modify their own approval status.
8. GPS sharing requires permission.
9. Live tracking must stop after the authorized booking ends.
10. Sensitive data must have an appropriate retention and deletion policy.

Follow applicable Bangladesh data protection, identity-document and privacy requirements.

---

# PART 16: FUTURE BUSINESS FEATURES

Do not make these features mandatory for the initial release, but design the architecture so they can be added later.

1. Online Payment.
2. bKash Integration.
3. Nagad Integration.
4. Rocket Integration.
5. Platform Commission.
6. Premium Mistri Subscription.
7. Featured Mistri.
8. In-App Chat.
9. Customer-Mistri Calling.
10. Promotional Offers.
11. Business Accounts.
12. Advanced Analytics.
13. Referral System.
14. Promotional Coupons.

Initially, customers and Mistris can negotiate job prices directly.

---

# PART 17: DEVELOPMENT ROADMAP

Build the application in phases.

## Phase 1 – Project Foundation
- Project setup.
- Database setup.
- Authentication.
- User roles.
- UI design system.
- Responsive layout.

## Phase 2 – Admin and Verification
- Admin login.
- Admin dashboard.
- Mistri registration.
- NID document upload.
- Approval workflow.
- Category management.
- Location management.

## Phase 3 – Customer Application
- Home page.
- Service categories.
- Search.
- Advanced filtering.
- Sorting.
- Mistri profiles.
- Favorites.
- Comparison.

## Phase 4 – GPS and Maps
- GPS permission.
- Customer location.
- Mistri location.
- Nearby search.
- Distance calculation.
- Map view.
- Consent-based location sharing.
- Live tracking.

## Phase 5 – Booking System
- Booking form.
- Booking request.
- Mistri acceptance.
- Booking status.
- Job completion.
- Booking history.

## Phase 6 – Rating and Notifications
- Rating system.
- Reviews.
- Review moderation.
- Push notifications.
- In-app notifications.

## Phase 7 – Testing and Launch
- Functional testing.
- Security testing.
- Database testing.
- Responsive testing.
- GPS testing.
- Real user testing.
- Production deployment.

## Phase 8 – Native Mobile Applications
- Flutter Android App.
- Flutter iOS App.
- Push notification integration.
- Mobile GPS permissions.
- Store deployment.

---

# PART 18: TESTING REQUIREMENTS

Before launch, verify the following.

### Customer Testing
- Registration and login work.
- Search returns real results.
- Filters work correctly.
- Sorting works correctly.
- Favorites persist.
- Comparison works.
- Booking requests are created.
- Booking history is accurate.
- Ratings are restricted to eligible bookings.

### Mistri Testing
- Registration works.
- NID uploads work securely.
- Pending accounts remain hidden.
- Approved accounts appear in search.
- Rejected accounts cannot receive bookings.
- Booking acceptance works.
- Booking rejection works.
- Availability settings work.
- GPS location works.

### Admin Testing
- Admin authentication works.
- Permissions work.
- Approval workflow works.
- Categories can be managed.
- Locations can be managed.
- Bookings can be monitored.
- Complaints can be resolved.
- Reports show real information.

### Location Testing
- GPS permission handling.
- GPS disabled handling.
- Manual location selection.
- Nearby search accuracy.
- Distance calculation.
- Location sharing permissions.
- Live tracking updates.
- Automatic tracking termination.

### Responsive Testing
Test on:
- Android Chrome.
- iPhone Safari.
- Desktop Chrome.
- Tablet browsers.

---

# PART 19: MVP LAUNCH REQUIREMENTS

The first production version must include:

1. Customer registration and login.
2. Mistri registration and login.
3. NID document submission.
4. Admin approval.
5. Service category management.
6. Search and filtering.
7. Professional profiles.
8. Favorites.
9. Compare professionals.
10. GPS-based nearby search.
11. Customer location selection.
12. Booking requests.
13. Booking acceptance and rejection.
14. Booking status management.
15. Rating and reviews.
16. Admin dashboard.
17. Notifications.
18. Responsive web application.
19. PWA installation support.
20. Security and access control.

Initial service locations must be restricted to Thakurgaon, Panchagarh and Dinajpur.

---

# PART 20: INSTRUCTIONS FOR AI CODING AGENT

You are acting as a Senior Full-Stack Software Architect, UI/UX Designer, Backend Engineer and QA Engineer.

Your responsibility is to build the complete production-oriented mistri application according to this specification.

Follow these instructions strictly.

## Development Rules

1. Read and understand the entire project specification before coding.
2. Create a proper project architecture.
3. Use modular and maintainable code.
4. Use reusable components.
5. Implement real database functionality.
6. Never use fake data as a substitute for production features.
7. Never create decorative buttons without working functionality.
8. Every form must have validation.
9. Every important operation must have proper error handling.
10. Use secure environment variables.
11. Implement proper database migrations.
12. Implement Row Level Security policies.
13. Never expose NID documents publicly.
14. Implement responsive layouts for all screen sizes.
15. Follow Bengali-first UI design.
16. Keep code organized and documented.
17. Avoid unnecessary dependencies.
18. Do not hardcode district, category or user data when it should be database-driven.
19. Do not skip testing.
20. Do not claim a feature is complete until it has been implemented and tested.

## Execution Strategy

Do not attempt to generate the entire application in one uncontrolled coding operation.

Follow the development roadmap phase by phase.

For each phase:

1. Explain the implementation plan briefly.
2. Inspect existing project files.
3. Implement the required features.
4. Create or update database migrations.
5. Test the implemented functionality.
6. Fix errors.
7. Update project documentation.
8. Report what is complete and what remains.

Maintain a PROJECT_STATUS.md file to record completed tasks, pending tasks and known issues.

Maintain a README.md containing installation, configuration and deployment instructions.

Maintain a .env.example file without real credentials.

If a required external service needs an API key, clearly document the requirement and implement a safe configuration mechanism. Never fabricate credentials or claim an external integration works without testing it.

Do not leave core functionality as TODO placeholders.

## Important Development Constraints

- Do not compromise security for convenience.
- Do not expose private GPS information.
- Do not expose NID documents.
- Do not allow unapproved professionals into customer search results.
- Do not allow fake reviews.
- Do not allow unauthorized booking status modifications.
- Do not use mock dashboards in the final implementation.
- Do not sacrifice mobile responsiveness for desktop design.

## Definition of Done

The application is considered ready for MVP launch only when:

- All core customer features work.
- All core Mistri features work.
- Admin management works.
- Booking workflow works end to end.
- GPS nearby search works.
- Location privacy is enforced.
- Ratings and reviews work correctly.
- Database permissions are tested.
- Mobile and desktop layouts are tested.
- Production deployment instructions are documented.

**Begin with Phase 1. First inspect the development environment, create the project architecture and present the implementation plan. Then proceed with the actual development.**

---

# FINAL PROJECT VISION

**mistri – আপনার এলাকার দক্ষ মিস্ত্রী, এখন হাতের মুঠোয়।**

The long-term vision is to build a trusted local service marketplace connecting customers and skilled professionals throughout Bangladesh.

Start with Thakurgaon, Panchagarh and Dinajpur.

Build a reliable system first, launch locally, collect feedback, improve the product and expand district by district.