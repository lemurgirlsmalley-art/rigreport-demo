import { Link } from 'wouter';
import {
  ArrowRight,
  ExternalLink,
  Compass,
} from 'lucide-react';
import logo from '@/assets/logo.png';
import heroImage from '@/assets/hero-sailing.png';

const MARKETING_SITE_URL = 'https://rigreport.com';

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
          <div className="flex items-center justify-center gap-3 mb-10">
            <div className="relative">
              <img src={logo} alt="RigReport" className="h-14 w-14 rounded-lg shadow-md" />
              <div className="absolute -inset-1 rounded-lg bg-gradient-to-br from-[hsl(var(--landing-teal)/0.2)] to-transparent -z-10" />
            </div>
            <div>
              <span className="text-2xl font-bold tracking-tight text-[hsl(var(--landing-navy))]">RigReport</span>
              <div className="landing-label mt-0.5">Fleet Management System</div>
            </div>
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

      {/* Credibility Section */}
      <section className="landing-gradient-navy landing-texture relative py-20 sm:py-24 overflow-hidden">
        {/* Subtle wave pattern */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='20' viewBox='0 0 100 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M21.184 20c.357-.13.72-.264 1.088-.402l1.768-.661C33.64 15.347 39.647 14 50 14c10.271 0 15.362 1.222 24.629 4.928.955.383 1.869.74 2.75 1.072h6.225c-2.51-.73-5.139-1.691-8.233-2.928C65.888 13.278 60.562 12 50 12c-10.626 0-16.855 1.397-26.66 5.063l-1.767.662c-2.475.923-4.66 1.674-6.724 2.275h6.335zm0-20C13.258 2.892 8.077 4 0 4V2c5.744 0 9.951-.574 14.85-2h6.334zM77.38 0C85.239 2.966 90.502 4 100 4V2c-6.842 0-11.386-.542-16.396-2h-6.225zM0 14c8.44 0 13.718-1.21 22.272-4.402l1.768-.661C33.64 5.347 39.647 4 50 4c10.271 0 15.362 1.222 24.629 4.928C84.112 12.722 89.438 14 100 14v-2c-10.271 0-15.362-1.222-24.629-4.928C65.888 3.278 60.562 2 50 2 39.374 2 33.145 3.397 23.34 7.063l-1.767.662C13.223 10.84 8.163 12 0 12v2z' fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          backgroundSize: '100px 20px'
        }} />

        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            In Production
          </h2>
          <p className="text-white/80 text-lg">
            Currently used by{' '}
            <span className="font-semibold text-white">Augusta Sailing Club</span>
          </p>
        </div>
      </section>

      {/* Implementation CTA */}
      <section className="landing-gradient-section-alt landing-texture landing-section relative py-20 sm:py-24">
        <div className="relative mx-auto max-w-2xl px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-[hsl(var(--landing-navy))] mb-4">
            Want RigReport for your club?
          </h2>
          <p className="text-[hsl(var(--landing-navy)/0.7)] mb-8 leading-relaxed">
            For more information on implementation, check out our main site.
          </p>

          <a
            href={MARKETING_SITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded border-2 border-[hsl(var(--landing-navy))] text-[hsl(var(--landing-navy))] font-medium hover:bg-[hsl(var(--landing-navy))] hover:text-white transition-colors"
          >
            Visit RigReport.com
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[hsl(175_35%_35%)] py-10">
        <div className="mx-auto max-w-4xl px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src={logo} alt="RigReport" className="h-8 w-8 rounded" />
              <span className="font-semibold text-white">RigReport Demo</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-white/80">
              <span>Sample data for demonstration</span>
              <div className="landing-coords">v1.0</div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

