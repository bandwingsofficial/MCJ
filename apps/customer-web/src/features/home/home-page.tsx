"use client";

import { useCourses } from "../courses";
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
  const { data: featuredCourses = [] } = useCourses({ isFeatured: true });
  const { data: allCourses = [] } = useCourses();
  const { jobs } = useJobs();

  const coursesToShow =
    featuredCourses.length > 0
      ? featuredCourses.slice(0, 6)
      : allCourses.slice(0, 6);

  return (
    <main className="m-0 w-full p-0">
      <HeroSection />

      <HomeCategoriesSection />

      <HomeCourses courses={coursesToShow} />

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
