"use client";

import { Award, Users, Briefcase, IndianRupee } from "lucide-react";

export function WhySection() {
  return (
    <section className="w-full py-20 bg-[#fdf8ef]">
      <div className="max-w-7xl mx-auto px-6">

        {/* HEADER */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0f2044]">
            Why Choose <span className="text-[#b8922a]">MCJ Institute</span>?
          </h2>
          <p className="mt-4 text-gray-600 text-base leading-relaxed">
            We don’t just teach accounting — we build careers. Our programs are
            designed to make you job-ready with real-world skills, expert mentorship,
            and guaranteed placement support.
          </p>
        </div>

        {/* CARDS */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">

          {/* CARD 1 */}
          <div className="group p-6 bg-white border border-[#e8e0cf] rounded-xl hover:shadow-xl transition-all duration-300">
            <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-[#f5edd8] mb-4">
              <Users className="text-[#b8922a]" size={22} />
            </div>
            <h3 className="font-semibold text-lg text-[#0f2044] mb-2">
              Expert Mentors
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Learn directly from industry professionals with real accounting and taxation experience.
            </p>
          </div>

          {/* CARD 2 */}
          <div className="group p-6 bg-white border border-[#e8e0cf] rounded-xl hover:shadow-xl transition-all duration-300">
            <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-[#f5edd8] mb-4">
              <Award className="text-[#b8922a]" size={22} />
            </div>
            <h3 className="font-semibold text-lg text-[#0f2044] mb-2">
              Industry-Focused Curriculum
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Practical training in Tally, GST, and financial accounting aligned with real job requirements.
            </p>
          </div>

          {/* CARD 3 */}
          <div className="group p-6 bg-white border border-[#e8e0cf] rounded-xl hover:shadow-xl transition-all duration-300">
            <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-[#f5edd8] mb-4">
              <Briefcase className="text-[#b8922a]" size={22} />
            </div>
            <h3 className="font-semibold text-lg text-[#0f2044] mb-2">
              100% Placement Support
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Dedicated placement assistance with interview preparation and hiring partner connections.
            </p>
          </div>

          {/* CARD 4 */}
          <div className="group p-6 bg-white border border-[#e8e0cf] rounded-xl hover:shadow-xl transition-all duration-300">
            <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-[#f5edd8] mb-4">
              <IndianRupee className="text-[#b8922a]" size={22} />
            </div>
            <h3 className="font-semibold text-lg text-[#0f2044] mb-2">
              Affordable & Valuable
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              High-quality education at a cost-effective price with flexible learning options.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
}