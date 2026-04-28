import {
  HeroSection,
  WhySection,
  VisionSection,
  TestimonialsSection,
} from "./components";
import { CTASection } from "./components/cta";

export function HomePage() {
  return (
  <main className="w-full m-0 p-0">

      {/* HERO */}
      <HeroSection />

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