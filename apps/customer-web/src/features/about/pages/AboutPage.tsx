"use client";

import { Container } from "@/src/shared/components/ui/container";
import { Section } from "@/src/shared/components/ui/section";
import { Heading } from "@/src/shared/components/ui/heading";
import { Card } from "@/src/shared/components/ui/card";
import { Button } from "@/src/shared/components/ui/button";

export function AboutPage() {
  return (
    <main className="bg-white">

      {/* HERO */}
      <Section className="pt-6 pb-12 md:pt-10 md:pb-16">
        <Container>

          <div className="grid md:grid-cols-2 gap-12 items-center">

            <div>
              <Heading
                title="About MCJ Institute"
                subtitle="Empowering students with practical accounting skills"
              />

              <p className="text-gray-600 mt-6 leading-relaxed text-[15px]">
                MCJ Institute is a leading training institute focused on delivering
                industry-relevant accounting and taxation education.
              </p>

              <p className="text-gray-600 mt-4 leading-relaxed text-[15px]">
                With expert trainers, live projects, and placement support,
                we ensure every student is job-ready from day one.
              </p>

              <div className="mt-8 flex gap-4">
                <Button>
                  Explore Courses
                </Button>
                <Button
                  variant="outline"
                  className="border-[#0f2044] text-[#0f2044]"
                >
                  Contact Us
                </Button>
              </div>
            </div>

            <div>
              <img
                src="https://images.unsplash.com/photo-1551836022-d5d88e9218df"
                alt="About"
                className="rounded-2xl shadow-xl w-full h-[400px] object-cover"
              />
            </div>

          </div>

        </Container>
      </Section>

      {/* STATS */}
      <Section className="py-16 bg-[#fdf8ef]">
        <Container>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">

            {[
              { value: "5000+", label: "Students Trained" },
              { value: "120+", label: "Courses" },
              { value: "15+", label: "Years Experience" },
              { value: "200+", label: "Hiring Partners" },
            ].map((item) => (
              <Card
                key={item.label}
                className="p-6 shadow-sm hover:shadow-md transition"
              >
                <h3 className="text-2xl font-bold text-[#0f2044]">
                  {item.value}
                </h3>
                <p className="text-sm text-gray-500 mt-1">{item.label}</p>
              </Card>
            ))}

          </div>

        </Container>
      </Section>

      {/* MISSION / VISION */}
      <Section className="py-20">
        <Container>

          <div className="text-center mb-14">
            <Heading
              title="Our Purpose"
              subtitle="Driven by quality education and career success"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-10">

            <Card className="p-8 shadow-sm hover:shadow-md transition">
              <h3 className="text-xl font-semibold text-[#0f2044] mb-3">
                Our Mission
              </h3>
              <p className="text-gray-600 leading-relaxed text-[15px]">
                To provide high-quality, practical accounting education that
                empowers students to build successful careers.
              </p>
            </Card>

            <Card className="p-8 shadow-sm hover:shadow-md transition">
              <h3 className="text-xl font-semibold text-[#0f2044] mb-3">
                Our Vision
              </h3>
              <p className="text-gray-600 leading-relaxed text-[15px]">
                To become a trusted leader in accounting education by producing
                industry-ready professionals.
              </p>
            </Card>

          </div>

        </Container>
      </Section>

    </main>
  );
}