"use client";

import { useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

const placementsData = [
  { id: 1, image: "/placed/placement-1.jpeg", alt: "MCJ Institute Placed Student 1" },
  { id: 2, image: "/placed/placement-2.jpeg", alt: "MCJ Institute Placed Student 2" },
  { id: 3, image: "/placed/placement-3.jpeg", alt: "MCJ Institute Placed Student 3" },
  { id: 4, image: "/placed/placement-4.jpeg", alt: "MCJ Institute Placed Student 4" },
  { id: 5, image: "/placed/placement-5.jpeg", alt: "MCJ Institute Placed Student 5" },
  { id: 6, image: "/placed/placement-6.jpeg", alt: "MCJ Institute Placed Student 6" },
  { id: 7, image: "/placed/placement-7.jpeg", alt: "MCJ Institute Placed Student 7" },
  { id: 8, image: "/placed/placement-8.jpeg", alt: "MCJ Institute Placed Student 8" },
  { id: 9, image: "/placed/placement-9.jpeg", alt: "MCJ Institute Placed Student 9" },
  { id: 10, image: "/placed/placement-10.jpeg", alt: "MCJ Institute Placed Student 10" },
  { id: 11, image: "/placed/placement-11.jpeg", alt: "MCJ Institute Placed Student 11" },
  { id: 12, image: "/placed/placement-12.jpeg", alt: "MCJ Institute Placed Student 12" },
  { id: 13, image: "/placed/placement-13.jpeg", alt: "MCJ Institute Placed Student 13" },
];

export function PlacementsSection() {
  const sliderRef = useRef<HTMLDivElement>(null);

  const scrollPlacements = (direction: number) => {
    if (sliderRef.current) {
      const scrollAmount = 380;
      sliderRef.current.scrollBy({
        left: direction * scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="py-10 bg-[#f8f7f2] overflow-hidden w-full">
      
      {/* HEADER */}
      <div className="text-center mb-12 px-6">
        <span className="inline-block text-[11px] font-semibold text-[#b8922a] uppercase tracking-[0.05em] mb-2">
          Placement Success
        </span>
        <h2 className="text-3xl md:text-4xl font-bold font-serif text-[#0f2344] mb-3 leading-tight">
          Our Students Placed in Top Companies
        </h2>
        <p className="text-[#6b7280] text-[15px]">
          Real students. Real placements. Real accounting careers.
        </p>
      </div>

      {/* SLIDER WRAPPER CONTAINER */}
      <div className="relative max-w-[1320px] mx-auto px-4 md:px-[60px] group">
        
        {/* LEFT SLIDER BUTTON */}
        <button
          onClick={() => scrollPlacements(-1)}
          className="absolute left-2 md:left-2 top-1/2 -translate-y-1/2 w-11 h-11 border-none rounded-full bg-[#0f2344] text-white cursor-pointer z-20 flex items-center justify-center transition-all duration-300 shadow-[0_4px_14px_rgba(0,0,0,0.15)] opacity-0 group-hover:opacity-100 focus:opacity-100 hover:bg-[#d4a84b] hover:scale-110 active:scale-95 hidden sm:flex"
          aria-label="Previous placed students"
        >
          <ChevronLeft size={20} />
        </button>

        {/* TIMELINE HORIZONTAL SCROLL TRACK */}
        <div
          ref={sliderRef}
          className="flex gap-[22px] overflow-x-auto scroll-smooth py-[10px] px-1 scrollbar-none"
          style={{ scrollbarWidth: "none" }}
        >
          {placementsData.map((student) => (
            <div
              key={student.id}
              className="group/card min-w-[250px] max-w-[250px] sm:min-w-[280px] sm:max-w-[280px] h-[260px] sm:h-[290px] overflow-hidden flex-shrink-0 rounded-xl bg-white shadow-[0_10px_24_rgba(0,0,0,0.06)] border border-[#e8e0cf]/40 transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-2 hover:scale-[1.02] hover:shadow-[0_20px_38px_rgba(0,0,0,0.15)]"
            >
              <div className="w-full h-full relative">
                <Image
                  src={student.image}
                  alt={student.alt}
                  fill
                  sizes="(max-width: 640px) 250px, 280px"
                  className="object-cover transition-transform duration-500 ease-out group-hover/card:scale-105"
                  priority={student.id <= 4}
                />
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT SLIDER BUTTON */}
        <button
          onClick={() => scrollPlacements(1)}
          className="absolute right-2 md:right-2 top-1/2 -translate-y-1/2 w-11 h-11 border-none rounded-full bg-[#0f2344] text-white cursor-pointer z-20 flex items-center justify-center transition-all duration-300 shadow-[0_4px_14px_rgba(0,0,0,0.15)] opacity-0 group-hover:opacity-100 focus:opacity-100 hover:bg-[#d4a84b] hover:scale-110 active:scale-95 hidden sm:flex"
          aria-label="Next placed students"
        >
          <ChevronRight size={20} />
        </button>

      </div>
    </section>
  );
}