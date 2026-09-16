"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Star, User } from "lucide-react";

const testimonials = [
  {
    name: "Sanjana Hiremath",
    role: "Senior Accountant",
    text: "Girish sir is very supportive, friendly and explains concepts clearly. I have taken the senior accountant course and gained excellent knowledge. MCJ Accounting Training Institute also helps in developing confidence within individuals. Best place for learning accounting.",
  },
  {
    name: "Jayashree Devru",
    role: "Accounts Executive",
    text: "I have completed the Practical Accounts Executive course at MCJ Accounting Training Institute and learned many things related to Accounts and Taxation practically. The faculty Girish Sir helps you understand everything easily. Very affordable fees and they provide job placement as well. Thanks to the team.",
  },
  {
    name: "Ajay AS",
    role: "Junior Accountant",
    text: "Sushma Ma'am is very supportive and always willing to help us with MCJ accounts. Even when we ask for extra time or need additional clarification, she patiently guides us without any hesitation. Her dedication and helpful nature make learning much easier for all of us. Truly grateful for her support.",
  },
  {
    name: "Malathi N",
    role: "Junior Accountant",
    text: "Girish sir is very supportive and explains concept in details. The faculty members are highly experience and qualified. experience was very good. Looking the best accounting training center 👉go to mcj accounts training center 👍",
  },
  {
    name: "Sunil BS",
    role: "Senior Accountant",
    text: "Mcj account training institute is an one of the best accounts training institute in Bangalore. They will give 100% job Placement after completion of Course. Thanks to MCJ Account Training institute.",
  },
  {
    name: "Megha H",
    role: "Account Executive",
    text: "MCJ Accounting Training Institution is one of the best places to learn practical accounting and taxation. The training is hands-on and industry-relevant, which helped me gain real-time knowledge and confidence. Whether you're a beginner or want to upgrade your skills, this is a great institute to join. Highly recommended👍📚.",
  },
];

export function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const visible = testimonials.slice(activeIndex, activeIndex + 3);
  const paddedVisible =
    visible.length >= 3
      ? visible
      : [...visible, ...testimonials].slice(0, 3);

  return (
    <section id="testimonials" className="relative w-full overflow-hidden bg-white py-12">
      <div className="w-full">
        {/* HEADER SECTION */}
        <div className="mb-8 flex items-end justify-between gap-4 px-6">
          <div className="text-center md:text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#2563EB]">
              Testimonials
            </p>
            <h2 className="font-serif text-3xl font-bold text-[#0B1F3A] md:text-4xl">
              Real Learners. <span className="text-[#2563EB]">Real Success.</span>
            </h2>
          </div>
          <div className="hidden gap-2 sm:flex">
            <button
              type="button"
              className="rounded-full border border-slate-200 p-2"
              onClick={() =>
                setActiveIndex(
                  (current) =>
                    (current - 1 + testimonials.length) % testimonials.length,
                )
              }
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="rounded-full border border-slate-200 p-2"
              onClick={() =>
                setActiveIndex((current) => (current + 1) % testimonials.length)
              }
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mx-auto grid max-w-7xl gap-5 px-6 md:grid-cols-3">
          {paddedVisible.map((t, i) => (
            <TestimonialCard key={`${t.name}-${i}`} t={t} />
          ))}
        </div>
      </div>
    </section>
  );
}

// Extracted Simple Card UI Layer with SVG User Profile Icon Fallbacks
function TestimonialCard({ t }: { t: (typeof testimonials)[0] }) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-slate-100 bg-[#F8FBFF] px-5 py-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="flex flex-col min-h-0">
        {/* RATING STARS BLOCK */}
        <div className="flex gap-1 mb-4 flex-shrink-0">
          {[...Array(5)].map((_, index) => (
            <Star
              key={index}
              size={15}
              className="fill-[#b8922a] text-[#b8922a]"
            />
          ))}
        </div>

        {/* TEXT CONTENT */}
        <div className="overflow-y-auto pr-1 flex-grow scrollbar-none">
          <p className="text-[#4a5264] text-[13.5px] leading-[1.65] italic font-light">
            “{t.text}”
          </p>
        </div>
      </div>

      {/* AUTHOR FOOTER METADATA ZONE */}
      <div className="flex items-center gap-3 mt-4 pt-3 border-t border-[#e8e0cf] flex-shrink-0">
        {/* PROFILE ICON CONTAINER */}
        <div className="w-11 h-11 rounded-full bg-[#f5edd8] border border-[#e8e0cf] flex items-center justify-center flex-shrink-0 text-[#b8922a] transition-transform duration-300 group-hover:scale-105">
          <User size={20} strokeWidth={2} />
        </div>

        <div className="min-w-0">
          <h4 className="font-semibold text-[#0f2044] text-[13.5px] truncate">
            {t.name}
          </h4>
          <p className="text-[11px] text-[#5a6478] mt-0.5 font-normal truncate">
            {t.role}
          </p>
        </div>
      </div>
    </div>
  );
}