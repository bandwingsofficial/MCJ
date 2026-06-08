"use client";

import { Star, User } from "lucide-react";

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
  return (
    <section id="testimonials" className="w-full py-10 bg-white relative overflow-hidden">
      {/* CSS Injection for Seamless Marquee Infinite Scrolling and Pause-on-Hover */}
      <style jsx global>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          animation: marquee 45s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* Visual Edge Fades - Softens the entry/exit points of the infinite slider */}
      <div className="absolute inset-y-0 left-0 w-16 md:w-32 bg-gradient-to-r from-white to-transparent pointer-events-none z-10" />
      <div className="absolute inset-y-0 right-0 w-16 md:w-32 bg-gradient-to-l from-white to-transparent pointer-events-none z-10" />

      <div className="w-full">
        {/* HEADER SECTION */}
        <div className="text-center max-w-[680px] mx-auto mb-16 px-6">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#0f2044] leading-tight">
            Student <span className="text-[#b8922a]">Success Stories</span>
          </h2>
          <p className="mt-4 text-[#5a6478] text-[15px] leading-[1.7] font-light">
            Hear from our students who transformed their careers with MCJ Institute's practical training and placement support.
          </p>
        </div>

        {/* INFINITE SCROLLING CONTAINER TRACK */}
        <div className="flex overflow-x-hidden w-full py-4 select-none">
          {/* Dual Render Loop Stream prevents whitespace gaps when data cycles */}
          <div className="flex gap-[28px] whitespace-nowrap animate-marquee px-4 w-max">
            {/* Array Pass 1 */}
            {testimonials.map((t, i) => (
              <TestimonialCard key={`loop1-${i}`} t={t} />
            ))}
            {/* Array Pass 2 (Duplicates for endless wrapping sequence logic) */}
            {testimonials.map((t, i) => (
              <TestimonialCard key={`loop2-${i}`} t={t} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// Extracted Simple Card UI Layer with SVG User Profile Icon Fallbacks
function TestimonialCard({ t }: { t: (typeof testimonials)[0] }) {
  return (
    <div className="inline-flex flex-col bg-[#fdf8ef] border border-[#e8e0cf] rounded-[16px] px-5 py-[22px] w-[310px] md:w-[350px] h-[310px] justify-between shadow-[0_4px_12px_rgba(15,32,68,0.02)] whitespace-normal transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:shadow-[0_16px_48px_rgba(15,32,68,0.08)] hover:-translate-y-1.5 hover:scale-[1.01] hover:border-[#d4a84b] group">
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