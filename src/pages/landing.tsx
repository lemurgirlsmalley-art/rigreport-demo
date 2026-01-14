import { Link } from 'wouter';
import {
  ArrowRight,
  ExternalLink,
  Compass,
  Anchor,
} from 'lucide-react';
import heroImage from '@/assets/hero-sailing.png';

const MARKETING_SITE_URL = 'https://rig-report.com';

export function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section - with sailing background image */}
      <section className="relative overflow-hidden">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        {/* Gradient overlay - lighter to show more of the image */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/75 via-white/70 to-white/80" />

        <div className="relative mx-auto max-w-5xl px-6 py-20 sm:py-28 lg:py-32">
          {/* Logo and brand */}
          <div className="flex items-center justify-center gap-2 mb-10">
            <Anchor className="h-8 w-8 text-[hsl(var(--landing-navy))]" strokeWidth={2.5} />
            <span className="text-3xl font-bold tracking-tight text-[hsl(var(--landing-navy))]">RigReport</span>
          </div>

          {/* Main headline */}
          <h1 className="text-center text-[2rem] sm:text-4xl lg:text-[2.75rem] font-bold text-[hsl(var(--landing-navy))] leading-[1.15] mb-6 tracking-tight">
            See how RigReport helps sailing clubs
            <br className="hidden sm:block" />
            <span className="text-[hsl(var(--landing-teal))]">manage their fleet.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-center text-lg text-[hsl(var(--landing-navy)/0.85)] max-w-2xl mx-auto mb-12 leading-relaxed">
            Explore a fully interactive demo—browse the fleet catalog, view maintenance logs,
            check boat locations on the map, and see how it all works together.
          </p>

          {/* Demo CTA */}
          <div className="flex justify-center">
            <Link href="/dashboard">
              <button className="landing-cta-primary landing-glow group flex items-center gap-3 px-8 py-4 text-base">
                <Compass className="h-5 w-5 opacity-80" />
                <span>Explore the Interactive Demo</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* What's in the Demo Section */}
      <section className="landing-gradient-section-alt landing-texture landing-section relative py-20 sm:py-24">
        <div className="relative mx-auto max-w-3xl px-6">
          <div className="landing-label text-center mb-4">What's Inside</div>
          <h2 className="text-center text-2xl sm:text-3xl font-bold text-[hsl(var(--landing-navy))] mb-10">
            What you can explore in this demo
          </h2>

          <div className="space-y-4">
            {[
              'Browse a fleet of 75 boats across multiple sailing programs',
              'View detailed boat profiles with specs, status, and maintenance history',
              'Check the interactive map to see where boats are stored',
              'Switch between user roles to see how permissions work',
            ].map((feature, i) => (
              <div key={i} className="flex items-start gap-4 p-4 bg-white/60 rounded border border-[hsl(var(--landing-chart-line)/0.5)]">
                <span className="landing-tag shrink-0">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p className="text-[hsl(var(--landing-navy)/0.8)] leading-relaxed">{feature}</p>
              </div>
            ))}
          </div>

          <div className="landing-divider my-12" />

          <p className="text-center text-[hsl(var(--landing-navy))] font-medium text-lg">
            All boats and data shown are fictional—created for demonstration purposes.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[hsl(175_35%_35%)] py-10">
        <div className="mx-auto max-w-4xl px-6">
          <div className="flex flex-col items-center gap-6">
            <a
              href={MARKETING_SITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded border-2 border-white text-white font-medium hover:bg-white hover:text-[hsl(175_35%_35%)] transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              Return to RigReport.com
            </a>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full pt-6 border-t border-white/20">
              <div className="flex items-center gap-2">
                <Anchor className="h-6 w-6 text-white" strokeWidth={2.5} />
                <span className="font-semibold text-white">RigReport Demo</span>
              </div>
              <div className="flex items-center gap-6 text-sm text-white/80">
                <span>Sample data for demonstration</span>
                <div className="landing-coords">v1.0</div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

