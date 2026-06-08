"use client";

import Image from "next/image";

const structuralFeatures = [
  {
    title: "Expert Mentors",
    description: "Learn directly from industry professionals with real accounting and taxation experience.",
    image: "/why/Image-Expert-Mentors.jpg",
  },
  {
    title: "Personalized Small-Batch Training",
    description: "We maintain limited seats per batch to ensure every student receives individual attention and personalized guidance.",
    image: "/why/Image-Limited Batch.jpg",
  },
  {
    title: "100% Placement Support",
    description: "Dedicated placement assistance with interview preparation and hiring partner connections.",
    image: "/why/Image-Internship.jpg",
  },
  {
    title: "Affordable & Valuable",
    description: "High-quality education at a cost-effective price with flexible learning options.",
    image: "/why/Image-affordable.jpg",
  },
  {
    title: "Internship with Real Exposure",
    description: "After 3 months of training, students receive a 3-month internship with real-time industry exposure, certification, and full-time conversion opportunities based on performance.",
    image: "/why/Internship.jpg",
  },
  {
    title: "Industry-Based Curriculum",
    description: "Our curriculum is professionally designed by experienced Chartered Accountants and industry experts to provide practical knowledge in accounting.",
    image: "/why/image-Curriculam.jpeg",
  },
  {
    title: "Placement Eligibility Process",
    description: "Students must clear written tests, live presentations, and mock interviews before placement, ensuring they are fully job-ready.",
    image: "/why/image-Eligibility.jpeg",
  },
  {
    title: "Weekly CA Expert Sessions",
    description: "Weekly career guidance sessions conducted by experienced CA professionals to help students understand industry expectations and career growth.",
    image: "/why/image-weeklyguidance.jpeg",
  },
];

export function WhySection() {
  return (
    <section id="why-choose" className="w-full py-10 bg-[#fdf8ef] relative overflow-hidden">
      {/* Background radial accent blurs for clean visual depth */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-b from-[#f5edd8] to-transparent opacity-40 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-t from-[#e8e0cf]/30 to-transparent opacity-40 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">

        {/* HEADER SECTION */}
        <div className="text-center max-w-[680px] mx-auto mb-16">
          <span className="text-xs font-semibold text-[#b8922a] tracking-widest uppercase mb-2.5 block">
            Why Choose Us
          </span>
          {/* Reduced font sizes matching premium visual boundaries (from 5xl down to 4xl desktop balance) */}
          <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold text-[#0f2044] leading-tight">
            Why Choose <span className="text-[#b8922a] relative inline-block">MCJ Institute</span>?
          </h2>
          <div className="w-[50px] h-[2.5px] bg-[#b8922a] mx-auto mt-3.5 rounded-full" />
          <p className="mt-4 text-[#5a6478] text-[14px] md:text-[15px] leading-[1.65] font-light">
            We don't just teach accounting — we build careers. Our programs are designed to make you
            job-ready with real-world skills, expert mentorship, and guaranteed placement support.
          </p>
        </div>

        {/* CARDS DISPLAY GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {structuralFeatures.map((feat, idx) => (
            <div
              key={idx}
              className="group flex flex-col bg-white border border-[#e8e0cf] rounded-2xl p-5 min-h-[365px] overflow-hidden shadow-[0_4px_12px_rgba(15,32,68,0.02)] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:shadow-[0_20px_40px_rgba(15,32,68,0.08)] hover:-translate-y-2 hover:border-[#d4a84b]"
            >
              {/* IMAGE WRAPPER ZONE */}
              <div className="w-full h-[140px] rounded-xl bg-[#f5edd8] overflow-hidden mb-5 flex-shrink-0 relative border border-[#e8e0cf]/30">
                <Image
                  src={feat.image}
                  alt={feat.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-108"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f2044]/5 to-transparent mix-blend-multiply opacity-60 transition-opacity duration-300 group-hover:opacity-20" />
              </div>

              {/* METADATA WRAPPER */}
              <div className="flex flex-col flex-grow">
                <h3 className="text-[16px] font-semibold text-[#0f2044] mb-2.5 leading-[1.4] transition-colors duration-300 group-hover:text-[#b8922a]">
                  {feat.title}
                </h3>
                <p className="text-[#5a6478] text-[13.5px] leading-[1.65] font-light flex-grow">
                  {feat.description}
                </p>
              </div>

              {/* Visual animated accent indicator line on card base */}
              <div className="w-0 h-[2px] bg-[#d4a84b] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-full mt-4 rounded-full" />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}