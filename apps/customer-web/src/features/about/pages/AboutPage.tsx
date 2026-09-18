"use client";

import { FeatureStripSection } from "@/src/features/home/components/feature-strip";
import { HomeStatsSection } from "@/src/features/home/components/home-marketing-sections";
import { HomeCourses } from "@/src/features/courses/components/home-courses";
import { HomeBranchesSection } from "@/src/features/branches/components/home-branches-section";

import { AboutApproachSection } from "@/src/features/about/components/about-approach-section";
import { AboutCareerSection } from "@/src/features/about/components/about-career-section";
import { AboutFinalCtaSection } from "@/src/features/about/components/about-final-cta-section";
import { AboutHeroSection } from "@/src/features/about/components/about-hero-section";
import { AboutWhoWeAreSection } from "@/src/features/about/components/about-who-we-are-section";
import { AboutWhySection } from "@/src/features/about/components/about-why-section";

export function AboutPage() {
  return (
    <main className="m-0 w-full p-0">
      <AboutHeroSection />
      <FeatureStripSection />
      <AboutWhoWeAreSection />
      <AboutApproachSection />
      <AboutWhySection />
      <HomeCourses />
      <HomeBranchesSection />
      <AboutCareerSection />
      <HomeStatsSection />
      <AboutFinalCtaSection />
    </main>
  );
}
