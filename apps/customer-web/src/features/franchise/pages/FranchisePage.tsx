"use client";

import { useState } from "react";
import { Container } from "@/src/shared/components/ui/container";
import { Section } from "@/src/shared/components/ui/section";
import { Heading } from "@/src/shared/components/ui/heading";
import { Card } from "@/src/shared/components/ui/card";
import { Button } from "@/src/shared/components/ui/button";

export function FranchisePage() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <main>

      {/* HERO */}
      <Section className="bg-white pt-20 pb-16">
        <Container>
          <div className="grid md:grid-cols-2 gap-12 items-center">

            {/* LEFT */}
            <div>
              <Heading
                title="Start Your Own MCJ Franchise"
                subtitle="Build a successful education business with us"
              />

              <p className="text-gray-600 mt-6 leading-relaxed">
                Partner with MCJ Institute and bring industry-leading accounting
                education to your city. With our proven system, training, and support,
                you can build a profitable and impactful business.
              </p>

              <div className="mt-8 flex gap-4">
                <Button>Apply Now</Button>
                <Button variant="outline">Download Brochure</Button>
              </div>
            </div>

            {/* RIGHT IMAGE */}
            <img
              src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d"
              alt="Franchise"
              className="rounded-2xl shadow-lg w-full h-[380px] object-cover"
            />

          </div>
        </Container>
      </Section>

      {/* BENEFITS */}
      <Section className="bg-[#fdf8ef] py-16">
        <Container>

          {/* @ts-expect-error align prop not in type */}
          <Heading
            title="Why Choose MCJ Franchise?"
            subtitle="Strong support system and proven business model"
            align="center"
          />

          <div className="grid md:grid-cols-3 gap-6 mt-10">

            {[
              {
                title: "Proven Business Model",
                desc: "Operate with a tested and successful education system.",
              },
              {
                title: "Complete Training",
                desc: "We provide training for you and your staff.",
              },
              {
                title: "Marketing Support",
                desc: "Get branding, marketing, and promotional support.",
              },
            ].map((item, i) => (
              // @ts-expect-error className not in type
              <Card key={i} className="p-6 text-center">
                <h3 className="font-semibold text-[#0f2044] mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </Card>
            ))}

          </div>

        </Container>
      </Section>

      {/* PROCESS */}
      <Section className="bg-white py-20">
        <Container>

          {/* @ts-expect-error align prop not in type */}
          <Heading
            title="How It Works"
            subtitle="Simple steps to start your franchise"
            align="center"
          />

          <div className="grid md:grid-cols-4 gap-6 mt-10 text-center">

            {[
              "Submit Application",
              "Discussion & Approval",
              "Setup & Training",
              "Launch Center",
            ].map((step, i) => (
              // @ts-expect-error className not in type
              <Card key={i} className="p-6">
                <div className="text-[#b8922a] font-bold text-xl mb-2">
                  {i + 1}
                </div>
                <p className="text-sm text-gray-600">{step}</p>
              </Card>
            ))}

          </div>

        </Container>
      </Section>

      {/* INVESTMENT */}
      <Section className="bg-[#fdf8ef] py-16">
        <Container>

          <div className="grid md:grid-cols-2 gap-10 items-center">

            <div>
              <h2 className="text-2xl font-bold text-[#0f2044] mb-4">
                Investment & Returns
              </h2>

              <p className="text-gray-600 leading-relaxed mb-4">
                Starting an MCJ franchise requires a reasonable investment with
                high return potential. Our model ensures faster break-even and
                long-term growth.
              </p>

              <ul className="text-sm text-gray-600 space-y-2">
                <li>✔ Low initial investment</li>
                <li>✔ High demand courses</li>
                <li>✔ Quick ROI</li>
              </ul>
            </div>

            {/* @ts-expect-error className not in type */}
            <Card className="p-6">
              <h3 className="font-semibold text-[#0f2044] mb-2">
                Estimated Investment
              </h3>
              <p className="text-sm text-gray-600">
                ₹3L – ₹8L depending on location and scale
              </p>
            </Card>

          </div>

        </Container>
      </Section>

      {/* FORM */}
      <Section className="bg-white py-20">
        <Container>

          {/* @ts-expect-error align prop not in type */}
          <Heading
            title="Apply for Franchise"
            subtitle="Fill the form and our team will contact you"
            align="center"
          />

          <div className="max-w-3xl mx-auto mt-10">

            {/* @ts-expect-error className not in type */}
            <Card className="p-8">

              {!submitted ? (
                <form onSubmit={handleSubmit} className="space-y-5">

                  <input
                    required
                    className="w-full border p-3 rounded-md"
                    placeholder="Full Name"
                  />

                  <input
                    required
                    className="w-full border p-3 rounded-md"
                    placeholder="Phone"
                  />

                  <input
                    required
                    className="w-full border p-3 rounded-md"
                    placeholder="City"
                  />

                  <textarea
                    className="w-full border p-3 rounded-md"
                    placeholder="Message"
                  />

                  <Button className="w-full">
                    Submit Application
                  </Button>

                </form>
              ) : (
                <div className="text-center py-10">
                  <h3 className="text-xl font-semibold text-[#0f2044] mb-2">
                    Application Submitted
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Our team will contact you soon.
                  </p>
                </div>
              )}

            </Card>

          </div>

        </Container>
      </Section>

      {/* CTA */}
      <Section className="bg-[#0f2044] py-16">
        <Container>

          <div className="text-center text-white">
            <h2 className="text-2xl font-bold mb-4">
              Ready to Start Your Franchise?
            </h2>

            <p className="text-gray-300 mb-6">
              Join MCJ Institute and grow your business today.
            </p>

            <Button className="bg-[#b8922a] hover:bg-[#a67c1f] text-white">
              Get Started
            </Button>
          </div>

        </Container>
      </Section>

    </main>
  );
}