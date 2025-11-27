import { Header } from "@/components/landing/header";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { ShowcaseScroll } from "@/components/landing/showcase-scroll";
import { FeaturesGrid } from "@/components/landing/features-grid";
import { Testimonials } from "@/components/landing/testimonials";
import { CommunityFeed } from "@/components/landing/community-feed";
import { PricingPreview } from "@/components/landing/pricing-preview";
import { CTASection } from "@/components/landing/cta-section";
import { Footer } from "@/components/landing/footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <Header />
      <main>
        <Hero />
        <HowItWorks />
        <ShowcaseScroll />
        <FeaturesGrid />
        <CommunityFeed />
        <Testimonials />
        <PricingPreview />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
