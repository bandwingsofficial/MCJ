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
import { useJobs } from "../jobs";
import { HomeJobs } from "../jobs/components/home-jobs";

export function HomePage() {
  const { data } = useCourses();
 const { jobs } = useJobs();
  
  return (
    <main className="w-full m-0 p-0">

      {/* HERO */}
      <HeroSection />

      {/* CATEGORIES */}
      <HomeCategoriesSection />

      {/* Courses */}
     <HomeCourses courses={data ?? []}/>

      {/* PLACEMENTS */}
      <PlacementsSection />

      {/* VISION */}
      <VisionSection />

      {/* WHY MCJ */}
      <WhySection />

      {/* Courses */}
     <HomeJobs jobs={jobs} />

      {/* TESTIMONIALS */}
      <TestimonialsSection />

      {/* CTA */}
      <CTASection />

    </main>
  );
}