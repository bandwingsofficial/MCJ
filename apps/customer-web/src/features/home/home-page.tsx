"use client";

import { FeatureStripSection } from "./components/feature-strip";
import {
  HomeFinalCtaSection,
  HomeStatsSection,
  HomeWhyMcjSection,
} from "./components/home-marketing-sections";
import { HeroSection } from "./components/hero";
import { TestimonialsSection } from "./components/testimonials";

import { HomeCourses } from "@/src/features/courses/components/home-courses";
import { HomeBranchesSection } from "@/src/features/branches/components/home-branches-section";

export function HomePage() {
  return (
    <main className="m-0 w-full p-0">
      <HeroSection />
      <FeatureStripSection />
      <HomeCourses />
      <HomeBranchesSection />
      <HomeWhyMcjSection />
      <HomeStatsSection />
      <TestimonialsSection />
      <HomeFinalCtaSection />
    </main>
  );
}
