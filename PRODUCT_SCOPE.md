# RealtiPro — IDX Admin Panel
## Complete Product Scope, Features & Module Documentation

> **Prepared for:** Marketing Team  
> **Document Date:** April 13, 2026  
> **Version:** 1.0

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Technology Stack](#2-technology-stack)
3. [Application Architecture](#3-application-architecture)
4. [Authentication & Access Control](#4-authentication--access-control)
5. [Module 1 — Dashboard (Home)](#5-module-1--dashboard-home)
6. [Module 2 — Listings (Property Management)](#6-module-2--listings-property-management)
7. [Module 3 — Blog Management](#7-module-3--blog-management)
8. [Module 4 — Inquiries / Leads Management](#8-module-4--inquiries--leads-management)
9. [Module 5 — Users & Customers](#9-module-5--users--customers)
10. [Module 6 — Testimonials](#10-module-6--testimonials)
11. [Module 7 — Newsletter Subscribers](#11-module-7--newsletter-subscribers)
12. [Module 8 — Neighbourhoods](#12-module-8--neighbourhoods)
13. [Module 9 — Open Houses](#13-module-9--open-houses)
14. [Module 10 — Analytics](#14-module-10--analytics)
15. [Module 11 — Invoices & Billing](#15-module-11--invoices--billing)
16. [Module 12 — Pages (CMS)](#16-module-12--pages-cms)
17. [Module 13 — Contact Submissions](#17-module-13--contact-submissions)
18. [Module 14 — Agents](#18-module-14--agents)
19. [Module 15 — Profile Management](#19-module-15--profile-management)
20. [Module 16 — Settings](#20-module-16--settings)
21. [Module 17 — Password Recovery](#21-module-17--password-recovery)
22. [API Services Layer](#22-api-services-layer)
23. [UI Component System](#23-ui-component-system)
24. [Smart UX Features (Cross-Module)](#24-smart-ux-features-cross-module)
25. [Deployment & Infrastructure](#25-deployment--infrastructure)
26. [Summary of All Modules & Feature Count](#26-summary-of-all-modules--feature-count)

---

## 1. Product Overview

**RealtiPro Admin** is a comprehensive, full-featured real estate administration panel built for real estate agencies, brokers, and agents. It provides a single unified interface to manage every aspect of a real estate business — from property listings and lead management to content publishing, analytics, open-house scheduling, and billing.

### What It Does
- Centralizes all administrative operations for a real estate platform
- Connects directly to a backend REST API (IDX backend service) for live data
- Enables content management, customer engagement tracking, and business analytics
- Supports end-to-end property lifecycle: listing creation → lead capture → CRM sync → conversion tracking

### Who It Is For
- **Real estate agents** managing their own listings and leads
- **Brokers and agencies** overseeing teams of agents
- **Marketing teams** publishing blog content, managing testimonials, and running newsletters
- **Office administrators** tracking inquiries, open houses, and billing

---

## 2. Technology Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 15.3.8 |
| UI Library | React | 18.2.0 |
| Language | TypeScript | 5.3.3 |
| Styling | Tailwind CSS | 3.4.1 |
| Server-State Management | TanStack React Query | 5.79.0 |
| HTTP Client | Axios | 1.9.0 |
| Icon Library | Heroicons + Lucide React | Latest |
| Rich Text Editor | React Quill New | 3.4.6 |
| Drag & Drop | DnD Kit (Core, Sortable, Utilities) | 6.3.1 / 10.0.0 |
| Headless UI Components | Radix UI (Select, Dialog, Tabs, Slider, Switch, Label) | Latest |
| Notifications | React Toastify | 11.0.5 |
| Animations | Tailwindcss-animate | 1.0.7 |
| Testing | Jest + Testing Library | 29.7.0 |

---

## 3. Application Architecture

### Directory Structure

```
app/
├── login/                    ← Public login page
├── register/                 ← Public registration page
├── forgot-password/          ← Password recovery page
├── open-houses/[id]/         ← Public-facing open house detail
├── provider/                 ← React Query provider wrapper
└── admin/                    ← Protected admin panel
    ├── page.tsx              ← Dashboard
    ├── layout.tsx            ← Shared layout (sidebar, nav)
    ├── listings/             ← Property listings module
    ├── blog/                 ← Blog management
    ├── inquiries/            ← Lead/enquiry management
    ├── users/                ← User/customer management
    ├── testimonials/         ← Testimonials module
    ├── newsletter/           ← Newsletter subscribers
    ├── neighbourhoods/       ← Neighbourhood management
    ├── open-houses/          ← Open house scheduling
    ├── analytics/            ← Analytics dashboard
    ├── invoices/             ← Billing/invoices
    ├── pages/                ← CMS page management
    ├── contact-us/           ← Contact submissions
    ├── agents/               ← Agent overview
    ├── profile/              ← User profile management
    ├── settings/             ← Account settings
    └── reset-password/       ← Password reset

services/
├── Api.tsx                   ← Configured Axios instance (auth interceptors)
├── auth/                     ← Authentication services & queries
├── blog/                     ← Blog CRUD + image upload
├── enquiry/                  ← Enquiry/lead services
├── location/                 ← State/County/City lookup
├── neighbourhood/            ← Neighbourhood CRUD + image upload
├── newsletter/               ← Newsletter subscriber management
├── open-house/               ← Open house CRUD
├── page/                     ← CMS page CRUD + banner upload
├── profile/                  ← Profile update + photo/logo upload
├── property/                 ← Property CRUD + featured toggle
└── testimonial/              ← Testimonial CRUD

components/
├── ui/                       ← Reusable design system components
│   ├── button, card, dialog, input, label
│   ├── select, skeleton, slider, switch, tabs
│   └── (all with unit tests)
├── AgentAvatar.tsx
└── SearchFilters.tsx
```

### Authentication Flow
- Token-based authentication using Bearer JWT
- Token stored in `sessionStorage` (not localStorage — session-scoped security)
- All API requests automatically inject the `Authorization: Bearer <token>` header via Axios interceptor
- On expired/missing token: redirected to `/login`
- Profile data (name, email, profile photo, UUID) cached in `sessionStorage` after login

---

## 4. Authentication & Access Control

### Login Page (`/login`)
- Email + Password login form with validation
- Real-time form validation (required fields, email format)
- API: `POST /user/login` → receives JWT access token
- On success: fetches user profile, caches to sessionStorage, redirects to `/admin`
- Auto-redirect to `/admin` if user is already authenticated (token exists)
- **Register from Login**: Inline modal on the login page for new user registration without leaving the page
- Error messages displayed inline for failed login attempts

### Registration Modal (embedded in Login)
- Fields: Full Name, Email, Password, Confirm Password, Phone
- Client-side validation for all fields
- Password confirmation match validation
- API: `POST /customer/register`

### Logout
- Calls `POST /user/logout` API
- Clears all sessionStorage keys (token, name, email, profile photo)
- Redirects to `/login`

### Forgot Password (`/forgot-password`)
- Email input form
- API: `POST /user/forgot-user-password`
- Success message shown on successful submission
- Auto-redirect to `/login` after 5 seconds
- Optional inline register modal also accessible from this page

### Reset Password (`/admin/reset-password`)
- In-panel password reset form

---

## 5. Module 1 — Dashboard (Home)

**Route:** `/admin`

The dashboard is the landing page of the admin panel. It provides a real-time overview of the entire business at a glance.

### Stats Cards (Live API Data)
Four key performance indicators displayed as cards, each fetched in parallel from the API:

| Stat | API Endpoint | Icon |
|---|---|---|
| Total Listings | `v1/admin/count/product/property/all` | Blue house icon |
| Total Enquiries | `v1/admin/count/enquiry/enquiry/all` | Green envelope icon |
| Total Blogs | `v1/admin/count/blog/blog/all` | Purple document icon |
| Testimonials | `v1/admin/count/testimonial/testimonial/all` | Amber thumbs-up icon |

### Featured Listings Section
- Pulls featured property listings from `v1/admin/property?search[is_featured]=1`
- Displays listing image, title, price, address, bedrooms, bathrooms, sq ft, status badge, views
- **Paginated** inline — 4 listings per page with previous/next controls
- Toggle between **Grid View** and **List View**
- Quick navigation to listing detail/edit from each card

### Recent Enquiries Section
- Fetches last 5 enquiries from `v1/admin/enquiry?page=1`
- Shows sender name, email, enquiry source, and date
- Link to full inquiries list

### Loading State
- Skeleton placeholders for all sections while data loads (no layout shift)

---

## 6. Module 2 — Listings (Property Management)

**Route:** `/admin/listings`

The listings module is the core of the application — a full property management system connected to the IDX backend.

### Listing List Page

#### Data Display
Each listing card shows:
- Property thumbnail image (handles arrays, strings, JSON-encoded image data)
- Property title
- Address
- Price (formatted as `$1,200,000`)
- Bedrooms & Bathrooms count
- Square footage
- View count
- Status badge (color-coded)
- Featured star toggle

#### Status Badges (Color-Coded)
| Status | Color |
|---|---|
| Active | Green (emerald) |
| Sold | Red |
| Pending | Amber/Yellow |
| Coming Soon | Blue |
| Leased / Rented / Closed | Purple |
| Expired | Gray |
| Off Market | Slate |

#### Search & Filtering
- **Keyword Search** with a minimum 3-character requirement and 500ms debounce (no unnecessary API calls)
- **Advanced Filters Panel** (toggleable sidebar):
  - Minimum Bedrooms
  - Maximum Bedrooms
  - Minimum Bathrooms
  - Maximum Bathrooms
- URL-based filter state (shareable/bookmarkable filtered URLs)
- "Clear Filters" button to reset all filters
- Active filter indicator badge on the filter button

#### Featured Listings Management
- Toggle any listing as Featured or Unfeatured with a single click
- API: `PATCH v1/admin/property/action/{id}/feature`
- Loading indicator on the toggle button while request is in-flight
- Success/error feedback messages displayed inline

#### Pagination
- Multi-page navigation with visible page numbers
- Ellipsis for large page ranges
- Previous / Next buttons
- "Page X of Y (Z total items)" counter
- URL-synced page numbers (page parameter in URL)

#### Actions Per Listing
- **View** — Navigate to detailed listing view (`/admin/listings/{id}`)
- **Edit** — Navigate to edit form (`/admin/listings/{id}/edit`)
- Featured star toggle

### Create Listing (`/admin/listings/create`)
Form fields:
- Title
- Address
- Price
- Status
- Agent
- Description (Rich Text Editor — React Quill)
- Views count
- Inquiries count

### View / Edit Listing (`/admin/listings/{id}`)
- Full listing detail view
- Edit form with all property fields

---

## 7. Module 3 — Blog Management

**Route:** `/admin/blog`

A complete blogging CMS with rich text support, image uploads, and featured post management.

### Blog List Page

#### Display Per Post
- Featured image thumbnail (with fallback for default/placeholder images)
- Title and subtitle
- Author name
- Category badge
- Status badge (Published / Draft)
- Featured indicator (star icon)
- Creation date
- View / Edit / Delete action buttons

#### Search
- Keyword search with 500ms debounce
- Minimum 3-character validation
- "Search keyword must be at least 3 characters" inline error
- Clear filter button

#### Delete Blog Post
- Confirmation dialog before deletion
- API: `DELETE v1/admin/blog/{id}`
- Automatic list refresh after deletion

#### Pagination
- Full paginated navigation (same pattern as listings)

### Create Blog Post (`/admin/blog/create`)

Form Fields:
| Field | Type | Details |
|---|---|---|
| Title | Text Input | Required |
| Subtitle | Text Input | Required |
| Author | Text Input | Required |
| Category | Dropdown | Blog / News / Articles |
| Status | Dropdown | Published / Draft |
| Featured | Checkbox Toggle | Mark as featured post |
| Cover Image | File Upload | Immediate upload to server, preview shown |
| Content | Rich Text Editor | Full Quill WYSIWYG editor with formatting |

**Image Upload Flow:**
1. User selects a file
2. Immediately uploaded to server via `POST /v1/admin/upload/blog` (FormData)
3. Server returns an `ImageObject` with path/UUID
4. Preview shown in the form
5. On form submit, `ImageObject` reference is sent (not the file again)

**Rich Text Editor (React Quill):**
- Bold, Italic, Underline, Strikethrough
- Headers (H1, H2, H3)
- Ordered & Unordered Lists
- Blockquote
- Code Block
- Links
- Images (inline)
- Text alignment

### Edit Blog Post (`/admin/blog/{id}/edit`)
- Pre-populated form with all existing blog data
- Same image upload capability
- API: `PUT v1/admin/blog/{id}`

### View Blog Post (`/admin/blog/{id}`)
- Full blog post detail view

---

## 8. Module 4 — Inquiries / Leads Management

**Route:** `/admin/inquiries`

Centralized hub for all incoming leads and inquiries from across the platform.

### Inquiry Sources (Tagged & Color-Coded)
Every inquiry is tagged with its source:

| Source Key | Display Label | Color |
|---|---|---|
| `sell` | Sell | Orange |
| `connect` | General | Blue |
| `listing_tour` | Schedule Tour | Violet |
| `listing_enquire` | Listing Inquire | Cyan |
| `signup` | Sign Up | Emerald |
| `openhouse` | Open House | Amber |
| `idx-admin` | IDX Admin | Slate |

### Features
- **List view** showing all inquiries with sender name, email, source badge, date
- **Keyword search** with debounce
- **Delete inquiry** with confirmation dialog
- **View inquiry detail** — full message, contact info, linked listing
- **Push to CRM** — syncs a customer to external CRM: `GET /user/sync-customer-to-crm?customer_id={id}`
  - Success/error toast notifications
  - Authentication check before CRM sync
- **Pagination** with URL-synced page numbers

### View Single Inquiry (`/admin/inquiries/{id}`)
- Full enquiry detail with all form data, sender contact info, and source metadata

---

## 9. Module 5 — Users & Customers

**Route:** `/admin/users`

Management of registered users and customer accounts.

### Features
- List all users/customers from `v1/user/customer`
- **Search & Filters** (toggleable panel):
  - Search by Name (LIKE)
  - Search by Email (LIKE)
  - Filter by CRM Status (`0` = not synced, `1` = synced)
- **500ms debounced** name search
- Display per user: Avatar (color-coded initials), Name, Email, Role, Status, Joined date, CRM status
- **Create User** — Navigate to user creation form
- **Edit User** — Navigate to user edit form
- **Push to CRM** — Sync individual user to CRM system
- **Pagination** with total items count

### User Fields Displayed
- Name / Full name
- Email address
- Role (User, Admin, etc.)
- Status (Active / Inactive)
- Last Active date
- CRM sync status badge
- Registration date

---

## 10. Module 6 — Testimonials

**Route:** `/admin/testimonials`

Manage client testimonials and reviews displayed on the website.

### Testimonial List

Each testimonial card shows:
- Color-coded avatar with initials
- Client name
- Job title / occupation (if provided)
- Star rating (1–5 stars, visually rendered)
- Review text excerpt
- Submission date

### Features
- **Keyword search** with 500ms debounce and 3-character minimum
- **Create Testimonial** — form to add new testimonials
- **View** — full testimonial detail
- **Edit** — update existing testimonial
- **Delete** — with confirmation dialog, API: `DELETE v1/admin/testimonial/{id}`
- **Pagination**

### Create / Edit Testimonial (`/admin/testimonials/create`, `/admin/testimonials/{id}`)
- Client name, email, job title
- Star rating (1–5)
- Review content / message
- API: `POST v1/admin/testimonial` / `PUT v1/admin/testimonial/{id}`

---

## 11. Module 7 — Newsletter Subscribers

**Route:** `/admin/newsletter`

Manage the newsletter subscriber list.

### Features
- List all subscribers fetched from `v1/admin/newsletter`
- Display: Color-coded initials avatar, email address, name (if provided), subscription date
- **Search** subscribers by email / keyword (500ms debounce, 3-char minimum)
- **View subscriber detail** (`/admin/newsletter/{id}`)
- **Delete subscriber** — with confirmation dialog, API: `DELETE v1/admin/newsletter/{id}`
- **Pagination** with total count
- Empty state with icon when no subscribers found

---

## 12. Module 8 — Neighbourhoods

**Route:** `/admin/neighbourhoods`

Manage neighborhood profiles with location-based hierarchical filtering.

### Neighbourhood List

Each card shows:
- Neighbourhood image (or color-coded initials avatar as fallback)
- Neighbourhood name
- City, County, State information
- Creation date
- View / Edit / Delete actions

### Advanced Location-Based Filtering
Three-level cascading location filters:
1. **State** — populated from API: `PATCH /admin/location/actions/options`
2. **County** — dynamically populated based on selected state: `PATCH /admin/location/actions/get_locations_by_parent`
3. **City** — dynamically populated based on selected county: same endpoint

- Dropdowns auto-reset when parent selection changes
- "Apply Filters" button triggers filtered API query
- Clear all filters option
- Active filter indicator

### Create Neighbourhood (`/admin/neighbourhoods/create`)
- Name, description
- Location: State → County → City (hierarchical dropdowns)
- Image upload (sent as FormData multipart upload)
- On submission: `POST v1/admin/neighbourhood`

### Edit Neighbourhood (`/admin/neighbourhoods/{id}`)
- Pre-populated form
- Image re-upload capability
- API: `PUT v1/admin/neighbourhood/{id}`

### Delete Neighbourhood
- Confirmation dialog
- API: `DELETE v1/admin/neighbourhood/{id}`

---

## 13. Module 9 — Open Houses

**Route:** `/admin/open-houses`

Schedule and manage open house events linked to property listings.

### Open House List

Each card shows:
- Property cover photo (resolved from multiple image field formats)
- Open house title / property name
- Event date (formatted: "12 Apr 2026")
- Start time and end time (12-hour format with AM/PM)
- Status badge (Active, Scheduled, Expired/Closed/Cancelled — color-coded)
- Property address
- Description excerpt
- View / Edit / Delete actions

### Status Badges
| Status | Color |
|---|---|
| Active / Available | Green (emerald) |
| Scheduled | Blue |
| Expired / Closed / Inactive / Cancelled | Amber |

### Features
- **Keyword search** with 500ms debounce and 3-char minimum
- **Search validation** ("must be at least 3 characters" inline error)
- **Delete** with confirmation dialog — `DELETE v1/admin/openhouse/{id}`
- **Pagination** with total items
- **Click-through** to view/edit detail page

### Create Open House (`/admin/open-houses/create`)
Fields:
- Event date
- Start time
- End time (optional)
- Property (linked from property search)
- Description / Notes
- Status

API: `POST v1/admin/openhouse`

### Edit / View Open House (`/admin/open-houses/{id}`)
- Pre-populated form
- API: `PUT v1/admin/openhouse/{id}`

### Public Open House Page (`/open-houses/{id}`)
- Public-facing detail page for open house events (accessible without login)

---

## 14. Module 10 — Analytics

**Route:** `/admin/analytics`

Business intelligence dashboard for monitoring performance across listings and agents.

### Key Metrics (4 Cards)
| Metric | Icon |
|---|---|
| Total Listings | Blue House icon |
| Total Enquiries | Green Envelope icon |
| Revenue | Credit Card icon |
| Total Users | User Group icon |

Each card shows: metric name, value, and change indicator (positive = green, negative = red).

### Listing Views Bar Chart
- Visual bar chart showing listing views by property
- Each bar scaled proportionally to maximum view count
- Hover to see exact view count
- Property name label below each bar

### Top Performing Agents Table
Columns:
- Agent name (with initials avatar, color-coded)
- Total Listings
- Sales
- Inquiries
- Actions (Edit button)

### Agent Edit Dialog
Clicking "Edit" on an agent opens a modal form:
- Agent Name (text input)
- Total Calls (number input)
- Rating — **Interactive star rating** (click to set 1–5 stars)
- Customer Satisfaction — **Slider control** (0–100%)

### Time Range Filter
Dropdown to adjust analytics time period:
- Today
- This Week
- This Month
- This Year

---

## 15. Module 11 — Invoices & Billing

**Route:** `/admin/invoices`

View and download billing invoices for subscription or service fees.

### Invoice List

Displayed as a table with columns:
- Invoice # (with document icon avatar)
- Date
- Amount (formatted with `$` and thousands separators)
- Status badge (Paid / Pending / Overdue — color-coded)
- Actions: View + Download

### Status Badges
| Status | Color |
|---|---|
| Paid | Green (emerald) |
| Pending | Amber |
| Overdue | Red |

### Actions Per Invoice
- **View** — Navigate to invoice detail page (`/admin/invoices/{id}`)
- **Download** — Direct file download link

---

## 16. Module 12 — Pages (CMS)

**Route:** `/admin/pages`

Content management system for website pages (About, Services, Terms, etc.)

### Pages List

Each page entry shows:
- Color-coded initials icon
- Page title
- URL slug (with link icon)
- Creation date
- Status badge (Visible / Hidden)
- View / Edit / Delete actions

### Status
| Status Value | Display Label |
|---|---|
| `show` | Visible (Green) |
| Other | Hidden (Slate) |

### Create Page (`/admin/pages/create`)
Fields:
- Page title
- URL slug
- Status (Show / Hide)
- Banner image upload (FormData multipart)
- Content (Rich Text)
- Meta fields (SEO)

API: `POST v1/admin/page`

### Edit Page (`/admin/pages/{id}/edit`)
- Pre-populated form
- Banner re-upload capability
- API: `PUT v1/admin/page/{id}`

### View Page (`/admin/pages/{id}`)
- Full page detail view

### Delete Page
- Confirmation dialog
- API: `DELETE v1/admin/page/{id}`

---

## 17. Module 13 — Contact Submissions

**Route:** `/admin/contact-us`

View and manage contact form submissions from the public-facing website.

### Features
- List all contact submissions
- Display: Color-coded initials avatar, submitter name, email, subject/message excerpt, date
- **View submission detail** (`/admin/contact-us/{id}`)
- **Create contact entry** manually (`/admin/contact-us/create`)
- **Edit contact** (`/admin/contact-us/{id}/edit`)
- **Delete contact**
- Search by name
- Keyword search

---

## 18. Module 14 — Agents

**Route:** `/admin/agents`

Overview of all agents under the account.

### Agent Cards (Grid Layout)

Each card shows:
- Color-coded initials avatar
- Agent full name
- Email address
- Status badge (Active / Inactive)
- Role (Broker / Agent)
- Statistics row:
  - **Total Listings** count
  - **Sales** count
  - **Role** label
  - **Last Active** timestamp

---

## 19. Module 15 — Profile Management

**Route:** `/admin/profile`

Comprehensive profile editor for the logged-in admin user.

### Personal Information Section
| Field | Type |
|---|---|
| Full Name | Text Input |
| Email | Text Input |
| Phone | Composite (Country Code + Number) |
| Address Line 1 | Text Input |
| Address Line 2 | Text Input |
| State | Dropdown (API-populated) |
| County | Dropdown (cascades from State) |
| City | Dropdown (cascades from County) |
| ZIP Code | Text Input |
| Country | Text Input |

### Profile Photo
- Upload profile photo from local filesystem
- Immediate upload to server
- Live preview in form
- API: Dedicated photo upload endpoint (FormData)

### Company Information Section
| Field | Type |
|---|---|
| Company Name | Text Input |
| Company Address | Text Input |
| Company State | Dropdown (API-populated) |
| Company County | Dropdown (cascades) |
| Company City | Dropdown (cascades) |
| Company Email | Email Input |
| Company Phone | Text Input |
| Company Website | URL Input |
| Company Logo | File Upload with preview |

### Bio Section
- **Short Bio** — Brief description
- **Long Bio** — Extended description

### Social Media Links
- Facebook URL
- LinkedIn URL
- Instagram URL

### Password Change
- Current password
- New password
- Confirm new password
- Validation for password mismatch

### Data Persistence
- All changes saved via `PUT /user/profile`
- Toast notifications on success/error
- Loading state during save

---

## 20. Module 16 — Settings

**Route:** `/admin/settings`

Tabbed settings panel for account-wide configuration.

### Tab 1 — Profile Settings
- Profile picture upload/change
- Full name
- Job title
- Bio

### Tab 2 — Account Settings
- Email address
- Timezone selection (Pacific, Mountain, Central, Eastern)
- Language selection (English, Spanish, French, German)

### Tab 3 — Notification Preferences
Three toggle switches (on/off):
- **Email Notifications** — Receive emails for activity
- **Push Notifications** — Receive push alerts
- **Weekly Digest** — Weekly summary email

### Tab 4 — Security
- **Two-Factor Authentication** toggle (enable/disable)
- Password change form:
  - Current Password
  - New Password
  - Confirm New Password

### Tab 5 — Team Management
- View current team members with roles
- Role assignment per member (Admin / Member / Viewer)
- **Invite New Member** button — opens dialog:
  - Email input
  - Role selection (Admin / Member / Viewer)
  - Send invite action

---

## 21. Module 17 — Password Recovery

### Forgot Password Flow (`/forgot-password`)
1. User enters email address
2. Client-side email format validation
3. API call: `POST /user/forgot-user-password`
4. On success: success message displayed, auto-redirect to login in 5 seconds
5. On error: error message displayed inline

### Reset Password (`/admin/reset-password`)
- Token-based password reset form (standard reset link flow)

---

## 22. API Services Layer

All API communication is handled through a centralized Axios instance with automatic auth injection.

### Axios Instance Configuration (`services/Api.tsx`)
- **Base URL** — Configurable via `NEXT_PUBLIC_API_BASE_URL` or `NEXT_PUBLIC_BACKEND_PRIMARY`
- **Request Interceptor:**
  - Auto-sets `Content-Type: application/json` for all requests
  - Automatically injects `Authorization: Bearer {token}` from sessionStorage
  - Sanitizes UUID from `user/customer` endpoints for privacy
- **Response Interceptor:**
  - Network error detection (offline/no connection handling)
  - HTTP status code logging (400, 401, 403, 404, 500)
  - Parsed error messages from API responses

### Services & API Endpoints

#### Authentication
| Operation | Method | Endpoint |
|---|---|---|
| Login | POST | `/user/login` |
| Register | POST | `/customer/register` |
| Logout | POST | `/user/logout` |
| Forgot Password | POST | `/user/forgot-user-password` |

#### Properties / Listings
| Operation | Method | Endpoint |
|---|---|---|
| List Properties | GET | `v1/admin/property?page={n}` |
| Search Properties | GET | `v1/admin/property?search[keyword]={q}` |
| Filter by Beds/Baths | GET | `v1/admin/property?search[bed_min]=...` |
| Single Property | GET | `v1/admin/property/{id}` |
| Delete Property | DELETE | `v1/admin/property/{id}` |
| Toggle Featured | PATCH | `v1/admin/property/action/{id}/feature` |
| Count | GET | `v1/admin/count/product/property/all` |

#### Blog
| Operation | Method | Endpoint |
|---|---|---|
| List Blogs | GET | `v1/admin/blog?page={n}&q={q}` |
| Single Blog | GET | `v1/admin/blog/{id}` |
| Create Blog | POST | `v1/admin/blog` (JSON or FormData) |
| Update Blog | PUT | `v1/admin/blog/{id}` (JSON or FormData) |
| Delete Blog | DELETE | `v1/admin/blog/{id}` |
| Upload Image | POST | `v1/admin/upload/blog` |
| Count | GET | `v1/admin/count/blog/blog/all` |

#### Enquiries / Inquiries
| Operation | Method | Endpoint |
|---|---|---|
| List Enquiries | GET | `v1/admin/enquiry?page={n}&q={q}` |
| Count | GET | `v1/admin/count/enquiry/enquiry/all` |

#### Users / Customers
| Operation | Method | Endpoint |
|---|---|---|
| List Customers | GET | `v1/user/customer?page={n}&q={filter}` |
| Sync to CRM | GET | `/user/sync-customer-to-crm?customer_id={id}` |

#### Testimonials
| Operation | Method | Endpoint |
|---|---|---|
| List Testimonials | GET | `v1/admin/testimonial?page={n}&q={q}` |
| Single Testimonial | GET | `v1/admin/testimonial/{id}` |
| Create Testimonial | POST | `v1/admin/testimonial` |
| Update Testimonial | PUT | `v1/admin/testimonial/{id}` |
| Delete Testimonial | DELETE | `v1/admin/testimonial/{id}` |
| Count | GET | `v1/admin/count/testimonial/testimonial/all` |

#### Newsletter
| Operation | Method | Endpoint |
|---|---|---|
| List Subscribers | GET | `v1/admin/newsletter?page={n}&q={q}` |
| Delete Subscriber | DELETE | `v1/admin/newsletter/{id}` |

#### Neighbourhoods
| Operation | Method | Endpoint |
|---|---|---|
| List | GET | `v1/admin/neighbourhood?page={n}&q={filter}` |
| Single | GET | `v1/admin/neighbourhood/{id}` |
| Create | POST | `v1/admin/neighbourhood` (JSON or FormData) |
| Update | PUT | `v1/admin/neighbourhood/{id}` (JSON or FormData) |
| Delete | DELETE | `v1/admin/neighbourhood/{id}` |

#### Open Houses
| Operation | Method | Endpoint |
|---|---|---|
| List | GET | `v1/admin/openhouse?page={n}` |
| Single | GET | `v1/admin/openhouse/{id}` |
| Create | POST | `v1/admin/openhouse` |
| Update | PUT | `v1/admin/openhouse/{id}` |
| Delete | DELETE | `v1/admin/openhouse/{id}` |

#### Pages (CMS)
| Operation | Method | Endpoint |
|---|---|---|
| List | GET | `v1/admin/page?page={n}` |
| Single | GET | `v1/admin/page/{id}` |
| Create | POST | `v1/admin/page` (JSON or FormData) |
| Update | PUT | `v1/admin/page/{id}` (JSON or FormData) |
| Delete | DELETE | `v1/admin/page/{id}` |

#### Profile
| Operation | Method | Endpoint |
|---|---|---|
| Fetch Profile | GET | `user/profile` |
| Update Profile | PUT | `user/profile` |
| Upload Photo | POST | Profile photo upload endpoint |
| Upload Company Logo | POST | Company logo upload endpoint |

#### Location Lookups
| Operation | Method | Endpoint |
|---|---|---|
| Get All States | PATCH | `admin/location/actions/options` |
| Get Counties by State | PATCH | `admin/location/actions/get_locations_by_parent` `{region_id}` |
| Get Cities by County | PATCH | `admin/location/actions/get_locations_by_parent` `{county_id}` |

---

## 23. UI Component System

A fully tested, reusable design system built on Radix UI headless components + Tailwind CSS.

### Components (all with unit tests)

| Component | File | Usage |
|---|---|---|
| `Button` | `components/ui/button.tsx` | Primary, secondary, destructive, outline, ghost variants |
| `Card` | `components/ui/card.tsx` | Content containers with header, content, footer slots |
| `Dialog` | `components/ui/dialog.tsx` | Modal dialogs (confirmations, forms) |
| `Input` | `components/ui/input.tsx` | Text inputs with consistent styling |
| `Label` | `components/ui/label.tsx` | Form labels with accessibility |
| `Select` | `components/ui/select.tsx` | Styled dropdowns (Radix Select) |
| `Skeleton` | `components/ui/skeleton.tsx` | Loading placeholders for all content areas |
| `Slider` | `components/ui/slider.tsx` | Range slider (used in Analytics agent edit) |
| `Switch` | `components/ui/switch.tsx` | Toggle switches (used in Settings notifications/security) |
| `Tabs` | `components/ui/tabs.tsx` | Tab panels (used in Settings) |
| `Badge` | `components/ui/badge.tsx` | Status labels |

### Sidebar Navigation
Fixed left sidebar with:
- RealtiPro logo
- Navigation links with active state highlighting (emerald green for active)
- User profile section at bottom (avatar, name, email)
- Links to: Dashboard, Listings, Users & Leads, Blog Posts, Testimonials, Newsletter, Neighborhoods, Open Houses
- Logout button with API call

---

## 24. Smart UX Features (Cross-Module)

These features are consistently implemented across all modules to ensure a polished, professional user experience.

### 1. Debounced Search (500ms)
All search inputs use a 500ms debounce — the API is only called after the user stops typing for 500ms, reducing unnecessary server load and providing a smooth, responsive experience.

### 2. Minimum Search Length Validation
Keyword searches require a minimum of 3 characters. An inline error message appears if fewer characters are entered and the user tries to search.

### 3. URL-Synced State
Search terms, filters, and page numbers are reflected in the URL query string. This means:
- Users can bookmark a filtered/paged view
- Back/forward browser navigation works correctly
- Shareable filtered URLs

### 4. Top Progress Bar (Loading Indicator)
A thin emerald-green animated progress bar appears at the very top of the page during any background API fetch. It disappears when the data loads. This is used on: Listings, Blog, Testimonials, Newsletter, Neighbourhoods, Open Houses.

### 5. Stale-While-Revalidate Loading
When navigating pages or applying filters, the previous data is shown while new data loads (no empty flash). The overlay spinner overlays the existing content instead of blanking it out.

### 6. Skeleton Loading States
Every module renders skeleton placeholder cards that match the layout of the actual content while data is loading. This eliminates layout shift and provides a premium loading experience.

### 7. Confirmation Dialogs
All destructive actions (delete blog, delete testimonial, delete subscriber, delete neighbourhood, delete open house, delete page) require a confirmation dialog before executing. Buttons show "Deleting..." during the async operation.

### 8. Toast Notifications
Profile updates, CRM sync operations, and other mutations display toast notifications (react-toastify) for success and error feedback without disrupting the user's workflow.

### 9. Image Handling
The platform intelligently handles multiple image data formats returned by the API:
- Raw URL strings
- JSON-encoded arrays (`"[\"path/to/img\"]"`)
- JavaScript arrays of strings
- Objects with `path` or `url` keys
- Relative paths (automatically prefixed with backend domain)

### 10. Responsive Layout
- Sidebar is fixed at 220px on desktop
- Content area adjusts accordingly
- Tables become scrollable on small screens
- Grid layouts switch to single-column on mobile
- Certain columns (like avatar column) hidden on small screens (`hidden sm:flex`)

### 11. Cascading Location Dropdowns
The State → County → City hierarchy is used in three places (Neighbourhoods filter, Profile personal address, Profile company address). Selecting a parent automatically clears and reloads the dependent dropdowns.

### 12. Dynamic Image Fallbacks
Profile photos and neighbourhood images use an `onError` handler to fall back to a placeholder image if the stored URL is invalid or the image fails to load.

---

## 25. Deployment & Infrastructure

### Configuration Files
- `next.config.js` — Next.js configuration
- `tailwind.config.js` — Tailwind CSS configuration
- `postcss.config.js` — PostCSS (Autoprefixer)
- `tsconfig.json` — TypeScript configuration
- `vercel.json` — Vercel deployment configuration
- `Dockerfile` — Docker containerization
- `docker-compose.yml` — Multi-container Docker setup
- `deploy.sh` — Deployment shell script

### Environment Variables
| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | Primary backend API base URL |
| `NEXT_PUBLIC_BACKEND_PRIMARY` | Fallback backend URL |
| `NEXT_PUBLIC_BACKEND_DOMAIN` | Backend domain for image URL construction |

### Deployment Targets
- **Vercel** (primary, serverless) — via `vercel.json`
- **Docker** — containerized deployment via `Dockerfile` + `docker-compose.yml`

### Testing
- Framework: Jest 29 + Testing Library
- Test files colocated with components (`button.test.tsx`, `card.test.tsx`, etc.)
- All core UI components have unit tests
- Run tests with `pnpm test`

---

## 26. Summary of All Modules & Feature Count

| # | Module | Route | Key Features | CRUD |
|---|---|---|---|---|
| 1 | Dashboard | `/admin` | Live stats, featured listings, recent enquiries | Read-only |
| 2 | Listings | `/admin/listings` | Search, filters (beds/baths), featured toggle, status badges | Full CRUD |
| 3 | Blog | `/admin/blog` | Rich text editor, image upload, featured, categories | Full CRUD |
| 4 | Inquiries | `/admin/inquiries` | Source labeling, CRM sync, search | Read + Delete + CRM push |
| 5 | Users | `/admin/users` | CRM filter, email/name search, CRM sync | Read + Create + CRM push |
| 6 | Testimonials | `/admin/testimonials` | Star ratings, search | Full CRUD |
| 7 | Newsletter | `/admin/newsletter` | Subscriber list, search, manage | Read + Delete |
| 8 | Neighbourhoods | `/admin/neighbourhoods` | Image upload, cascading location filter | Full CRUD |
| 9 | Open Houses | `/admin/open-houses` | Event scheduling, time formatting, property link | Full CRUD |
| 10 | Analytics | `/admin/analytics` | Metrics, bar chart, agent table, time filter, edit dialog | Read + Edit |
| 11 | Invoices | `/admin/invoices` | Status badges, download | Read + Download |
| 12 | Pages (CMS) | `/admin/pages` | Rich text, banner image, slug, visibility | Full CRUD |
| 13 | Contact Submissions | `/admin/contact-us` | Form submissions view | Full CRUD |
| 14 | Agents | `/admin/agents` | Stats per agent, role, status | Read-only |
| 15 | Profile | `/admin/profile` | Photo + logo upload, location dropdowns, social | Read + Update |
| 16 | Settings | `/admin/settings` | 5-tab settings: Profile, Account, Notifications, Security, Team | Read + Update |
| 17 | Authentication | `/login`, `/forgot-password` | JWT login, register modal, forgot password | Auth |

### Total API Endpoints Consumed: **40+**
### Total Pages / Routes: **30+**
### Total Modules: **17**
### UI Components (with unit tests): **11**

---

## Key Differentiators

1. **Live Data First** — Every meaningful stat and list is pulled from a real API. No hardcoded content in production modules.
2. **CRM Integration** — One-click sync of leads and customers to an external CRM system.
3. **Smart Search** — Debounced, URL-synced, validated search across every module.
4. **Media Management** — Upload photos (profile, company logo, blog images, neighbourhood images, page banners) directly from within the panel.
5. **Hierarchical Location System** — State → County → City cascading dropdowns powered by API for accurate location data.
6. **Rich Content Publishing** — Full WYSIWYG blogging and CMS page management with React Quill.
7. **Open House Scheduling** — Complete event scheduling tied directly to property listings.
8. **Featured Property Control** — Admins can mark/unmark properties as featured from both the Dashboard and the Listings module.
9. **Fully Responsive** — Works on desktop and tablet screens with adaptive layouts.
10. **Tested UI Layer** — All core UI components are covered by unit tests.

---

*Document compiled from source code analysis of the RealtiPro IDX Admin Frontend application.*
