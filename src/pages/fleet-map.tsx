import { useEffect, useMemo } from 'react';
import { Link } from 'wouter';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Ship, MapPin, ExternalLink, ChevronRight } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useBoats } from '@/hooks/use-boats';
import type { Boat, BoatStatus, Organization } from '@/lib/types';
import orgLogo from '@/assets/org-logo.png';

// Fix Leaflet default icon issue
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Hawaii coordinates (center point for map)
const CENTER: [number, number] = [20.00535, -155.26192];

// ESRI Satellite tiles
const ESRI_SATELLITE =
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

// Organization logos and names
const orgLogos: Record<Organization, string> = {
  EO: orgLogo,
  YOH: orgLogo,
  DSC: orgLogo,
};

const orgNames: Record<Organization, string> = {
  EO: 'Example Organization',
  YOH: 'Your Organization Here',
  DSC: 'Demo Sailing Club',
};

// Status colors for markers
const statusColors: Record<BoatStatus, string> = {
  'OK': '#22c55e',
  'Needs inspection': '#f59e0b',
  'Needs repair': '#f97316',
  'Do not sail': '#ef4444',
  'Out of service': '#6b7280',
};

type BoatWithCoords = Boat & { latitude: number; longitude: number };

interface LocationGroup {
  key: string;
  latitude: number;
  longitude: number;
  boats: BoatWithCoords[];
}

function createBoatIcon(status: BoatStatus) {
  const color = statusColors[status] || '#6b7280';
  return L.divIcon({
    className: 'custom-boat-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 .6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
          <path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.9.94 5.34 2.81 7.76"/>
          <path d="M19 13V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6"/>
          <path d="M12 10v4"/>
          <path d="M12 2v3"/>
        </svg>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
}

function createClusterIcon(count: number, hasIssues: boolean) {
  const bgColor = hasIssues ? '#f59e0b' : '#22c55e';
  return L.divIcon({
    className: 'custom-cluster-marker',
    html: `
      <div style="
        background-color: ${bgColor};
        width: 44px;
        height: 44px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.35);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        color: white;
        font-size: 14px;
        cursor: pointer;
      ">
        ${count}
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -22],
  });
}

function groupBoatsByLocation(boats: BoatWithCoords[]): LocationGroup[] {
  const groups: Map<string, LocationGroup> = new Map();

  boats.forEach(boat => {
    const key = `${boat.latitude.toFixed(5)},${boat.longitude.toFixed(5)}`;
    if (!groups.has(key)) {
      groups.set(key, {
        key,
        latitude: boat.latitude,
        longitude: boat.longitude,
        boats: [],
      });
    }
    groups.get(key)!.boats.push(boat);
  });

  return Array.from(groups.values());
}

function SingleBoatPopup({ boat }: { boat: BoatWithCoords }) {
  return (
    <div className="min-w-[200px]">
      <div className="flex items-center gap-2 mb-2">
        <img
          src={orgLogos[boat.organization]}
          alt={orgNames[boat.organization]}
          className="h-6 w-auto"
        />
        <span className="font-bold text-base">{boat.displayName}</span>
      </div>
      <div className="space-y-1 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Type:</span>
          <span>{boat.type}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Status:</span>
          <span
            className="font-medium"
            style={{ color: statusColors[boat.status] }}
          >
            {boat.status}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Location:</span>
          <span>{boat.location}</span>
        </div>
      </div>
      <div className="mt-3 pt-2 border-t">
        <Link href={`/fleet/${boat.id}`}>
          <Button size="sm" variant="outline" className="w-full text-xs">
            <ExternalLink className="h-3 w-3 mr-1" /> View Details
          </Button>
        </Link>
      </div>
    </div>
  );
}

function MultiBoatPopup({ boats, locationName }: { boats: BoatWithCoords[], locationName: string }) {
  return (
    <div className="min-w-[260px] max-w-[300px]">
      <div className="font-bold text-base mb-1 flex items-center gap-2">
        <MapPin className="h-4 w-4 text-primary" />
        {locationName}
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        {boats.length} boats at this location
      </p>
      <div className="max-h-[250px] overflow-y-auto space-y-1 pr-1">
        {boats.map(boat => (
          <Link key={boat.id} href={`/fleet/${boat.id}`}>
            <div className="flex items-center gap-2 p-2 rounded hover:bg-slate-100 cursor-pointer transition-colors border border-slate-200">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: statusColors[boat.status] }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <img
                    src={orgLogos[boat.organization]}
                    alt={orgNames[boat.organization]}
                    className="h-4 w-auto"
                  />
                  <span className="text-sm font-medium truncate">{boat.displayName}</span>
                </div>
                <p className="text-xs text-muted-foreground truncate">{boat.type}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function LocationMarkers({ locationGroups }: { locationGroups: LocationGroup[] }) {
  return (
    <>
      {locationGroups.map((group) => {
        const isSingleBoat = group.boats.length === 1;
        const hasIssues = group.boats.some(b => b.status !== 'OK');
        const locationName = group.boats[0]?.location || 'Unknown Location';

        if (isSingleBoat) {
          const boat = group.boats[0];
          return (
            <Marker
              key={group.key}
              position={[group.latitude, group.longitude]}
              icon={createBoatIcon(boat.status)}
            >
              <Popup>
                <SingleBoatPopup boat={boat} />
              </Popup>
            </Marker>
          );
        }

        return (
          <Marker
            key={group.key}
            position={[group.latitude, group.longitude]}
            icon={createClusterIcon(group.boats.length, hasIssues)}
          >
            <Popup>
              <MultiBoatPopup boats={group.boats} locationName={locationName} />
            </Popup>
          </Marker>
        );
      })}
    </>
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

  // Filter boats with valid coordinates
  const boatsWithCoords = useMemo(() => {
    return boats.filter(
      (boat): boat is BoatWithCoords =>
        boat.latitude !== undefined &&
        boat.longitude !== undefined &&
        Number.isFinite(boat.latitude) &&
        Number.isFinite(boat.longitude)
    );
  }, [boats]);

  const locationGroups = useMemo(() => groupBoatsByLocation(boatsWithCoords), [boatsWithCoords]);

  // Calculate center from boats or use default
  const center = useMemo(() => {
    if (boatsWithCoords.length > 0) {
      const avgLat = boatsWithCoords.reduce((sum, b) => sum + b.latitude, 0) / boatsWithCoords.length;
      const avgLng = boatsWithCoords.reduce((sum, b) => sum + b.longitude, 0) / boatsWithCoords.length;
      return [avgLat, avgLng] as [number, number];
    }
    return CENTER;
  }, [boatsWithCoords]);

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary tracking-tight">Fleet Map</h1>
            <p className="text-muted-foreground">
              View boat locations on the satellite map. {boatsWithCoords.length} of {boats.length} boats have coordinates.
            </p>
          </div>
          <Link href="/fleet">
            <Button variant="outline">
              <Ship className="h-4 w-4 mr-2" /> View Fleet List
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <Skeleton className="h-[600px] w-full rounded-lg" />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Map */}
            <div className="lg:col-span-3">
              <Card className="shadow-sm overflow-hidden">
                <CardContent className="p-0">
                  <div style={{ height: '600px', width: '100%' }}>
                    <MapContainer
                      center={center}
                      zoom={15}
                      style={{ height: '100%', width: '100%' }}
                      scrollWheelZoom={true}
                    >
                      <TileLayer
                        attribution='Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community'
                        url={ESRI_SATELLITE}
                        maxZoom={18}
                      />
                      <LocationMarkers locationGroups={locationGroups} />
                    </MapContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Legend */}
              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <MapPin className="h-4 w-4" /> Legend
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {Object.entries(statusColors).map(([status, color]) => (
                    <div key={status} className="flex items-center gap-2 text-sm">
                      <div
                        className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: color }}
                      />
                      <span>{status}</span>
                    </div>
                  ))}
                  <div className="pt-2 mt-2 border-t">
                    <p className="text-xs text-muted-foreground">
                      Numbers on markers indicate multiple boats at that location. Click to see all boats.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Locations List */}
              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Locations ({locationGroups.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 max-h-[400px] overflow-y-auto">
                  {locationGroups.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">
                      No boats have coordinates yet. Edit a boat to add its location.
                    </p>
                  ) : (
                    locationGroups.map((group) => (
                      <div key={group.key} className="p-2 rounded border border-slate-200">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{group.boats[0]?.location}</span>
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                            {group.boats.length} boat{group.boats.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {group.boats.slice(0, 5).map(boat => (
                            <Link key={boat.id} href={`/fleet/${boat.id}`}>
                              <span
                                className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 cursor-pointer transition-colors"
                              >
                                <span
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: statusColors[boat.status] }}
                                />
                                {boat.displayName}
                              </span>
                            </Link>
                          ))}
                          {group.boats.length > 5 && (
                            <span className="text-xs text-muted-foreground px-1.5 py-0.5">
                              +{group.boats.length - 5} more
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
