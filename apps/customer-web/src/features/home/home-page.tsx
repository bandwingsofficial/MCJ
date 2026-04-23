import {
  HeroSection,
  WhySection,
  VisionSection,
  TestimonialsSection,
} from "./components";

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

    </main>
  );
}