import { useMemo } from 'react';
import { Link } from 'wouter';
import { Anchor, MapPin, Calendar, Ship } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useBoats } from '@/hooks/use-boats';
import { formatDate } from '@/lib/utils';
import type { Boat } from '@/lib/types';

function RegattaBoatCard({ boat }: { boat: Boat }) {
  // Map boat types to display labels
  const getBoatTypeLabel = (type: string): string => {
    const typeMap: Record<string, string> = {
      '420': '420',
      'Club 420': '420',
      'RIB': 'RIB',
      'Zodiac': 'RIB',
      'Coach Boat': 'RIB',
      'Safety Boat': 'RIB',
    };
    return typeMap[type] || type;
  };

  return (
    <Card className="overflow-hidden shadow-md hover:shadow-xl transition-all border-t-4 border-t-accent flex flex-col h-full">
      {boat.imageUrl && (
        <div className="h-48 w-full overflow-hidden bg-muted">
          <img src={boat.imageUrl} alt={boat.displayName} className="w-full h-full object-cover" />
        </div>
      )}
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <Badge variant="outline" className="mb-2 text-xs font-normal">{getBoatTypeLabel(boat.type)}</Badge>
            <CardTitle className="text-xl">{boat.displayName}</CardTitle>
            {boat.hullNumber && <p className="text-sm text-muted-foreground">#{boat.hullNumber}</p>}
          </div>
          <Badge className="bg-accent text-accent-foreground hover:bg-accent/90">Ready</Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-4 flex-1">
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{boat.location}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Last check: {boat.lastInspection ? formatDate(boat.lastInspection, 'MMM d, yyyy') : 'N/A'}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-muted/30 p-3 mt-auto">
        <Link href={`/fleet/${boat.id}`} className="w-full">
          <Button variant="ghost" className="w-full justify-between" size="sm">
            View Details
            <span className="text-lg leading-none">→</span>
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

export function RegattaPage() {
  const { boats, isLoading } = useBoats();

  // Filter for Regatta Ready boats: All boats with OK status
  const regattaBoats = useMemo(() => {
    return boats.filter((boat) => boat.status === 'OK');
  }, [boats]);

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        {/* Page Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center">
              <Anchor className="h-6 w-6 text-accent-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-primary tracking-tight">Regatta View</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl">
            The race-ready fleet. These vessels are currently in <strong className="text-secondary">OK</strong> condition and ready for competition usage.
          </p>
        </div>

        {/* Boat Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regattaBoats.map((boat) => (
              <RegattaBoatCard key={boat.id} boat={boat} />
            ))}
            {regattaBoats.length === 0 && (
              <div className="col-span-full text-center py-16 bg-muted/30 rounded-xl border border-dashed">
                <Ship className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No boats are currently in OK condition.</p>
                <Link href="/fleet">
                  <Button variant="link">Check Fleet Status</Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
