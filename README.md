# RigReport Demo

A fully interactive demo of RigReport - the fleet management system built for sailing clubs. This demo showcases all features using mock data, requiring no backend or database setup.

**Live Demo**: [demo.rigreport.app](https://demo.rigreport.app) *(once deployed)*

---

## What is RigReport?

RigReport is a fleet management and maintenance tracking system specifically designed for sailing clubs. It helps clubs:

- Track boat status (OK, Needs Inspection, Needs Repair, Do Not Sail)
- Log maintenance and inspection history
- Manage equipment inventory (trailers, sails, dollies)
- View boat locations on an interactive satellite map
- Quickly identify race-ready boats for regattas
- Export fleet data to Excel for insurance/reports

This demo version lets you explore all features without needing to create an account or connect to a database.

---

## Features Demonstrated

### 🚀 Dashboard
- Fleet health summary cards
- Status breakdown by category
- Recent maintenance activity
- Quick actions for common tasks

### ⛵ Fleet Management
- Browse 70+ boats across 3 organizations (ACS, ASC, SOA)
- Filter by status, boat type, organization, and program
- Search boats by name or sail number
- View detailed vessel information
- Edit boat status and details

### 🗺️ Fleet Map
- Interactive satellite map (Leaflet + ESRI imagery)
- Boat markers color-coded by status
- Clustered markers for boats at same location
- Click markers to view boat details

### 🏁 Regatta View
- One-click view of all race-ready boats
- Filter by boat type for specific fleets
- Quick status overview for coaches

### 🔧 Maintenance Tracking
- Log damage reports
- Record completed repairs
- Track maintenance history per vessel
- Set severity levels (Low, Medium, High)

### 📦 Equipment Management
- Track standalone equipment (trailers, dollies, motors)
- Equipment status and inspection dates
- Storage location tracking

### 👤 Demo Authentication
- Experience role-based UI (Admin, Coach, Volunteer, Junior Sailor)
- Switch between roles to see different permission levels
- No real login required

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React 18 + TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS v4 |
| Components | shadcn/ui + Radix UI |
| Routing | Wouter |
| State | TanStack Query (mocked) |
| Maps | Leaflet + React-Leaflet |
| Icons | Lucide React |

---

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/rigreport-demo.git

# Navigate to project
cd rigreport-demo

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
# Create production build
npm run build

# Preview production build locally
npm run preview
```

---

## Project Structure

```
rigreport-demo/
├── public/                 # Static assets
│   └── favicon.ico
├── src/
│   ├── assets/            # Images, logos
│   ├── components/
│   │   ├── ui/            # shadcn/ui components
│   │   ├── AppShell.tsx   # Main layout wrapper
│   │   ├── BoatCard.tsx   # Boat display card
│   │   ├── StatusBadge.tsx
│   │   └── ...
│   ├── hooks/
│   │   ├── use-boats.ts   # Mock boat data hook
│   │   ├── use-equipment.ts
│   │   ├── use-maintenance.ts
│   │   └── use-demo-auth.ts
│   ├── lib/
│   │   ├── mockData.ts    # All demo data (70+ boats)
│   │   ├── types.ts       # TypeScript interfaces
│   │   └── utils.ts       # Utility functions
│   ├── pages/
│   │   ├── dashboard.tsx
│   │   ├── fleet.tsx
│   │   ├── fleet-map.tsx
│   │   ├── regatta.tsx
│   │   ├── boat-details.tsx
│   │   ├── equipment.tsx
│   │   ├── report-damage.tsx
│   │   └── landing.tsx
│   ├── App.tsx            # Router setup
│   ├── main.tsx           # Entry point
│   └── index.css          # Global styles + Tailwind
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
├── components.json        # shadcn/ui config
└── README.md
```

---

## Deployment

### Cloudflare Pages (Recommended - Free)

1. Push code to GitHub
2. Go to [Cloudflare Pages](https://pages.cloudflare.com/)
3. Connect your repository
4. Configure build:
   - **Build command**: `npm run build`
   - **Output directory**: `dist`
5. Deploy!

### Vercel (Free)

```bash
npm install -g vercel
vercel
```

### Netlify (Free)

1. Push to GitHub
2. Connect repo at [Netlify](https://netlify.com)
3. Build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`

---

## Demo Data

The demo includes realistic mock data representing a typical sailing club:

- **70+ boats** across 3 organizations:
  - ACS (Augusta Community Sailing)
  - ASC (Augusta Sailing Club)  
  - SOA (Sailing Organization of Augusta)
  
- **Boat types**: 420, Club 420, Open BIC, Sunfish, RS Tera, Hobie Wave, Hunter 15, RIB, Kayak, Coach Boats, and more

- **Status distribution**:
  - OK: ~70%
  - Needs Inspection: ~15%
  - Needs Repair: ~10%
  - Do Not Sail: ~5%

- **Equipment**: Trailers, dollies, sails, safety equipment

---

## Customization

### Branding

Update these files to customize for your club:

1. `src/assets/` - Replace logo images
2. `tailwind.config.ts` - Adjust color palette
3. `src/lib/mockData.ts` - Replace with your fleet data
4. `index.html` - Update title and meta tags

### Colors (Current Theme)

```css
--navy: #0F2A4A     /* Primary */
--teal: #16A085     /* Secondary/Success */
--white: #FFFFFF    /* Background */
--gray: #64748b     /* Muted text */
```

---

## Related Projects

- **RigReport (Production)**: Full-featured version with backend, auth, and database
- **RigReport Marketing Site**: Product landing page at rigreport.app

---

## License

MIT License - Feel free to use this demo as a starting point for your own fleet management system.

---

## Questions?

This demo is part of the RigReport product suite. For the full version with:
- Real database persistence
- Multi-user authentication
- Custom branding for your club
- Your own domain

Visit [rigreport.app](https://rigreport.app) or contact us for a personalized demo.
