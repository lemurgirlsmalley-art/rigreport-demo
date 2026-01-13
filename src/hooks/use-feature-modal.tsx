import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { featureDescriptions, type FeatureDescription } from '@/lib/featureDescriptions';

interface FeatureModalContextType {
  showFeatureModal: (featureKey: string) => void;
  hideFeatureModal: () => void;
  currentFeature: FeatureDescription | null;
  isOpen: boolean;
}

const FeatureModalContext = createContext<FeatureModalContextType | undefined>(undefined);

export function FeatureModalProvider({ children }: { children: ReactNode }) {
  const [currentFeature, setCurrentFeature] = useState<FeatureDescription | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const showFeatureModal = useCallback((featureKey: string) => {
    const feature = featureDescriptions[featureKey];
    if (feature) {
      setCurrentFeature(feature);
      setIsOpen(true);
    } else {
      console.warn(`Feature description not found for key: ${featureKey}`);
    }
  }, []);

  const hideFeatureModal = useCallback(() => {
    setIsOpen(false);
    // Delay clearing the feature to allow animation
    setTimeout(() => setCurrentFeature(null), 200);
  }, []);

  return (
    <FeatureModalContext.Provider
      value={{ showFeatureModal, hideFeatureModal, currentFeature, isOpen }}
    >
      {children}
    </FeatureModalContext.Provider>
  );
}

export function useFeatureModal() {
  const context = useContext(FeatureModalContext);
  if (context === undefined) {
    throw new Error('useFeatureModal must be used within a FeatureModalProvider');
  }
  return context;
}
