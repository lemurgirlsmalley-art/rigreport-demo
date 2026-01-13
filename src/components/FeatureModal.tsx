import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Edit,
  Trash2,
  PlusCircle,
  RefreshCw,
  Download,
  Bell,
  User,
  Settings,
  Search,
  Filter,
  CheckCircle,
  Info,
} from 'lucide-react';
import { useFeatureModal } from '@/hooks/use-feature-modal';

const iconMap = {
  edit: Edit,
  delete: Trash2,
  add: PlusCircle,
  sync: RefreshCw,
  export: Download,
  notification: Bell,
  user: User,
  settings: Settings,
  search: Search,
  filter: Filter,
};

export function FeatureModal() {
  const { currentFeature, isOpen, hideFeatureModal } = useFeatureModal();

  if (!currentFeature) return null;

  const IconComponent = currentFeature.icon ? iconMap[currentFeature.icon] : Info;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && hideFeatureModal()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/10">
              <IconComponent className="h-5 w-5 text-secondary" />
            </div>
            <DialogTitle className="text-xl">{currentFeature.title}</DialogTitle>
          </div>
          <DialogDescription className="text-base">
            {currentFeature.description}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <h4 className="text-sm font-semibold text-foreground mb-3">
            In production RigReport, you can:
          </h4>
          <ul className="space-y-2">
            {currentFeature.productionFeatures.map((feature, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-secondary mt-0.5 flex-shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 pt-4 border-t">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              This is a demo preview
            </p>
            <Button onClick={hideFeatureModal}>
              Got it
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
