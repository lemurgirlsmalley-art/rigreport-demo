# RigReport Demo - Architecture

This document describes the technical architecture of the RigReport Demo application. Since this is a frontend-only demo with no backend, the architecture focuses on mock data management, component structure, and state handling.

---

## Table of Contents

1. [High-Level Overview](#high-level-overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Data Layer](#data-layer)
4. [Component Architecture](#component-architecture)
5. [State Management](#state-management)
6. [Routing](#routing)
7. [Styling System](#styling-system)
8. [Key Differences from Production](#key-differences-from-production)

---

## High-Level Overview

The RigReport Demo is a **single-page application (SPA)** built with React that simulates the full RigReport experience using in-memory mock data. All data operations (CRUD) persist only for the current browser session.

### Core Principles

1. **No Backend Required**: All data is mocked client-side
2. **Session Persistence**: Data changes persist via localStorage during the session
3. **Realistic UX**: Simulates loading states, API delays, and real workflows
4. **Feature Parity**: Demonstrates all production features
5. **Portable**: Can be deployed to any static hosting service

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser (Client)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                     React Application                     │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │                                                          │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │  │
│  │  │   Pages     │  │  Components │  │   Hooks     │      │  │
│  │  │             │  │             │  │             │      │  │
│  │  │ - Dashboard │  │ - AppShell  │  │ - useBoats  │      │  │
│  │  │ - Fleet     │  │ - BoatCard  │  │ - useEquip  │      │  │
│  │  │ - FleetMap  │  │ - StatusBdg │  │ - useMaint  │      │  │
│  │  │ - Regatta   │  │ - Sidebar   │  │ - useDemoAuth│     │  │
│  │  │ - Equipment │  │ - etc.      │  │             │      │  │
│  │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘      │  │
│  │         │                │                │              │  │
│  │         └────────────────┴────────────────┘              │  │
│  │                          │                               │  │
│  │                          ▼                               │  │
│  │  ┌──────────────────────────────────────────────────┐   │  │
│  │  │              Mock Data Layer                      │   │  │
│  │  │                                                   │   │  │
│  │  │  ┌─────────────┐  ┌─────────────┐               │   │  │
│  │  │  │ mockData.ts │  │ localStorage│               │   │  │
│  │  │  │ (Initial)   │◄─┤ (Mutations) │               │   │  │
│  │  │  └─────────────┘  └─────────────┘               │   │  │
│  │  └──────────────────────────────────────────────────┘   │  │
│  │                                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Layer

### Mock Data Structure

All mock data is defined in `src/lib/mockData.ts` and follows the same TypeScript interfaces as the production system.

#### Data Types

```typescript
// src/lib/types.ts

// User roles for demo auth
type Role = 'admin' | 'coach' | 'volunteer' | 'junior_sailor';

// Boat status options
type BoatStatus = 'OK' | 'Needs inspection' | 'Needs repair' | 'Do not sail' | 'Out of service';

// Boat types available
type BoatType = '420' | 'Club 420' | 'Open BIC' | 'Sunfish' | 'Coach Boat' | 
                'Safety Boat' | 'Skiff' | 'Pontoon' | 'RS Tera' | 'Hobie Wave' | 
                'Tracker' | 'Hunter 15' | 'RIB' | 'Zodiac' | 'Kayak' | 'Canoe' | 'Other';

// Organizations
type Organization = 'ACS' | 'ASC' | 'SOA';

// Maintenance categories
type MaintenanceCategory = 'Inspection' | 'Repair' | 'Rigging issue' | 
                           'Hull damage' | 'Rigging check' | 'Inventory' | 'Other';

type MaintenanceSeverity = 'Low' | 'Medium' | 'High';
type MaintenanceStatus = 'Open' | 'In progress' | 'Resolved';
```

#### Primary Entities

```typescript
interface Boat {
  id: string;
  displayName: string;
  sailNumber?: string;
  boatType: BoatType;
  programTag: string;
  storageLocation: string;
  status: BoatStatus;
  isRegattaPreferred: boolean;
  organization: Organization;
  
  // Vessel details
  description?: string;
  manufacturer?: string;
  length?: string;
  yearBuilt?: number;
  
  // Registration
  hin?: string;
  registration?: string;
  registrationExpiration?: string;
  
  // Insurance
  limitOfInsurance?: number;
  deductible?: number;
  
  // Location (for map)
  latitude?: number;
  longitude?: number;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

interface Equipment {
  id: string;
  name: string;
  type: 'Trailer' | 'Sail' | 'Rigging' | 'Dolly' | 'Motor' | 'Safety' | 'Other';
  storageLocation: string;
  status: BoatStatus;
  notes?: string;
  value?: number;
  limitOfInsurance?: number;
  purchaseDate?: string;
  lastInspectionDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface MaintenanceEntry {
  id: string;
  boatId: string;
  createdBy: string;
  date: string;
  category: MaintenanceCategory;
  severity: MaintenanceSeverity;
  description: string;
  status: MaintenanceStatus;
  partsUsed?: string;
  costEstimate?: number;
  resolvedAt?: string;
  resolvedBy?: string;
}
```

### Mock Data Store

The demo uses a combination of initial static data and localStorage for persistence:

```typescript
// src/lib/mockDataStore.ts

class MockDataStore {
  private boats: Boat[];
  private equipment: Equipment[];
  private maintenance: MaintenanceEntry[];
  
  constructor() {
    // Load from localStorage or use defaults
    this.boats = this.load('boats') || MOCK_BOATS;
    this.equipment = this.load('equipment') || MOCK_EQUIPMENT;
    this.maintenance = this.load('maintenance') || MOCK_MAINTENANCE;
  }
  
  private load<T>(key: string): T | null {
    const data = localStorage.getItem(`rigreport_demo_${key}`);
    return data ? JSON.parse(data) : null;
  }
  
  private save(key: string, data: any): void {
    localStorage.setItem(`rigreport_demo_${key}`, JSON.stringify(data));
  }
  
  // CRUD operations with simulated delay
  async getBoats(): Promise<Boat[]> {
    await this.simulateDelay();
    return [...this.boats];
  }
  
  async updateBoat(id: string, updates: Partial<Boat>): Promise<Boat> {
    await this.simulateDelay();
    const index = this.boats.findIndex(b => b.id === id);
    if (index === -1) throw new Error('Boat not found');
    
    this.boats[index] = { 
      ...this.boats[index], 
      ...updates, 
      updatedAt: new Date().toISOString() 
    };
    this.save('boats', this.boats);
    return this.boats[index];
  }
  
  private simulateDelay(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300));
  }
  
  // Reset to initial data
  reset(): void {
    localStorage.removeItem('rigreport_demo_boats');
    localStorage.removeItem('rigreport_demo_equipment');
    localStorage.removeItem('rigreport_demo_maintenance');
    this.boats = [...MOCK_BOATS];
    this.equipment = [...MOCK_EQUIPMENT];
    this.maintenance = [...MOCK_MAINTENANCE];
  }
}

export const mockStore = new MockDataStore();
```

---

## Component Architecture

### Component Hierarchy

```
App
├── Landing Page (public)
│
└── AppShell (authenticated layout)
    ├── Sidebar
    │   ├── Navigation Links
    │   ├── User Info
    │   └── Role Switcher (demo only)
    │
    └── Page Content
        ├── Dashboard
        │   ├── SummaryCards
        │   ├── StatusBreakdown
        │   ├── RecentActivity
        │   └── QuickActions
        │
        ├── Fleet
        │   ├── FilterBar
        │   ├── SearchInput
        │   ├── BoatGrid
        │   │   └── BoatCard (×n)
        │   └── Pagination
        │
        ├── BoatDetails
        │   ├── BoatHeader
        │   ├── StatusEditor
        │   ├── VesselInfo
        │   ├── InsuranceInfo
        │   └── MaintenanceHistory
        │
        ├── FleetMap
        │   ├── MapContainer (Leaflet)
        │   ├── BoatMarkers
        │   └── MarkerPopups
        │
        ├── Regatta
        │   ├── FleetFilter
        │   └── RegattaBoatGrid
        │
        ├── Equipment
        │   ├── EquipmentTable
        │   └── EquipmentDialog
        │
        └── ReportDamage
            ├── ItemSelector
            ├── DamageForm
            └── RepairForm
```

### Component Types

#### 1. Page Components (`src/pages/`)

Full-page views that handle routing and compose smaller components:

```typescript
// Example: src/pages/fleet.tsx
export default function FleetPage() {
  const { boats, isLoading } = useBoats();
  const [filters, setFilters] = useState(defaultFilters);
  
  const filteredBoats = useMemo(() => 
    applyFilters(boats, filters), 
    [boats, filters]
  );
  
  return (
    <AppShell>
      <FilterBar filters={filters} onChange={setFilters} />
      <BoatGrid boats={filteredBoats} isLoading={isLoading} />
    </AppShell>
  );
}
```

#### 2. Layout Components (`src/components/`)

Structural components providing consistent page layout:

```typescript
// src/components/AppShell.tsx
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="lg:pl-64">
        <div className="container py-6">
          {children}
        </div>
      </main>
    </div>
  );
}
```

#### 3. UI Components (`src/components/ui/`)

Reusable, styled primitives from shadcn/ui:

- Button, Card, Dialog, Select, Input, etc.
- Built on Radix UI for accessibility
- Customized with Tailwind CSS

#### 4. Feature Components

Domain-specific components:

```typescript
// src/components/BoatCard.tsx
interface BoatCardProps {
  boat: Boat;
  onEdit?: () => void;
}

export function BoatCard({ boat, onEdit }: BoatCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between">
          <CardTitle>{boat.displayName}</CardTitle>
          <StatusBadge status={boat.status} />
        </div>
      </CardHeader>
      <CardContent>
        {/* Boat details */}
      </CardContent>
    </Card>
  );
}
```

---

## State Management

### TanStack Query (Mocked)

The demo uses TanStack Query patterns with mock implementations:

```typescript
// src/hooks/use-boats.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockStore } from '@/lib/mockDataStore';

export function useBoats() {
  return useQuery({
    queryKey: ['boats'],
    queryFn: () => mockStore.getBoats(),
  });
}

export function useBoat(id: string) {
  return useQuery({
    queryKey: ['boats', id],
    queryFn: () => mockStore.getBoat(id),
    enabled: !!id,
  });
}

export function useUpdateBoat() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Boat> }) =>
      mockStore.updateBoat(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boats'] });
    },
  });
}
```

### Demo Authentication

A simplified auth context for role switching:

```typescript
// src/hooks/use-demo-auth.tsx
interface DemoAuthContext {
  user: DemoUser | null;
  role: Role;
  setRole: (role: Role) => void;
  permissions: Permissions;
  login: () => void;
  logout: () => void;
}

const ROLE_PERMISSIONS: Record<Role, Permissions> = {
  admin: {
    canEdit: true,
    canDelete: true,
    canAddBoats: true,
    canAddEquipment: true,
    canManageUsers: true,
    canAddDamageReports: true,
    canViewFleet: true,
  },
  coach: {
    canEdit: true,
    canDelete: false,
    canAddBoats: true,
    canAddEquipment: true,
    canManageUsers: false,
    canAddDamageReports: true,
    canViewFleet: true,
  },
  volunteer: {
    canEdit: false,
    canDelete: false,
    canAddBoats: false,
    canAddEquipment: false,
    canManageUsers: false,
    canAddDamageReports: true,
    canViewFleet: true,
  },
  junior_sailor: {
    canEdit: false,
    canDelete: false,
    canAddBoats: false,
    canAddEquipment: false,
    canManageUsers: false,
    canAddDamageReports: true,
    canViewFleet: true,
  },
};
```

---

## Routing

### Route Structure

Using Wouter for lightweight client-side routing:

```typescript
// src/App.tsx
import { Route, Switch } from 'wouter';

function App() {
  return (
    <DemoAuthProvider>
      <QueryClientProvider client={queryClient}>
        <Switch>
          {/* Public routes */}
          <Route path="/" component={LandingPage} />
          
          {/* Protected routes (demo: always accessible) */}
          <Route path="/dashboard" component={DashboardPage} />
          <Route path="/fleet" component={FleetPage} />
          <Route path="/fleet/:id" component={BoatDetailsPage} />
          <Route path="/map" component={FleetMapPage} />
          <Route path="/regatta" component={RegattaPage} />
          <Route path="/equipment" component={EquipmentPage} />
          <Route path="/report" component={ReportDamagePage} />
          
          {/* 404 */}
          <Route component={NotFoundPage} />
        </Switch>
      </QueryClientProvider>
    </DemoAuthProvider>
  );
}
```

### Route Definitions

| Path | Page | Description |
|------|------|-------------|
| `/` | Landing | Marketing/welcome page |
| `/dashboard` | Dashboard | Fleet overview & stats |
| `/fleet` | Fleet | Boat list with filters |
| `/fleet/:id` | BoatDetails | Individual boat view |
| `/map` | FleetMap | Satellite map view |
| `/regatta` | Regatta | Race-ready boats |
| `/equipment` | Equipment | Equipment inventory |
| `/report` | ReportDamage | Damage/repair forms |

---

## Styling System

### Tailwind CSS v4 Configuration

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Nautical theme
        primary: {
          DEFAULT: '#0F2A4A', // Navy
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#16A085', // Teal
          foreground: '#FFFFFF',
        },
        accent: {
          DEFAULT: '#F59E0B', // Amber (warnings)
          foreground: '#FFFFFF',
        },
        destructive: {
          DEFAULT: '#DC2626', // Red
          foreground: '#FFFFFF',
        },
        muted: {
          DEFAULT: '#F1F5F9',
          foreground: '#64748B',
        },
        background: '#FFFFFF',
        foreground: '#0F172A',
        border: '#E2E8F0',
      },
      fontFamily: {
        heading: ['Inter', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
```

### CSS Custom Properties

```css
/* src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 213 67% 18%;
    --primary-foreground: 0 0% 100%;
    --secondary: 168 74% 36%;
    --secondary-foreground: 0 0% 100%;
    --muted: 210 40% 96%;
    --muted-foreground: 215 16% 47%;
    --accent: 38 92% 50%;
    --destructive: 0 84% 60%;
    --border: 214 32% 91%;
    --radius: 0.5rem;
  }
}
```

---

## Key Differences from Production

| Aspect | Production | Demo |
|--------|------------|------|
| **Backend** | Express.js + PostgreSQL | None (client-only) |
| **Authentication** | Passport.js + sessions | Simulated role switching |
| **Data Persistence** | PostgreSQL via Drizzle ORM | localStorage (session only) |
| **API Calls** | Real HTTP requests | Mock functions with delays |
| **User Management** | Full CRUD with approval flow | Demo user with role toggle |
| **Email Notifications** | Resend integration | None |
| **File Uploads** | Server storage | Not implemented |
| **Multi-tenancy** | Database-backed orgs | Static mock data |

### Demo-Only Features

1. **Role Switcher**: Toggle between Admin/Coach/Volunteer/Junior Sailor to see different permission levels
2. **Reset Data**: Button to restore all mock data to initial state
3. **Demo Banner**: Persistent banner indicating this is a demo
4. **Simulated Delays**: Artificial loading states for realistic UX

---

## Performance Considerations

### Bundle Optimization

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-select'],
          'map-vendor': ['leaflet', 'react-leaflet'],
        },
      },
    },
  },
});
```

### Lazy Loading

```typescript
// Lazy load heavy components
const FleetMap = lazy(() => import('./pages/fleet-map'));
const BoatDetails = lazy(() => import('./pages/boat-details'));
```

### Memoization

```typescript
// Memoize expensive computations
const filteredBoats = useMemo(() => {
  return boats.filter(boat => {
    if (statusFilter && boat.status !== statusFilter) return false;
    if (typeFilter && boat.boatType !== typeFilter) return false;
    if (orgFilter && boat.organization !== orgFilter) return false;
    return true;
  });
}, [boats, statusFilter, typeFilter, orgFilter]);
```

---

## Security Notes

Since this is a demo with no backend:

- **No sensitive data**: All data is mock/fictional
- **No authentication secrets**: Demo auth is client-side only
- **No API keys exposed**: Map tiles use public ESRI imagery
- **localStorage only**: Data doesn't leave the browser

For production deployment considerations, see the main RigReport documentation.
