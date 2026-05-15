# Rentmart

Frontend application for the Rentmart heavy-equipment marketplace. This app delivers the public marketplace, owner and renter workflows, admin operations, support surfaces, payment visibility, and data-rich dashboard experiences on top of Next.js App Router.

## Visual Previews

![Landing Page](public/assets/rentmart-marketplace-assets/rentmart_landing_page/screen.png)

![About Page](public/assets/rentmart-marketplace-assets/rentmart_about_page_design/screen.png)

![Contact Page](public/assets/rentmart-marketplace-assets/rentmart_contact_page/screen.png)

![Dashboard Reference](public/assets/rentmart-marketplace-assets/notification_page/screen.png)

## What This Client Covers

| Product area       | What users can do                                                                                          |
| ------------------ | ---------------------------------------------------------------------------------------------------------- |
| Public marketplace | Browse featured machinery, categories, and public listing details                                          |
| Authentication     | Sign up, sign in, verify OTP, and manage session-based access                                              |
| Owner tools        | Create listings, manage inventory, review rental requests, view transactions                               |
| Renter tools       | Search equipment, wishlist listings, book equipment, and track bookings                                    |
| Admin portal       | Moderate listings, manage users/categories, resolve support queries, inspect transactions, and view charts |
| Trust and legal    | Access About, Support, and Terms pages from the shared marketing navigation                                |

## Stack

| Layer         | Tooling                                              | How it is used in Rentmart                                                                       |
| ------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Framework     | Next.js 16 App Router                                | Route groups for public, auth, and protected dashboard experiences                               |
| UI library    | React 19                                             | Component-driven rendering for marketplace and dashboard modules                                 |
| Styling       | Tailwind CSS v4                                      | Utility-first styling with CSS variables and responsive layouts                                  |
| Motion        | `motion`                                             | Page reveals, navbar transitions, product-page polish, hero carousel, and dashboard interactions |
| Icons         | `lucide-react`                                       | Consistent iconography across marketplace and admin views                                        |
| Data fetching | TanStack Query                                       | Server-state caching for auth, bookings, listings, notifications, payments, and support queries  |
| Forms         | React Hook Form                                      | Controlled forms for auth, listing creation, contact, and settings flows                         |
| Validation    | Zod + `@hookform/resolvers`                          | Shared client-side input constraints and safe form parsing                                       |
| UI primitives | Base UI                                              | Non-Radix interactive primitives aligned with the current app setup                              |
| shadcn setup  | `base-vega` style config                             | Local component composition and design tokens configured via `components.json`                   |
| Charts        | Recharts + local shadcn-style wrappers               | Admin chart view, legends, tooltips, and responsive chart containers                             |
| Utilities     | `clsx`, `tailwind-merge`, `class-variance-authority` | Cleaner class composition and variant handling                                                   |

## App Architecture

| Directory                 | Purpose                                                                            |
| ------------------------- | ---------------------------------------------------------------------------------- |
| `src/app`                 | App Router pages, route groups, and Next proxy handlers                            |
| `src/components/common`   | Shared navbar, footer, and reusable layout pieces                                  |
| `src/components/features` | Product-specific UI grouped by domain: landing, dashboard, product, category, etc. |
| `src/components/ui`       | Local UI building blocks including chart helpers                                   |
| `src/hooks`               | React Query hooks for each API domain                                              |
| `src/lib`                 | Typed API clients, auth cookie constants, domain types, and utility helpers        |
| `public/assets`           | Design references, page mockups, and static media used by implemented screens      |

## Route Groups

| Route group                                | What lives there                                                  |
| ------------------------------------------ | ----------------------------------------------------------------- |
| `src/app/page.tsx`                         | Public marketplace landing page                                   |
| `src/app/about`                            | About page built from provided visual references and local assets |
| `src/app/contact`                          | Contact/support page plus support-query submission flow           |
| `src/app/terms`                            | Terms page with section-aware navigation and highlight behavior   |
| `src/app/details`                          | Single equipment detail pages                                     |
| `src/app/categories` / `src/app/equipment` | Marketplace browsing surfaces                                     |
| `src/app/(auth)`                           | Sign-in, sign-up, and OTP verification                            |
| `src/app/(protected)/dashboard`            | Owner, renter, and admin dashboard pages                          |
| `src/app/auth/[...auth]`                   | Safe auth proxy to backend routes                                 |
| `src/app/payments/[...payments]`           | Safe payment/event proxy to backend routes                        |

## Dashboard Coverage

| Section         | Highlights                                                               |
| --------------- | ------------------------------------------------------------------------ |
| Overview        | Role-specific snapshots and workflow entry points                        |
| Verifications   | Admin moderation queue for listings and trust readiness                  |
| User Management | Client-side searchable/filterable user administration                    |
| Categories      | Category management with live listing awareness                          |
| Support Queries | Admin queue for owner/renter contact submissions                         |
| Transactions    | Ledger tab plus raw Razorpay event tab for reconciliation                |
| Chart View      | Payment, booking, support, settlement, verification, and user-mix charts |
| Owner views     | Listings, rental requests, settings, transactions                        |
| Renter views    | Bookings, saved items, notifications, transactions                       |

## Charts and Analytics

The admin chart screen uses Recharts through a local shadcn-style wrapper in `src/components/ui/chart.tsx`. It supports:

- responsive measured containers
- shared legend and tooltip components
- CSS-variable-driven chart colors
- grid layouts that adapt to smaller screens
- mixed chart styles including line, area, bar, grouped bar, stacked bar, and donut/pie

| Chart block             | Comparison                                       |
| ----------------------- | ------------------------------------------------ |
| Payment Success Trend   | Captured payments vs failed payments             |
| Booking Flow Health     | Approved bookings vs rejected/cancelled bookings |
| Settlement Queue Status | Owner payouts pending vs deposit refunds pending |
| User Mix                | Owners vs renters                                |
| Support Load Overview   | Owner queries vs renter queries                  |
| Verification Pipeline   | Ready/verified vs pending/action required        |

## Shared UX Systems

| System              | Implementation detail                                                                                       |
| ------------------- | ----------------------------------------------------------------------------------------------------------- |
| Shared navbar       | Public links are normalized across pages and collapse into a mobile dropdown on smaller screens             |
| Motion patterns     | Subtle transitions are used for hero surfaces, cards, detail pages, dropdowns, and dashboard panels         |
| Role-aware CTAs     | Navigation and dashboard actions adapt for admin, owner, and renter roles                                   |
| Asset-driven design | About, contact, terms, listing, and marketplace pages reuse provided design references from `public/assets` |
| Responsive layout   | Marketing, dashboard, and chart surfaces are optimized for small through large screens                      |

## Safety and Secure Frontend Patterns

The frontend does not replace backend security, but it is designed to cooperate with it safely.

| Concern                  | Frontend implementation                                                                         |
| ------------------------ | ----------------------------------------------------------------------------------------------- |
| Auth cookie handling     | Uses a dedicated auth cookie constant and backend-proxied auth routes                           |
| Credentialed requests    | `apiRequest()` sends `credentials: "include"` by default for authenticated flows                |
| Typed API errors         | Central `ApiError` class normalizes server errors for safer UI handling                         |
| Request body handling    | Helper only JSON-stringifies plain objects and leaves `FormData` intact for uploads             |
| Proxy boundaries         | App Router proxy routes whitelist and forward only expected auth/payment endpoints              |
| Validation before submit | Forms use React Hook Form + Zod resolvers to reduce invalid client submissions                  |
| Protected UI             | Role-specific pages and actions are organized under protected route groups and dashboard shells |
| Error resilience         | Payment proxy returns a controlled `502` response if backend connectivity fails                 |
| Chart stability          | Local chart container measures width/height before rendering to avoid runtime sizing issues     |

## How Frontend and Backend Work Together

| Frontend piece                   | Backend relationship                                                     |
| -------------------------------- | ------------------------------------------------------------------------ |
| `src/hooks/use-auth.ts`          | Talks to auth proxy routes and session endpoints                         |
| `src/hooks/use-equipment.ts`     | Fetches featured listings, public listings, and owner/admin listing data |
| `src/hooks/use-bookings.ts`      | Drives renter and owner booking flows                                    |
| `src/hooks/use-payments.ts`      | Powers admin raw event visibility                                        |
| `src/hooks/use-support-query.ts` | Submits contact queries and powers admin review UI                       |
| `src/lib/http.ts`                | Shared transport layer for JSON APIs and typed error handling            |

## Featured UI Flows

### 1. Landing Experience

- Hero marketplace section rotates through recent featured listings
- Public navbar stays consistent across Home, About, Support, and Terms
- Category and featured sections pull from live listing data

### 2. Contact and Support

- Contact page is built from the provided design reference set
- Only owner and renter users can submit support queries
- Admin users review those queries inside dashboard support management

### 3. Transactions and Payments

- Admin transaction page provides a ledger tab and a raw-event tab
- Ledger focuses on business settlement
- Raw events focus on webhook inspection and reconciliation

### 4. Chart View

- Dedicated sidebar entry in the admin dashboard
- Visual overview of financial and operational health
- Shadcn-style chart wrappers built on top of Recharts and the app's token system

## Assets and Design References

The client ships with an asset library in `public/assets`, including:

| Asset family                                                 | Usage                                         |
| ------------------------------------------------------------ | --------------------------------------------- |
| `rentmart_landing_page`                                      | Landing page visual direction                 |
| `rentmart_about_page_design`                                 | About page layout and illustration references |
| `rentmart_contact_page`                                      | Contact page design reference                 |
| `single_machinery_listing`                                   | Product detail page inspiration               |
| `single_category_products`                                   | Category browsing page reference              |
| `terms_of_service_rentmart`                                  | Terms page visual basis                       |
| `verifications`, `owner_listings`, `renter_dashboard_design` | Dashboard/admin workflow guidance             |

## Local Development

```bash
bun install
bun run dev
```

Open `http://localhost:3000`.

## Build

```bash
bun run build
bun run start
```

## Lint

```bash
bun run lint
```

## Notes for Contributors

- Reuse domain hooks in `src/hooks` instead of scattering ad hoc fetch calls.
- Keep shared marketing nav labels consistent across public pages.
- If you add a new chart, wire it through `src/components/ui/chart.tsx` so legends, tokens, and sizing stay consistent.
- Prefer existing Base UI and local shadcn-style patterns over introducing a separate Radix-based interaction layer.
