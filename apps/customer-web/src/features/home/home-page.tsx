"use client";

import { FeatureStripSection } from "./components/feature-strip";
import {
  HomeFinalCtaSection,
  HomeWhyMcjSection,
} from "./components/home-marketing-sections";
import { HomeAboutMcjSection } from "./components/home-about-mcj-section";
import { HomepageBanner } from "./components/homepage-banner";
import { TestimonialsSection } from "./components/testimonials";
import { HomeFaqSection } from "./components/home-faq-section";
import { HomeCourses } from "@/src/features/courses/components/home-courses";
import { HomeBranchesSection } from "@/src/features/branches/components/home-branches-section";
import { PracticalAccountingTraining } from "@/src/features/home/components/practical-accounting-training";
import { HomeLearningModesSection } from "./components/home-learning-modes";
import { HomePlacementAssistanceSection } from "@/src/features/home/components/home-placement-assistance";

import { HomeFreeDemoSection } from "@/src/features/home/components/home-free-demo-section";



export function HomePage() {
  return (
    <main className="m-0 w-full p-0">
      <HomepageBanner />
            <FeatureStripSection placement="below" />

      <HomeAboutMcjSection />
      <HomeCourses />
      <PracticalAccountingTraining />
      <HomeWhyMcjSection />
      <HomeLearningModesSection />
      <HomePlacementAssistanceSection />
      <HomeBranchesSection />
      <HomeFreeDemoSection />
      <HomeFaqSection />
      <TestimonialsSection />
      <HomeFinalCtaSection />
    </main>
  );
}
