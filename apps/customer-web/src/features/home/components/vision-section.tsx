"use client";

import { Target, Lightbulb, ShieldCheck } from "lucide-react";

export function VisionSection() {
  return (
    <section className="w-full py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">

        <div className="grid md:grid-cols-2 gap-16 items-center">

          {/* LEFT CONTENT */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#0f2044] mb-6">
              Our <span className="text-[#b8922a]">Vision</span>
            </h2>

            <p className="text-gray-600 leading-relaxed text-base md:text-lg mb-6">
              In today’s rapidly evolving accounting and taxation landscape,
              especially in the post-GST era, the demand for skilled professionals
              who can confidently handle real-world financial challenges continues to grow.
            </p>

            <p className="text-gray-600 leading-relaxed text-base md:text-lg mb-6">
              At MCJ Institute, our vision is to bridge this gap by delivering
              industry-relevant, practical, and job-oriented training programs
              designed for both beginners and experienced learners.
            </p>

            <p className="text-gray-600 leading-relaxed text-base md:text-lg">
              We aim to empower every student with the confidence, technical
              expertise, and hands-on experience required to build a successful
              career in accounting and secure the right opportunities at the
              right time.
            </p>
          </div>

          {/* RIGHT CARDS */}
          <div className="grid gap-6">

            <div className="flex gap-4 p-6 bg-[#fdf8ef] border border-[#e8e0cf] rounded-xl hover:shadow-lg transition">
              <div className="w-12 h-12 flex items-center justify-center bg-[#f5edd8] rounded-lg">
                <Target className="text-[#b8922a]" size={22} />
              </div>
              <div>
                <h3 className="font-semibold text-[#0f2044] mb-1">
                  Job-Oriented Training
                </h3>
                <p className="text-sm text-gray-600">
                  Courses designed to match real industry expectations and job roles.
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-6 bg-[#fdf8ef] border border-[#e8e0cf] rounded-xl hover:shadow-lg transition">
              <div className="w-12 h-12 flex items-center justify-center bg-[#f5edd8] rounded-lg">
                <Lightbulb className="text-[#b8922a]" size={22} />
              </div>
              <div>
                <h3 className="font-semibold text-[#0f2044] mb-1">
                  Practical Learning
                </h3>
                <p className="text-sm text-gray-600">
                  Real-time case studies, simulations, and hands-on approach.
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-6 bg-[#fdf8ef] border border-[#e8e0cf] rounded-xl hover:shadow-lg transition">
              <div className="w-12 h-12 flex items-center justify-center bg-[#f5edd8] rounded-lg">
                <ShieldCheck className="text-[#b8922a]" size={22} />
              </div>
              <div>
                <h3 className="font-semibold text-[#0f2044] mb-1">
                  Career Confidence
                </h3>
                <p className="text-sm text-gray-600">
                  Build the confidence to independently handle accounting roles.
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}