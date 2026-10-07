"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/src/core/api/axios";
import { HeroSection } from "@/src/features/home/components/hero";

interface PublicBannerImage {
  id: string;
  imageUrl: string;
  displayOrder: number;
  isPrimary: boolean;
  link: string | null;
}

interface PublicBanner {
  id: string;
  name: string;
  type: string;
  displayOrder: number;
  images: PublicBannerImage[];
}

interface ActiveBannersResponse {
  data: PublicBanner[];
}

const bannerFrameClass = "aspect-[1920/750] w-full";

function HomepageBannerSlider({ slides }: { slides: PublicBannerImage[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const multiple = slides.length > 1;

  useEffect(() => {
    if (!multiple || paused) {
      return;
    }

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [multiple, paused, slides.length]);

  const active = slides[index] ?? slides[0];

  if (!active) {
    return <HeroSection />;
  }

  const frameClass = `relative bg-slate-100 ${bannerFrameClass}`;
  const frames = slides.map((slide, slideIndex) => (
    <img
      key={slide.id}
      src={slide.imageUrl}
      alt=""
      className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-700 ${
        slideIndex === index ? "opacity-100" : "opacity-0"
      }`}
    />
  ));

  return (
    <section
      className="bg-white"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative mx-auto w-full max-w-[1920px] overflow-hidden">
        {active.link ? (
          <a href={active.link} className={`${frameClass} block cursor-pointer`}>
            {frames}
          </a>
        ) : (
          <div className={frameClass}>{frames}</div>
        )}

        {multiple ? (
          <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
            {slides.map((slide, slideIndex) => (
              <button
                key={slide.id}
                type="button"
                aria-label={`Show banner image ${slideIndex + 1}`}
                className={`h-2.5 w-2.5 rounded-full ${
                  slideIndex === index ? "bg-white" : "bg-white/50"
                }`}
                onClick={() => setIndex(slideIndex)}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function HomepageBanner() {
  const query = useQuery({
    queryKey: ["public-banners"],
    queryFn: async () => {
      const response = await apiClient.get<ActiveBannersResponse>("/banners/active");
      return response.data.data;
    },
    staleTime: 30_000,
  });

  const slides = useMemo(() => {
    const groups = [...(query.data ?? [])].sort(
      (left, right) => left.displayOrder - right.displayOrder,
    );

    return groups.flatMap((group) =>
      [...group.images].sort(
        (left, right) => left.displayOrder - right.displayOrder,
      ),
    );
  }, [query.data]);

  if (query.isLoading) {
    return (
      <div className={`animate-pulse bg-slate-100 ${bannerFrameClass}`} />
    );
  }

  if (query.isError || slides.length === 0) {
    return <HeroSection />;
  }

  return <HomepageBannerSlider slides={slides} />;
}
