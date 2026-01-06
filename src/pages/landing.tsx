import { Link } from 'wouter';
import { Ship, Map, AlertTriangle, BarChart3, Anchor, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const features = [
  {
    icon: Ship,
    title: 'Fleet Management',
    description: 'Track all your boats in one place with status updates, maintenance history, and detailed vessel information.',
  },
  {
    icon: Map,
    title: 'Interactive Maps',
    description: 'Visualize your fleet on satellite maps. See boat locations, identify clusters, and plan logistics.',
  },
  {
    icon: AlertTriangle,
    title: 'Damage Reporting',
    description: 'Quick and easy damage reporting with severity levels, photo uploads, and automatic status updates.',
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description: 'Get insights into fleet health, maintenance trends, and equipment utilization at a glance.',
  },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-primary">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/80" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="flex items-center gap-3">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
                  <Anchor className="h-10 w-10 text-white" />
                </div>
                <span className="text-4xl font-bold text-white">RigReport</span>
              </div>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
              Fleet Management
              <br />
              <span className="text-secondary">Made Simple</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-white/80">
              The complete solution for sailing clubs and yacht organizations to manage their fleet,
              track maintenance, and coordinate regattas.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link href="/dashboard">
                <Button size="lg" variant="secondary" className="gap-2 text-lg">
                  Explore Demo
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="gap-2 text-lg border-white/30 text-white hover:bg-white/10">
                Learn More
              </Button>
            </div>
          </div>
        </div>

        {/* Wave decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V120Z"
              fill="currentColor"
              className="text-background"
            />
          </svg>
        </div>
      </div>

      {/* Features Section */}
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need to manage your fleet
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Powerful tools designed specifically for sailing organizations
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <Card key={feature.title} className="border-2 hover:border-primary/20 transition-colors">
              <CardContent className="pt-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-muted">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">
              Ready to streamline your fleet management?
            </h2>
            <p className="mt-4 text-muted-foreground">
              Try the demo to see RigReport in action with sample data.
            </p>
            <Link href="/dashboard">
              <Button size="lg" className="mt-8 gap-2">
                Start Exploring
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Anchor className="h-6 w-6 text-primary" />
              <span className="font-semibold text-primary">RigReport</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Demo application. All data is stored locally.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
