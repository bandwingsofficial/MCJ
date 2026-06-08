import {
  HeroSection,
  WhySection,
  VisionSection,
  TestimonialsSection,
} from "./components";

import { CTASection } from "./components/cta";
import { PlacementsSection } from "./components/PlacementsSection";

import { HomeCategoriesSection } from "@/src/features/categories/components/home-categories-section";

export function HomePage() {
  return (
    <main className="w-full m-0 p-0">

      {/* HERO */}
      <HeroSection />

      {/* CATEGORIES */}
      <HomeCategoriesSection />

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