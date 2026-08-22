"use client";

import { HomeCourses } from "@/src/features/courses/components/home-courses";
import {
  HeroSection,
  WhySection,
  VisionSection,
  TestimonialsSection,
} from "./components";

import { CTASection } from "./components/cta";
import { PlacementsSection } from "./components/PlacementsSection";

import { HomeCategoriesSection } from "@/src/features/categories/components/home-categories-section";
import { HomeBranchesSection } from "@/src/features/branches/components/home-branches-section";
import { useJobs } from "../jobs";
import { HomeJobs } from "../jobs/components/home-jobs";

export function HomePage() {
  const { jobs } = useJobs();

  return (
    <main className="m-0 w-full p-0">
      <HeroSection />

      <HomeCategoriesSection />

      <HomeCourses />

      <HomeBranchesSection />

      <PlacementsSection />

      <VisionSection />

      <WhySection />

      <HomeJobs jobs={jobs} />

      <TestimonialsSection />

      <CTASection />
    </main>
  );
}
