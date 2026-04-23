"use client";

import { useState } from "react";
import { Container } from "@/src/shared/components/ui/container";
import { Section } from "@/src/shared/components/ui/section";
import { Heading } from "@/src/shared/components/ui/heading";
import { Card } from "@/src/shared/components/ui/card";

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

export function FaqPage() {
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  const toggle = (key: string) => {
    setOpenIndex(openIndex === key ? null : key);
  };

  return (
    <main>

      {/* HERO */}
      <Section className="bg-white pt-20 pb-12">
        <Container>
          <Heading
            title="Frequently Asked Questions"
            subtitle="Find answers to common queries"
            align="center"
          />

          <p className="text-center text-gray-600 mt-4 max-w-2xl mx-auto">
            Have questions? We’ve answered the most common ones to help you get started quickly.
          </p>
        </Container>
      </Section>

      {/* FAQ LIST */}
      <Section className="bg-[#fdf8ef] py-16">
        <Container>

          <div className="max-w-4xl mx-auto space-y-10">

            {faqData.map((group, i) => (
              <div key={i}>

                {/* CATEGORY */}
                <h2 className="text-lg font-semibold text-[#0f2044] mb-4">
                  {group.category}
                </h2>

                {/* QUESTIONS */}
                <div className="space-y-4">

                  {group.items.map((item, j) => {
                    const key = `${i}-${j}`;
                    const isOpen = openIndex === key;

                    return (
                      <Card
                        key={key}
                        className="p-5 cursor-pointer"
                        onClick={() => toggle(key)}
                      >
                        <div className="flex justify-between items-center">

                          <h3 className="text-sm font-medium text-[#0f2044]">
                            {item.q}
                          </h3>

                          <span className="text-[#b8922a] text-lg">
                            {isOpen ? "-" : "+"}
                          </span>

                        </div>

                        {isOpen && (
                          <p className="text-sm text-gray-600 mt-3 leading-relaxed">
                            {item.a}
                          </p>
                        )}

                      </Card>
                    );
                  })}

                </div>

              </div>
            ))}

          </div>

        </Container>
      </Section>

      {/* CTA */}
      <Section className="bg-white py-16">
        <Container>

          <div className="text-center">
            <h2 className="text-2xl font-bold text-[#0f2044] mb-4">
              Still have questions?
            </h2>

            <p className="text-gray-600 mb-6">
              Contact our team and we’ll help you out.
            </p>

            <a
              href="/contact"
              className="inline-block bg-[#0f2044] text-white px-6 py-3 rounded-md hover:bg-[#1a3460] transition"
            >
              Contact Us
            </a>
          </div>

        </Container>
      </Section>

    </main>
  );
}