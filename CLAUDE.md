# CLAUDE.md - Claude Code Instructions

This file contains instructions and context for Claude Code when working on the RigReport Demo project.

---

## Project Overview

**RigReport Demo** is a frontend-only React application that demonstrates the RigReport fleet management system. It uses mock data and localStorage for persistence—there is no backend or database.

**Purpose**: Allow potential customers to explore RigReport features without creating an account or connecting to a server.

**Key Constraint**: This is a static site that must work without any backend. All data operations use mock functions with simulated delays.

---

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.x | UI framework |
| TypeScript | 5.x | Type safety |
| Vite | 5.x | Build tool & dev server |
| Tailwind CSS | 4.x | Styling |
| shadcn/ui | latest | UI component library |
| Radix UI | latest | Accessible primitives |
| Wouter | 3.x | Client-side routing |
| TanStack Query | 5.x | Async state management |
| Leaflet | 1.9.x | Interactive maps |
| react-leaflet | 4.x | React bindings for Leaflet |
| Lucide React | latest | Icons |
| date-fns | 3.x | Date formatting |

---

## Project Structure

```
rigreport-demo/
├── public/
│   └── favicon.ico
├── src/
│   ├── assets/              # Images, logos
│   │   ├── hero-bg.jpg
│   │   └── logo.png
│   ├── components/
│   │   ├── ui/              # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── ...
│   │   ├── AppShell.tsx     # Main layout
│   │   ├── Sidebar.tsx
│   │   ├── BoatCard.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── FilterBar.tsx
│   │   ├── DemoBanner.tsx
│   │   └── RoleSwitcher.tsx
│   ├── hooks/
│   │   ├── use-boats.ts
│   │   ├── use-equipment.ts
│   │   ├── use-maintenance.ts
│   │   ├── use-demo-auth.tsx
│   │   └── use-toast.ts
│   ├── lib/
│   │   ├── types.ts         # TypeScript interfaces
│   │   ├── mockData.ts      # Static mock data
│   │   ├── mockDataStore.ts # CRUD operations
│   │   ├── utils.ts         # Helper functions
│   │   └── queryClient.ts   # TanStack Query setup
│   ├── pages/
│   │   ├── landing.tsx
│   │   ├── dashboard.tsx
│   │   ├── fleet.tsx
│   │   ├── boat-details.tsx
│   │   ├── fleet-map.tsx
│   │   ├── regatta.tsx
│   │   ├── equipment.tsx
│   │   ├── report-damage.tsx
│   │   └── not-found.tsx
│   ├── App.tsx              # Router & providers
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
├── postcss.config.js
├── components.json          # shadcn/ui config
├── README.md
├── ARCHITECTURE.md
├── TODO.md
└── CLAUDE.md
```

---

## Coding Conventions

### TypeScript

- Use strict TypeScript (`strict: true`)
- Define interfaces in `src/lib/types.ts`
- Prefer `interface` over `type` for object shapes
- Use explicit return types for functions
- Avoid `any` - use `unknown` if type is truly unknown

```typescript
// Good
interface Boat {
  id: string;
  displayName: string;
  status: BoatStatus;
}

function getBoat(id: string): Boat | undefined {
  return boats.find(b => b.id === id);
}

// Avoid
type Boat = {
  id: any;
  displayName: any;
}
```

### React Components

- Use functional components with hooks
- One component per file
- Name files same as component (PascalCase.tsx)
- Use named exports for components
- Destructure props in function signature

```typescript
// Good: src/components/BoatCard.tsx
interface BoatCardProps {
  boat: Boat;
  onEdit?: () => void;
}

export function BoatCard({ boat, onEdit }: BoatCardProps) {
  return (
    <Card>
      {/* ... */}
    </Card>
  );
}

// Avoid
export default function(props) {
  const boat = props.boat;
}
```

### Hooks

- Prefix custom hooks with `use`
- Keep hooks focused on single responsibility
- Return objects for multiple values (not arrays)

```typescript
// Good
export function useBoats() {
  const query = useQuery({
    queryKey: ['boats'],
    queryFn: () => mockStore.getBoats(),
  });
  
  return {
    boats: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
  };
}
```

### Styling

- Use Tailwind CSS utility classes
- Use `cn()` helper for conditional classes
- Follow mobile-first responsive design
- Use CSS custom properties for theme colors

```typescript
import { cn } from '@/lib/utils';

// Good
<div className={cn(
  "p-4 rounded-lg",
  isActive && "bg-primary text-primary-foreground",
  className
)}>

// Avoid inline styles
<div style={{ padding: '16px', borderRadius: '8px' }}>
```

### File Naming

- Components: `PascalCase.tsx` (e.g., `BoatCard.tsx`)
- Hooks: `use-kebab-case.ts` (e.g., `use-boats.ts`)
- Utilities: `camelCase.ts` (e.g., `utils.ts`)
- Pages: `kebab-case.tsx` (e.g., `boat-details.tsx`)
- Types: `types.ts` (single file for all types)

### Imports

- Use path aliases (`@/components/...`)
- Group imports: React, external libs, internal
- Sort alphabetically within groups

```typescript
// React
import { useState, useMemo } from 'react';

// External libraries
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';

// Internal - components
import { Button } from '@/components/ui/button';
import { BoatCard } from '@/components/BoatCard';

// Internal - hooks & utils
import { useBoats } from '@/hooks/use-boats';
import { cn } from '@/lib/utils';
```

---

## Key Implementation Details

### Mock Data Store

The `MockDataStore` class handles all data operations.

**Source:** `src/lib/mockDataStore.ts`

```typescript
class MockDataStore {
  private boats: Boat[];
  private equipment: Equipment[];
  private maintenance: MaintenanceEntry[];
  
  // Load from localStorage or defaults
  constructor() {
    this.boats = this.load('boats') || MOCK_BOATS;
    // ...
  }
  
  // All methods should be async and simulate delay
  async getBoats(): Promise<Boat[]> {
    await this.simulateDelay();
    return [...this.boats];
  }
  
  async updateBoat(id: string, updates: Partial<Boat>): Promise<Boat> {
    await this.simulateDelay();
    // Find, update, save to localStorage
    return updatedBoat;
  }
  
  private simulateDelay(): Promise<void> {
    return new Promise(r => setTimeout(r, 200 + Math.random() * 300));
  }
  
  private save(key: string, data: unknown): void {
    localStorage.setItem(`rigreport_demo_${key}`, JSON.stringify(data));
  }
}

export const mockStore = new MockDataStore();
```

### Demo Authentication

The demo auth system allows role switching without real authentication.

**Source:** `src/hooks/use-demo-auth.tsx`

```typescript

const ROLE_PERMISSIONS = {
  admin: {
    canEdit: true,
    canDelete: true,
    canAddBoats: true,
    canManageUsers: true,
    // ...
  },
  coach: {
    canEdit: true,
    canDelete: false,
    canAddBoats: true,
    canManageUsers: false,
    // ...
  },
  volunteer: {
    canEdit: false,
    canDelete: false,
    canAddBoats: false,
    // ...
  },
  junior_sailor: {
    canEdit: false,
    canDelete: false,
    canAddBoats: false,
    // ...
  },
};

// Provider wraps app and provides:
// - user: DemoUser | null
// - role: Role
// - setRole: (role: Role) => void
// - permissions: Permissions
// - login: () => void
// - logout: () => void
```

### TanStack Query Usage

Use TanStack Query for all data fetching, even though it's mocked.

**Source:** `src/lib/queryClient.ts` (setup), `src/hooks/use-boats.ts` (example)

```typescript
// Fetching data
const { data: boats, isLoading } = useQuery({
  queryKey: ['boats'],
  queryFn: () => mockStore.getBoats(),
});

// Mutations
const updateBoat = useMutation({
  mutationFn: ({ id, data }) => mockStore.updateBoat(id, data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['boats'] });
  },
});

// Usage
updateBoat.mutate({ id: boat.id, data: { status: 'OK' } });
```

### Routing with Wouter

**Source:** `src/App.tsx`

```typescript
import { Route, Switch } from 'wouter';

function App() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/dashboard" component={DashboardPage} />
      <Route path="/fleet" component={FleetPage} />
      <Route path="/fleet/:id" component={BoatDetailsPage} />
      <Route path="/map" component={FleetMapPage} />
      <Route path="/regatta" component={RegattaPage} />
      <Route path="/equipment" component={EquipmentPage} />
      <Route path="/report" component={ReportDamagePage} />
      <Route component={NotFoundPage} />
    </Switch>
  );
}

// In components, use:
import { Link, useLocation, useParams } from 'wouter';

// Navigate
const [, setLocation] = useLocation();
setLocation('/fleet');

// Get URL params
const { id } = useParams<{ id: string }>();
```

### Leaflet Map Setup

**Source:** `src/pages/fleet-map.tsx`

```typescript
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icons
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// ESRI Satellite tiles
const ESRI_SATELLITE = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

function FleetMap() {
  const center: [number, number] = [33.4735, -82.0105]; // Augusta SC
  
  return (
    <MapContainer center={center} zoom={15} className="h-[600px] w-full">
      <TileLayer url={ESRI_SATELLITE} />
      {boats.map(boat => (
        <Marker 
          key={boat.id} 
          position={[boat.latitude, boat.longitude]}
        >
          <Popup>{boat.displayName}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
```

---

## Color Theme

The app uses the RigReport design system with a nautical color palette. The design matches the production RigReport application.

### Primary Colors

| Color | Hex | Usage |
|-------|-----|-------|
| Navy | `#1f2937` | Primary buttons, sidebar background, badges |
| Navy Hover | `#374151` | Button hover states |
| Cyan | `#06B6D4` / `bg-cyan-500` | OK status, positive states |
| Amber | `#F59E0B` / `bg-amber-500` | Needs inspection, warnings |
| Orange | `#F97316` / `bg-orange-500` | Needs repair |
| Red | `#DC2626` / `bg-red-500` | Do not sail, errors |
| Gray | `#6B7280` / `bg-gray-500` | Out of service |

### Status Colors

Defined in `src/lib/utils.ts`:

```typescript
// See: src/lib/utils.ts - getStatusColor()
function getStatusColor(status: BoatStatus): string {
  switch (status) {
    case 'OK': return 'bg-cyan-500 text-white';
    case 'Needs inspection': return 'bg-amber-500 text-white';
    case 'Needs repair': return 'bg-orange-500 text-white';
    case 'Do not sail': return 'bg-red-500 text-white';
    case 'Out of service': return 'bg-gray-500 text-white';
    default: return 'bg-gray-300 text-gray-800';
  }
}
```

### Button Styling

Primary buttons use navy background with consistent styling:

```typescript
// Standard primary button
<Button className="bg-[#1f2937] hover:bg-[#374151]">
  Action
</Button>
```

### Sidebar Design

The sidebar (`src/components/Sidebar.tsx`) uses dark navy styling:
- Background: `bg-[#1f2937]`
- Logo: Cyan accent (`bg-cyan-500`)
- Text: White with gray-400 for inactive items
- Role badges: Purple (admin), Blue (coach), Green (volunteer), Orange (junior)

### Key Source Files for Styling

| File | Purpose |
|------|---------|
| `src/lib/utils.ts` | Status color functions (`getStatusColor`, `getStatusDotColor`) |
| `src/components/Sidebar.tsx` | Navigation sidebar with role badges |
| `src/components/BoatCard.tsx` | Fleet card with status badges |
| `src/components/StatusBadge.tsx` | Reusable status badge component |
| `src/components/EquipmentRow.tsx` | Equipment list item with status |
| `src/components/MaintenanceItem.tsx` | Maintenance entry with severity colors |
| `src/pages/fleet-map.tsx` | Map marker colors (lines 29-35) |

---

## Common Tasks

### Adding a New Page

1. Create file in `src/pages/new-page.tsx`
2. Add route in `src/App.tsx`
3. Add navigation link in `src/components/Sidebar.tsx`
4. Wrap with `<AppShell>` for consistent layout

### Adding a New UI Component

1. Create in `src/components/ui/` following shadcn/ui patterns
2. Use Radix UI primitives if needed
3. Style with Tailwind + CSS variables
4. Export as named export

### Adding Mock Data

1. Add to appropriate array in `src/lib/mockData.ts`
2. Ensure data matches TypeScript interface
3. Include realistic variety (statuses, types, etc.)

### Adding a New Hook

1. Create in `src/hooks/use-name.ts`
2. Use TanStack Query for data fetching
3. Call `mockStore` methods for data operations
4. Return typed object with data and helpers

---

## Common Pitfalls to Avoid

### 1. Don't Forget Simulated Delays
All mock store methods should include delays for realistic UX:
```typescript
// Good
async getBoats() {
  await this.simulateDelay();
  return this.boats;
}

// Bad - instant, unrealistic
getBoats() {
  return this.boats;
}
```

### 2. Don't Mutate Mock Data Directly
Always create new objects/arrays:
```typescript
// Good
this.boats = this.boats.map(b => 
  b.id === id ? { ...b, ...updates } : b
);

// Bad - mutates original
const boat = this.boats.find(b => b.id === id);
boat.status = 'OK';
```

### 3. Don't Forget to Invalidate Queries
After mutations, invalidate affected queries:
```typescript
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['boats'] });
}
```

### 4. Don't Use Real API Calls
This is a static demo - no fetch() to external APIs:
```typescript
// Bad - will fail in production
const res = await fetch('/api/boats');

// Good - use mock store
const boats = await mockStore.getBoats();
```

### 5. Don't Forget Permission Checks
Check permissions before rendering edit/delete UI:
```typescript
const { permissions } = useDemoAuth();

{permissions.canEdit && (
  <Button onClick={handleEdit}>Edit</Button>
)}
```

### 6. Don't Forget Loading States
Always handle loading in UI:
```typescript
if (isLoading) {
  return <Skeleton className="h-32 w-full" />;
}
```

---

## Testing the Build

Before deploying, always test the production build:

```bash
# Build
npm run build

# Preview locally
npm run preview
```

Check for:
- All routes work
- Images load correctly
- Map displays properly
- localStorage persists data
- No console errors

---

## Deployment Notes

This is a static site - deploy to any static hosting:

- **Cloudflare Pages**: Build command `npm run build`, output `dist`
- **Vercel**: Auto-detects Vite
- **Netlify**: Build command `npm run build`, publish `dist`

No environment variables required since there's no backend.

---

## Reference: Type Definitions

```typescript
// Core types - copy these exactly
type Role = 'admin' | 'coach' | 'volunteer' | 'junior_sailor';

type BoatStatus = 'OK' | 'Needs inspection' | 'Needs repair' | 'Do not sail' | 'Out of service';

type BoatType = '420' | 'Club 420' | 'Open BIC' | 'Sunfish' | 'Coach Boat' | 
                'Safety Boat' | 'Skiff' | 'Pontoon' | 'RS Tera' | 'Hobie Wave' | 
                'Tracker' | 'Hunter 15' | 'RIB' | 'Zodiac' | 'Kayak' | 'Canoe' | 'Other';

type Organization = 'ACS' | 'ASC' | 'SOA';

type MaintenanceCategory = 'Inspection' | 'Repair' | 'Rigging issue' | 
                           'Hull damage' | 'Rigging check' | 'Inventory' | 'Other';

type MaintenanceSeverity = 'Low' | 'Medium' | 'High';

type MaintenanceStatus = 'Open' | 'In progress' | 'Resolved';

type EquipmentType = 'Trailer' | 'Sail' | 'Rigging' | 'Dolly' | 'Motor' | 'Safety' | 'Other';
```

---

## Quick Commands

```bash
# Development
npm run dev          # Start dev server at localhost:5173

# Building
npm run build        # Production build to dist/
npm run preview      # Preview production build

# Type checking
npx tsc --noEmit     # Check types without building

# Linting (if configured)
npm run lint         # Run ESLint
```

---

## Getting Help

If stuck on implementation:
1. Check the production RigReport codebase at `/Users/milliesmalley/REPO/RIGREPORT_GIT` for reference
2. Review shadcn/ui documentation for component patterns
3. Check TanStack Query docs for data fetching patterns
4. Review Wouter docs for routing patterns

### Production RigReport Reference

The demo mirrors the production RigReport design. Key reference files in the production codebase:
- Design system colors and patterns
- Component styling conventions
- Status badge implementations

Remember: This is a **demo** - prioritize working features over perfection. The goal is to showcase RigReport's capabilities, not build a production system.
