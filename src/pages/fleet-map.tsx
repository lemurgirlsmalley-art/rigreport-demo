import { useEffect, useMemo } from 'react';
import { Link } from 'wouter';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { List } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useBoats } from '@/hooks/use-boats';
import { getStatusDotColor } from '@/lib/utils';
import type { Boat, BoatStatus } from '@/lib/types';

// Fix Leaflet default icon issue
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Center of Augusta Sailing Club
const CENTER: [number, number] = [33.4735, -82.0105];

// ESRI Satellite tiles
const ESRI_SATELLITE =
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

// Status colors for markers (matching production HSL values)
const statusColors: Record<BoatStatus, string> = {
  OK: '#00A894',           // hsl(187 100% 30%) - Teal/Secondary
  'Needs inspection': '#F59E0B', // hsl(35 90% 50%) - Orange/Accent
  'Needs repair': '#F97316',     // Orange-500
  'Do not sail': '#EF4444',      // hsl(0 84.2% 60.2%) - Red/Destructive
  'Out of service': '#6B7280',   // Gray
};

function createMarkerIcon(status: BoatStatus): L.DivIcon {
  const color = statusColors[status] || '#6B7280';
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 24px;
        height: 24px;
        background-color: ${color};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      "></div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
}

function BoatMarker({ boat }: { boat: Boat }) {
  if (!boat.latitude || !boat.longitude) return null;

  const icon = createMarkerIcon(boat.status);

  return (
    <Marker position={[boat.latitude, boat.longitude]} icon={icon}>
      <Popup>
        <div className="min-w-[200px]">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <h3 className="font-semibold">{boat.displayName}</h3>
              <p className="text-sm text-muted-foreground">
                {boat.type} • {boat.hullNumber}
              </p>
            </div>
          </div>
          <div className="mb-3">
            <StatusBadge status={boat.status} size="sm" />
          </div>
          <p className="text-sm text-muted-foreground mb-3">{boat.location}</p>
          <Link href={`/fleet/${boat.id}`}>
            <Button size="sm" className="w-full bg-[#1f2937] hover:bg-[#374151]">
              View Details
            </Button>
          </Link>
        </div>
      </Popup>
    </Marker>
  );
}

export function FleetMapPage() {
  const { boats, isLoading } = useBoats();

  // Fix default icon on mount
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconUrl: markerIcon,
      iconRetinaUrl: markerIcon2x,
      shadowUrl: markerShadow,
    });
  }, []);

  const boatsWithLocation = useMemo(
    () => boats.filter((b) => b.latitude && b.longitude),
    [boats]
  );

  // Group boats by location
  const boatsByLocation = useMemo(() => {
    const grouped: Record<string, Boat[]> = {};
    boats.forEach((boat) => {
      if (!grouped[boat.location]) {
        grouped[boat.location] = [];
      }
      grouped[boat.location].push(boat);
    });
    return grouped;
  }, [boats]);

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Fleet Map</h1>
            <p className="text-muted-foreground mt-1">
              View boat locations on the satellite map. {boatsWithLocation.length} of {boats.length} boats have coordinates.
            </p>
          </div>
          <Link href="/fleet">
            <Button variant="outline" className="gap-2">
              <List className="h-4 w-4" />
              View Fleet List
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <Skeleton className="h-[600px] w-full rounded-lg" />
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
            {/* Map */}
            <div className="relative">
              <div className="h-[600px] rounded-lg overflow-hidden border shadow-sm">
                <MapContainer
                  center={CENTER}
                  zoom={15}
                  className="h-full w-full"
                  scrollWheelZoom={true}
                >
                  <TileLayer
                    url={ESRI_SATELLITE}
                    attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
                  />
                  {boatsWithLocation.map((boat) => (
                    <BoatMarker key={boat.id} boat={boat} />
                  ))}
                </MapContainer>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-4">
              {/* Legend */}
              <Card className="border-0 shadow-sm bg-white">
                <CardContent className="p-4">
                  <h4 className="text-sm font-semibold mb-3">Legend</h4>
                  <div className="space-y-2">
                    {[
                      { status: 'OK' as BoatStatus, label: 'OK' },
                      { status: 'Needs inspection' as BoatStatus, label: 'Needs inspection' },
                      { status: 'Needs repair' as BoatStatus, label: 'Needs repair' },
                      { status: 'Do not sail' as BoatStatus, label: 'Do not sail' },
                      { status: 'Out of service' as BoatStatus, label: 'Out of service' },
                    ].map(({ status, label }) => (
                      <div key={status} className="flex items-center gap-2 text-sm">
                        <div className={`w-3 h-3 rounded-full ${getStatusDotColor(status)}`} />
                        <span className="text-muted-foreground">{label}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">
                    Numbers on markers indicate multiple boats at that location. Click to see all boats.
                  </p>
                </CardContent>
              </Card>

              {/* Locations List */}
              <Card className="border-0 shadow-sm bg-white">
                <CardContent className="p-4">
                  <h4 className="text-sm font-semibold mb-3">Locations ({Object.keys(boatsByLocation).length})</h4>
                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {Object.entries(boatsByLocation).map(([location, locationBoats]) => (
                      <div key={location} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{location}</span>
                          <span className="text-xs text-muted-foreground">{locationBoats.length} boat{locationBoats.length !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {locationBoats.slice(0, 4).map((boat) => (
                            <Link key={boat.id} href={`/fleet/${boat.id}`}>
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs ${getStatusDotColor(boat.status).replace('bg-', 'bg-opacity-20 text-').replace('-500', '-700')}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${getStatusDotColor(boat.status)}`} />
                                {boat.displayName}
                              </span>
                            </Link>
                          ))}
                          {locationBoats.length > 4 && (
                            <span className="text-xs text-muted-foreground">+{locationBoats.length - 4} more</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
