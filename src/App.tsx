import { Route, Switch } from 'wouter';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { DemoAuthProvider } from '@/hooks/use-demo-auth';
import { TooltipProvider } from '@/components/ui/tooltip';
import { FeatureModalProvider } from '@/hooks/use-feature-modal';
import { FeatureModal } from '@/components/FeatureModal';

// Pages
import { LandingPage } from '@/pages/landing';
import { DashboardPage } from '@/pages/dashboard';
import { FleetPage } from '@/pages/fleet';
import { BoatDetailsPage } from '@/pages/boat-details';
import { FleetMapPage } from '@/pages/fleet-map';
import { RegattaPage } from '@/pages/regatta';
import { EquipmentPage } from '@/pages/equipment';
import { ReportDamagePage } from '@/pages/report-damage';
import { UserManagementPage } from '@/pages/user-management';
import { NotificationSettingsPage } from '@/pages/notification-settings';
import { SlipsPage } from '@/pages/slips';
import { SlipDetailPage } from '@/pages/slip-detail';
import { NotFoundPage } from '@/pages/not-found';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <DemoAuthProvider>
        <FeatureModalProvider>
          <TooltipProvider>
            <Switch>
              <Route path="/" component={LandingPage} />
              <Route path="/dashboard" component={DashboardPage} />
              <Route path="/fleet" component={FleetPage} />
              <Route path="/fleet/:id" component={BoatDetailsPage} />
              <Route path="/map" component={FleetMapPage} />
              <Route path="/regatta" component={RegattaPage} />
              <Route path="/equipment" component={EquipmentPage} />
              <Route path="/report" component={ReportDamagePage} />
              <Route path="/users" component={UserManagementPage} />
              <Route path="/notifications" component={NotificationSettingsPage} />
              <Route path="/slips" component={SlipsPage} />
              <Route path="/slips/:id" component={SlipDetailPage} />
              <Route component={NotFoundPage} />
            </Switch>
            <FeatureModal />
          </TooltipProvider>
        </FeatureModalProvider>
      </DemoAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
