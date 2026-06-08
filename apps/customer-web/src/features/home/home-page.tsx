import {
  HeroSection,
  WhySection,
  VisionSection,
  TestimonialsSection,
} from "./components";
import { CTASection } from "./components/cta";
import { PlacementsSection } from "./components/PlacementsSection";

export function HomePage() {
  return (
  <main className="w-full m-0 p-0">

      {/* HERO */}
      <HeroSection />

      {/* PLACEMENTS */}
      <PlacementsSection />

      {/* VISION */}
      <VisionSection />

      {/* WHY MCJ */}
      <WhySection />

      {/* TESTIMONIALS */}
      <TestimonialsSection />

      {/* CTA */}
      <CTASection />

    </main>
  );
}