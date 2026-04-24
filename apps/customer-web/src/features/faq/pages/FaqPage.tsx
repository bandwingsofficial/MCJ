"use client";

import { useState } from "react";

const faqData = [
  {
    category: "Courses",
    items: [
      {
        q: "What courses does MCJ Institute offer?",
        a: "We offer courses in Tally, GST, Financial Accounting, and taxation with practical training.",
      },
      {
        q: "Are the courses beginner-friendly?",
        a: "Yes, our courses are designed for beginners as well as experienced learners.",
      },
    ],
  },
  {
    category: "Placements",
    items: [
      {
        q: "Do you provide placement support?",
        a: "Yes, we provide 100% placement assistance with interview preparation.",
      },
      {
        q: "How long does it take to get placed?",
        a: "Most students get placed within 1–3 months after course completion.",
      },
    ],
  },
  {
    category: "Fees & Payments",
    items: [
      {
        q: "What is the course fee?",
        a: "Fees vary depending on the course. Contact us for detailed pricing.",
      },
      {
        q: "Do you offer installment options?",
        a: "Yes, flexible payment options are available.",
      },
    ],
  },
];

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  const toggle = (key: string) => {
    setOpenIndex(openIndex === key ? null : key);
  };

  return (
    <main className="min-h-screen bg-white">

      {/* HEADER */}
      <section className="pt-10 pb-12 border-b bg-white">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-[#0f2044]">
            Frequently Asked Questions
          </h1>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
            Find answers to the most common questions about our courses, placements, and payments.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-[#fdf8ef]">
        <div className="max-w-4xl mx-auto px-4 space-y-10">

          {faqData.map((group, i) => (
            <div key={i}>

              {/* CATEGORY */}
              <h2 className="text-lg font-semibold text-[#0f2044] mb-4">
                {group.category}
              </h2>

              <div className="space-y-4">

                {group.items.map((item, j) => {
                  const key = `${i}-${j}`;
                  const isOpen = openIndex === key;

                  return (
                    <div
                      key={key}
                      className="bg-white border border-[#e8e0cf] rounded-xl p-5 cursor-pointer transition hover:shadow-sm"
                      onClick={() => toggle(key)}
                    >
                      {/* QUESTION */}
                      <div className="flex justify-between items-center">
                        <h3 className="text-sm md:text-base font-medium text-[#0f2044]">
                          {item.q}
                        </h3>
                        <span className="text-[#b8922a] text-xl font-bold">
                          {isOpen ? "−" : "+"}
                        </span>
                      </div>

                      {/* ANSWER (BELOW) */}
                      <div
                        className={`overflow-hidden transition-all duration-300 ${
                          isOpen ? "max-h-40 mt-3" : "max-h-0"
                        }`}
                      >
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {item.a}
                        </p>
                      </div>
                    </div>
                  );
                })}

              </div>

            </div>
          ))}

        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-white border-t">
        <div className="max-w-4xl mx-auto px-4 text-center">

          <h2 className="text-2xl font-bold text-[#0f2044] mb-4">
            Still have questions?
          </h2>

          <p className="text-gray-600 mb-6">
            Our team is ready to help you. Reach out anytime.
          </p>

          <a
            href="/contact"
            className="inline-block bg-[#0f2044] text-white px-6 py-3 rounded-md hover:bg-[#1a3460] transition"
          >
            Contact Us
          </a>

        </div>
      </section>

    </main>
  );
}