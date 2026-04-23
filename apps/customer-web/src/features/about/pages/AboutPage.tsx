"use client";

import { Container } from "@/src/shared/components/ui/container";
import { Section } from "@/src/shared/components/ui/section";
import { Heading } from "@/src/shared/components/ui/heading";
import { Card } from "@/src/shared/components/ui/card";
import { Button } from "@/src/shared/components/ui/button";

export function AboutPage() {
  return (
    <main>

      {/* HERO */}
      <Section className="bg-white pt-20 pb-16">
        <Container>

          <div className="grid md:grid-cols-2 gap-12 items-center">

            {/* LEFT */}
            <div>
              <Heading
                title="About MCJ Institute"
                subtitle="Empowering students with practical accounting skills"
              />

              <p className="text-gray-600 mt-6 leading-relaxed">
                MCJ Institute is a leading training institute focused on delivering
                industry-relevant accounting and taxation education. Our programs
                are designed to bridge the gap between theoretical knowledge and
                real-world application.
              </p>

              <p className="text-gray-600 mt-4 leading-relaxed">
                With expert trainers, live projects, and placement support, we
                ensure every student is job-ready from day one.
              </p>

              <div className="mt-8 flex gap-4">
                <Button>Explore Courses</Button>
                <Button variant="outline">Contact Us</Button>
              </div>
            </div>

            {/* RIGHT IMAGE */}
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1551836022-d5d88e9218df"
                alt="About MCJ"
                className="rounded-2xl shadow-lg object-cover w-full h-[380px]"
              />
            </div>

          </div>

        </Container>
      </Section>

      {/* STATS */}
      <Section className="bg-[#fdf8ef] py-16">
        <Container>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">

            {[
              { value: "5000+", label: "Students Trained" },
              { value: "120+", label: "Courses" },
              { value: "15+", label: "Years Experience" },
              { value: "200+", label: "Hiring Partners" },
            ].map((item) => (
              <Card key={item.label} className="p-6">
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
      <Section className="bg-white py-20">
        <Container>

          <div className="grid md:grid-cols-2 gap-10">

            <Card className="p-8">
              <h3 className="text-xl font-semibold text-[#0f2044] mb-3">
                Our Mission
              </h3>
              <p className="text-gray-600 leading-relaxed">
                To provide high-quality, practical accounting education that
                empowers students to build successful careers.
              </p>
            </Card>

            <Card className="p-8">
              <h3 className="text-xl font-semibold text-[#0f2044] mb-3">
                Our Vision
              </h3>
              <p className="text-gray-600 leading-relaxed">
                To become a trusted leader in accounting education by producing
                industry-ready professionals.
              </p>
            </Card>

          </div>

        </Container>
      </Section>

      {/* CTA */}
      <Section className="bg-[#0f2044] py-16">
        <Container>

          <div className="text-center text-white">
            <h2 className="text-2xl font-bold mb-4">
              Start Your Career in Accounting Today
            </h2>
            <p className="text-sm text-gray-300 mb-6">
              Join thousands of students who transformed their careers with MCJ Institute
            </p>

            <Button className="bg-[#b8922a] hover:bg-[#a67c1f] text-white">
              Enroll Now
            </Button>
          </div>

        </Container>
      </Section>

    </main>
  );
}