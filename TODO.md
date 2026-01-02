# RigReport Demo - TODO

A comprehensive task list for building the RigReport Demo from scratch. Tasks are organized into phases and should be completed in order.

---

## Phase 1: Project Setup

### 1.1 Initialize Repository
- [ ] Create new GitHub repository `rigreport-demo`
- [ ] Clone repository locally
- [ ] Initialize with Vite + React + TypeScript template
  ```bash
  npm create vite@latest . -- --template react-ts
  ```
- [ ] Install dependencies (see 1.2)
- [ ] Create initial commit

### 1.2 Install Dependencies
- [ ] Core dependencies:
  ```bash
  npm install wouter @tanstack/react-query date-fns clsx tailwind-merge
  ```
- [ ] UI dependencies:
  ```bash
  npm install @radix-ui/react-dialog @radix-ui/react-select @radix-ui/react-dropdown-menu @radix-ui/react-tabs @radix-ui/react-tooltip @radix-ui/react-label @radix-ui/react-slot
  ```
- [ ] Map dependencies:
  ```bash
  npm install leaflet react-leaflet
  npm install -D @types/leaflet
  ```
- [ ] Icon library:
  ```bash
  npm install lucide-react
  ```
- [ ] Dev dependencies:
  ```bash
  npm install -D tailwindcss postcss autoprefixer tailwindcss-animate
  ```

### 1.3 Configure Tailwind CSS
- [ ] Initialize Tailwind:
  ```bash
  npx tailwindcss init -p
  ```
- [ ] Configure `tailwind.config.ts` with nautical theme colors
- [ ] Set up `src/index.css` with Tailwind directives
- [ ] Add CSS custom properties for shadcn/ui compatibility
- [ ] Test Tailwind is working with a sample component

### 1.4 Configure Path Aliases
- [ ] Update `tsconfig.json` with path aliases:
  ```json
  {
    "compilerOptions": {
      "baseUrl": ".",
      "paths": {
        "@/*": ["./src/*"],
        "@/components/*": ["./src/components/*"],
        "@/lib/*": ["./src/lib/*"],
        "@/hooks/*": ["./src/hooks/*"],
        "@/assets/*": ["./src/assets/*"]
      }
    }
  }
  ```
- [ ] Update `vite.config.ts` with resolve aliases
- [ ] Verify aliases work with test import

### 1.5 Project Structure
- [ ] Create folder structure:
  ```
  src/
  ├── assets/
  ├── components/
  │   └── ui/
  ├── hooks/
  ├── lib/
  └── pages/
  ```
- [ ] Add `.gitignore` entries for build artifacts
- [ ] Create `components.json` for shadcn/ui (if using CLI)

---

## Phase 2: Core Infrastructure

### 2.1 TypeScript Types
- [ ] Create `src/lib/types.ts`
- [ ] Define `Role` type
- [ ] Define `BoatStatus` type
- [ ] Define `BoatType` type
- [ ] Define `Organization` type
- [ ] Define `MaintenanceCategory`, `MaintenanceSeverity`, `MaintenanceStatus` types
- [ ] Define `Boat` interface (all fields)
- [ ] Define `Equipment` interface
- [ ] Define `MaintenanceEntry` interface
- [ ] Define `DemoUser` interface
- [ ] Define `Permissions` interface
- [ ] Export all types

### 2.2 Mock Data
- [ ] Create `src/lib/mockData.ts`
- [ ] Add `MOCK_BOATS` array (70+ boats)
  - [ ] Include boats from ACS organization
  - [ ] Include boats from ASC organization
  - [ ] Include boats from SOA organization
  - [ ] Vary boat types (420, Sunfish, Open BIC, etc.)
  - [ ] Vary statuses (OK, Needs inspection, Needs repair, Do not sail)
  - [ ] Add latitude/longitude for map display
  - [ ] Include regatta-preferred boats
- [ ] Add `MOCK_EQUIPMENT` array (10+ items)
- [ ] Add `MOCK_MAINTENANCE` array (sample entries)
- [ ] Verify data matches TypeScript interfaces

### 2.3 Mock Data Store
- [ ] Create `src/lib/mockDataStore.ts`
- [ ] Implement `MockDataStore` class
- [ ] Add localStorage load/save methods
- [ ] Implement `getBoats()` with simulated delay
- [ ] Implement `getBoat(id)` 
- [ ] Implement `updateBoat(id, data)`
- [ ] Implement `createBoat(data)`
- [ ] Implement `deleteBoat(id)`
- [ ] Implement equipment CRUD methods
- [ ] Implement maintenance CRUD methods
- [ ] Add `reset()` method to restore initial data
- [ ] Export singleton instance

### 2.4 Utility Functions
- [ ] Create `src/lib/utils.ts`
- [ ] Add `cn()` function for class merging
- [ ] Add `formatDate()` helper
- [ ] Add `getStatusColor()` helper
- [ ] Add `getStatusIcon()` helper
- [ ] Add `generateId()` helper
- [ ] Add `groupBoatsByLocation()` for map clustering

---

## Phase 3: UI Components (shadcn/ui)

### 3.1 Base UI Components
- [ ] Create `src/components/ui/button.tsx`
- [ ] Create `src/components/ui/card.tsx`
- [ ] Create `src/components/ui/input.tsx`
- [ ] Create `src/components/ui/label.tsx`
- [ ] Create `src/components/ui/select.tsx`
- [ ] Create `src/components/ui/dialog.tsx`
- [ ] Create `src/components/ui/dropdown-menu.tsx`
- [ ] Create `src/components/ui/tabs.tsx`
- [ ] Create `src/components/ui/badge.tsx`
- [ ] Create `src/components/ui/textarea.tsx`
- [ ] Create `src/components/ui/tooltip.tsx`
- [ ] Create `src/components/ui/separator.tsx`
- [ ] Create `src/components/ui/skeleton.tsx`

### 3.2 Feature Components
- [ ] Create `src/components/StatusBadge.tsx`
  - [ ] Color-coded by status
  - [ ] Icon for each status
- [ ] Create `src/components/BoatCard.tsx`
  - [ ] Display name, type, status
  - [ ] Organization badge
  - [ ] Regatta-preferred indicator
  - [ ] Click to view details
- [ ] Create `src/components/EquipmentRow.tsx`
- [ ] Create `src/components/MaintenanceItem.tsx`
- [ ] Create `src/components/FilterBar.tsx`
  - [ ] Status filter dropdown
  - [ ] Boat type filter
  - [ ] Organization filter
  - [ ] Search input
  - [ ] Clear filters button
- [ ] Create `src/components/DemoBanner.tsx`
  - [ ] "This is a demo" message
  - [ ] Link to production site
  - [ ] Dismissible (optional)

### 3.3 Layout Components
- [ ] Create `src/components/AppShell.tsx`
  - [ ] Responsive sidebar
  - [ ] Mobile hamburger menu
  - [ ] Main content area
- [ ] Create `src/components/Sidebar.tsx`
  - [ ] Logo/branding
  - [ ] Navigation links with icons
  - [ ] Active state highlighting
  - [ ] Role switcher (demo only)
  - [ ] User info section
- [ ] Create `src/components/Header.tsx` (mobile)
- [ ] Create `src/components/PageHeader.tsx`
  - [ ] Title
  - [ ] Description
  - [ ] Action buttons slot

---

## Phase 4: Hooks & State Management

### 4.1 Data Hooks
- [ ] Create `src/hooks/use-boats.ts`
  - [ ] `useBoats()` - fetch all boats
  - [ ] `useBoat(id)` - fetch single boat
  - [ ] `useCreateBoat()` - mutation
  - [ ] `useUpdateBoat()` - mutation
  - [ ] `useDeleteBoat()` - mutation
- [ ] Create `src/hooks/use-equipment.ts`
  - [ ] `useEquipment()` - fetch all
  - [ ] `useCreateEquipment()` - mutation
  - [ ] `useUpdateEquipment()` - mutation
  - [ ] `useDeleteEquipment()` - mutation
- [ ] Create `src/hooks/use-maintenance.ts`
  - [ ] `useMaintenance(boatId?)` - fetch entries
  - [ ] `useCreateMaintenance()` - mutation
  - [ ] `useUpdateMaintenance()` - mutation

### 4.2 Demo Auth Hook
- [ ] Create `src/hooks/use-demo-auth.tsx`
- [ ] Create `DemoAuthContext`
- [ ] Create `DemoAuthProvider` component
- [ ] Implement `useDemoAuth()` hook
- [ ] Define role-based permissions
- [ ] Add `login()` function (sets demo user)
- [ ] Add `logout()` function
- [ ] Add `setRole()` function for role switching
- [ ] Persist selected role in localStorage

### 4.3 Utility Hooks
- [ ] Create `src/hooks/use-toast.ts` (notifications)
- [ ] Create `src/hooks/use-local-storage.ts`
- [ ] Create `src/hooks/use-media-query.ts` (responsive)

---

## Phase 5: Pages

### 5.1 Landing Page
- [ ] Create `src/pages/landing.tsx`
- [ ] Hero section with background image
- [ ] Feature highlights (3-4 cards)
- [ ] Call-to-action buttons
- [ ] Navigation to dashboard
- [ ] Responsive design

### 5.2 Dashboard Page
- [ ] Create `src/pages/dashboard.tsx`
- [ ] Summary cards:
  - [ ] Total boats
  - [ ] Boats ready to sail
  - [ ] Needs attention count
  - [ ] Equipment count
- [ ] Status breakdown chart/list
- [ ] Recent maintenance activity
- [ ] Quick action buttons
- [ ] Responsive grid layout

### 5.3 Fleet Page
- [ ] Create `src/pages/fleet.tsx`
- [ ] FilterBar integration
- [ ] Search functionality
- [ ] BoatCard grid display
- [ ] Loading skeleton state
- [ ] Empty state (no results)
- [ ] Pagination (if needed)
- [ ] "Add Boat" button (for admin/coach)

### 5.4 Boat Details Page
- [ ] Create `src/pages/boat-details.tsx`
- [ ] Parse `id` from URL params
- [ ] Boat header with status badge
- [ ] Status change dropdown
- [ ] Vessel information section
- [ ] Insurance/registration section
- [ ] Maintenance history list
- [ ] "Add Maintenance" button
- [ ] "Edit Boat" dialog
- [ ] "Delete Boat" confirmation (admin only)
- [ ] Back navigation

### 5.5 Fleet Map Page
- [ ] Create `src/pages/fleet-map.tsx`
- [ ] Initialize Leaflet map
- [ ] Set ESRI satellite tile layer
- [ ] Center on Augusta Sailing Club coordinates
- [ ] Add boat markers
  - [ ] Color by status
  - [ ] Cluster nearby boats
- [ ] Marker popups with boat info
- [ ] Click popup to navigate to details
- [ ] Legend for status colors
- [ ] Handle boats without coordinates

### 5.6 Regatta Page
- [ ] Create `src/pages/regatta.tsx`
- [ ] Filter boats where `status === 'OK'`
- [ ] Optional: filter by `isRegattaPreferred`
- [ ] Boat type filter for fleet selection
- [ ] Grid display of regatta-ready boats
- [ ] Count summary by boat type
- [ ] Print-friendly layout (optional)

### 5.7 Equipment Page
- [ ] Create `src/pages/equipment.tsx`
- [ ] Equipment table/grid
- [ ] Filter by type
- [ ] Filter by status
- [ ] "Add Equipment" dialog
- [ ] Edit equipment dialog
- [ ] Delete confirmation

### 5.8 Report Damage Page
- [ ] Create `src/pages/report-damage.tsx`
- [ ] Tabs: "Report Damage" / "Log Repair"
- [ ] Item type selector (boat/equipment)
- [ ] Item selector dropdown
- [ ] Category selector
- [ ] Severity selector
- [ ] Description textarea
- [ ] Submit button
- [ ] Success confirmation
- [ ] Auto-update boat status for high severity

### 5.9 Not Found Page
- [ ] Create `src/pages/not-found.tsx`
- [ ] 404 message
- [ ] Link back to dashboard

---

## Phase 6: Routing & App Setup

### 6.1 Router Configuration
- [ ] Update `src/App.tsx`
- [ ] Import all page components
- [ ] Set up Wouter routes
- [ ] Wrap with `QueryClientProvider`
- [ ] Wrap with `DemoAuthProvider`
- [ ] Add Toaster for notifications

### 6.2 Query Client Setup
- [ ] Create `src/lib/queryClient.ts`
- [ ] Configure default options
- [ ] Set stale time for demo
- [ ] Export query client instance

### 6.3 Entry Point
- [ ] Update `src/main.tsx`
- [ ] Import global styles
- [ ] Render App component

---

## Phase 7: Demo-Specific Features

### 7.1 Role Switcher Component
- [ ] Create `src/components/RoleSwitcher.tsx`
- [ ] Dropdown with all roles
- [ ] Show current role
- [ ] Update permissions on change
- [ ] Visual indicator of permission level

### 7.2 Reset Data Feature
- [ ] Add "Reset Demo Data" button in sidebar
- [ ] Confirmation dialog
- [ ] Call `mockStore.reset()`
- [ ] Invalidate all queries
- [ ] Show success toast

### 7.3 Demo Banner
- [ ] Add persistent banner at top
- [ ] "You're viewing a demo" message
- [ ] Link to full product info
- [ ] Optionally dismissible

### 7.4 Onboarding/Tour (Optional)
- [ ] First-visit detection
- [ ] Highlight key features
- [ ] Skip option

---

## Phase 8: Polish & Testing

### 8.1 Responsive Design
- [ ] Test all pages on mobile (320px)
- [ ] Test all pages on tablet (768px)
- [ ] Test all pages on desktop (1024px+)
- [ ] Fix any layout issues
- [ ] Ensure touch targets are adequate

### 8.2 Loading States
- [ ] Add skeleton loaders to all pages
- [ ] Verify loading states appear during simulated delays
- [ ] Add loading spinners to buttons during mutations

### 8.3 Error States
- [ ] Add error handling to all hooks
- [ ] Display user-friendly error messages
- [ ] Add retry buttons where appropriate

### 8.4 Empty States
- [ ] Design empty state for fleet (no boats)
- [ ] Design empty state for equipment
- [ ] Design empty state for maintenance history
- [ ] Design empty state for filtered results

### 8.5 Accessibility
- [ ] Verify keyboard navigation
- [ ] Check color contrast ratios
- [ ] Add aria labels where needed
- [ ] Test with screen reader

### 8.6 Performance
- [ ] Add lazy loading for heavy pages (map)
- [ ] Memoize expensive computations
- [ ] Verify bundle size is reasonable
- [ ] Test on slow network simulation

---

## Phase 9: Assets & Branding

### 9.1 Images
- [ ] Add hero background image to `src/assets/`
- [ ] Add logo (or placeholder) to `src/assets/`
- [ ] Add favicon to `public/`
- [ ] Add Open Graph image for social sharing

### 9.2 Meta Tags
- [ ] Update `index.html` title
- [ ] Add meta description
- [ ] Add Open Graph tags
- [ ] Add Twitter card tags

### 9.3 Fonts
- [ ] Add Inter font (Google Fonts or local)
- [ ] Configure in Tailwind
- [ ] Verify font loading

---

## Phase 10: Documentation & Deployment

### 10.1 Documentation
- [ ] Complete README.md
- [ ] Verify ARCHITECTURE.md is accurate
- [ ] Add inline code comments
- [ ] Document environment variables (if any)

### 10.2 Build Verification
- [ ] Run `npm run build`
- [ ] Fix any build errors
- [ ] Test production build locally with `npm run preview`
- [ ] Verify all features work in production build

### 10.3 Deployment
- [ ] Push final code to GitHub
- [ ] Set up Cloudflare Pages (or Vercel/Netlify)
- [ ] Configure build settings
- [ ] Deploy to production
- [ ] Verify live site works
- [ ] Set up custom domain (demo.rigreport.app)

### 10.4 Post-Launch
- [ ] Test all features on live site
- [ ] Share demo link
- [ ] Monitor for any issues
- [ ] Create feedback collection method (optional)

---

## Quick Reference: File Checklist

### `/src/lib/`
- [ ] `types.ts`
- [ ] `mockData.ts`
- [ ] `mockDataStore.ts`
- [ ] `utils.ts`
- [ ] `queryClient.ts`

### `/src/hooks/`
- [ ] `use-boats.ts`
- [ ] `use-equipment.ts`
- [ ] `use-maintenance.ts`
- [ ] `use-demo-auth.tsx`
- [ ] `use-toast.ts`

### `/src/components/ui/`
- [ ] `button.tsx`
- [ ] `card.tsx`
- [ ] `input.tsx`
- [ ] `label.tsx`
- [ ] `select.tsx`
- [ ] `dialog.tsx`
- [ ] `dropdown-menu.tsx`
- [ ] `tabs.tsx`
- [ ] `badge.tsx`
- [ ] `textarea.tsx`
- [ ] `tooltip.tsx`
- [ ] `separator.tsx`
- [ ] `skeleton.tsx`

### `/src/components/`
- [ ] `AppShell.tsx`
- [ ] `Sidebar.tsx`
- [ ] `Header.tsx`
- [ ] `PageHeader.tsx`
- [ ] `StatusBadge.tsx`
- [ ] `BoatCard.tsx`
- [ ] `EquipmentRow.tsx`
- [ ] `MaintenanceItem.tsx`
- [ ] `FilterBar.tsx`
- [ ] `DemoBanner.tsx`
- [ ] `RoleSwitcher.tsx`

### `/src/pages/`
- [ ] `landing.tsx`
- [ ] `dashboard.tsx`
- [ ] `fleet.tsx`
- [ ] `boat-details.tsx`
- [ ] `fleet-map.tsx`
- [ ] `regatta.tsx`
- [ ] `equipment.tsx`
- [ ] `report-damage.tsx`
- [ ] `not-found.tsx`

### Root Files
- [ ] `src/App.tsx`
- [ ] `src/main.tsx`
- [ ] `src/index.css`
- [ ] `index.html`
- [ ] `package.json`
- [ ] `tsconfig.json`
- [ ] `vite.config.ts`
- [ ] `tailwind.config.ts`
- [ ] `postcss.config.js`
- [ ] `README.md`
- [ ] `ARCHITECTURE.md`
- [ ] `CLAUDE.md`

---

## Estimated Timeline

| Phase | Estimated Time |
|-------|---------------|
| Phase 1: Project Setup | 1-2 hours |
| Phase 2: Core Infrastructure | 2-3 hours |
| Phase 3: UI Components | 3-4 hours |
| Phase 4: Hooks & State | 2-3 hours |
| Phase 5: Pages | 6-8 hours |
| Phase 6: Routing & App Setup | 1 hour |
| Phase 7: Demo Features | 1-2 hours |
| Phase 8: Polish & Testing | 2-3 hours |
| Phase 9: Assets & Branding | 1 hour |
| Phase 10: Documentation & Deploy | 1-2 hours |

**Total Estimated Time: 20-30 hours**

---

## Notes

- Phases can be parallelized where dependencies allow
- UI components (Phase 3) can be built incrementally as pages need them
- Mock data can be expanded gradually
- Focus on core pages first (Dashboard, Fleet, Boat Details)
- Map and Regatta pages can be lower priority initially
