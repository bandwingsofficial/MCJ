"use client";

import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Ravi Kumar",
    role: "Accounts Executive",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    text: "MCJ Institute completely changed my career. The practical training in Tally and GST helped me crack interviews easily.",
  },
  {
    name: "Sneha Patil",
    role: "GST Analyst",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
    text: "The faculty support and live classes are amazing. I got placed within 2 months of completing the course.",
  },
  {
    name: "Arjun Shetty",
    role: "Junior Accountant",
    image: "https://randomuser.me/api/portraits/men/65.jpg",
    text: "Best decision I made! The course content is very industry-focused and easy to understand.",
  },
];

export function TestimonialsSection() {
  return (
    <section className="w-full py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">

        {/* HEADER */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0f2044]">
            Student <span className="text-[#b8922a]">Success Stories</span>
          </h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Hear from our students who transformed their careers with MCJ Institute’s practical training and placement support.
          </p>
        </div>

        {/* GRID */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

          {testimonials.map((t, i) => (
            <div
              key={i}
              className="group bg-[#fdf8ef] border border-[#e8e0cf] rounded-2xl p-6 hover:shadow-2xl transition-all duration-300"
            >
              {/* STARS */}
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className="fill-[#b8922a] text-[#b8922a]" />
                ))}
              </div>

              {/* TEXT */}
              <p className="text-gray-700 text-sm leading-relaxed">
                “{t.text}”
              </p>

              {/* USER */}
              <div className="flex items-center gap-4 mt-6">
                <img
                  src={t.image}
                  alt={t.name}
                  className="w-12 h-12 rounded-full object-cover border"
                />
                <div>
                  <h4 className="font-semibold text-[#0f2044] text-sm">
                    {t.name}
                  </h4>
                  <p className="text-xs text-gray-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}

        </div>

      </div>
    </section>
  );
}