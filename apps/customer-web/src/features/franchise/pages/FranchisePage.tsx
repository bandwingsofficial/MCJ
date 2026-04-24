"use client";

import { Container } from "@/src/shared/components/ui/container";
import { Section } from "@/src/shared/components/ui/section";
import { Heading } from "@/src/shared/components/ui/heading";
import { Card } from "@/src/shared/components/ui/card";
import { Button } from "@/src/shared/components/ui/button";

export function FranchisePage() {
  return (
    <main className="bg-white">

      {/* HERO */}
      <Section>
        <div className="bg-gradient-to-br from-white via-gray-50 to-gray-100 pt-0 pb-0">
          <Container>
            <div className="grid md:grid-cols-2 gap-16 items-center">

              <div>
                <Heading
                  title="Start Your Own MCJ Franchise"
                  subtitle="Build a successful education business with us"
                />

                <p className="text-gray-600 mt-6 leading-relaxed max-w-lg">
                  Partner with MCJ Institute and bring industry-leading accounting
                  education to your city. With our proven system, training, and support,
                  you can build a profitable and impactful business.
                </p>

                <div className="mt-8 flex gap-4">
                  <Button className="px-6 py-3 shadow-md">Apply Now</Button>
                  <Button variant="outline" className="px-6 py-3">
                    Download Brochure
                  </Button>
                </div>
              </div>

              <img
                src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d"
                alt="Franchise"
                className="rounded-3xl shadow-2xl w-full h-[400px] object-cover"
              />

            </div>
          </Container>
        </div>
      </Section>

      {/* BENEFITS */}
      <Section>
        <div className="bg-[#fdf8ef] py-20">
          <Container>

            <div className="text-center">
              <Heading
                title="Why Choose MCJ Franchise?"
                subtitle="Strong support system and proven business model"
              />
            </div>

            <div className="grid md:grid-cols-3 gap-8 mt-14">
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
                <div
                  key={i}
                  className="p-8 text-center rounded-2xl bg-white shadow-md hover:shadow-xl transition"
                >
                  <Card>
                    <h3 className="font-semibold text-[#0f2044] text-lg mb-3">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-600">{item.desc}</p>
                  </Card>
                </div>
              ))}
            </div>

          </Container>
        </div>
      </Section>

      {/* PROCESS */}
      <Section>
        <div className="bg-white py-0">
          <Container>

            <div className="text-center">
              <Heading
                title="How It Works"
                subtitle="Simple steps to start your franchise"
              />
            </div>

            <div className="grid md:grid-cols-4 gap-8 mt-14 text-center">
              {[
                "Submit Application",
                "Discussion & Approval",
                "Setup & Training",
                "Launch Center",
              ].map((step, i) => (
                <div
                  key={i}
                  className="p-8 rounded-2xl bg-white shadow-md hover:shadow-xl transition"
                >
                  <Card>
                    <div className="text-[#b8922a] font-bold text-xl mb-2">
                      {i + 1}
                    </div>
                    <p className="text-sm text-gray-600">{step}</p>
                  </Card>
                </div>
              ))}
            </div>

          </Container>
        </div>
      </Section>

      {/* INVESTMENT */}
      <Section>
        <div className="bg-[#fdf8ef] py-20">
          <Container>

            <div className="grid md:grid-cols-2 gap-14 items-center">

              <div>
                <h2 className="text-3xl font-bold text-[#0f2044] mb-6">
                  Investment & Returns
                </h2>

                <p className="text-gray-600 mb-6">
                  Starting an MCJ franchise requires a reasonable investment with
                  high return potential.
                </p>

                <ul className="text-sm text-gray-700 space-y-2">
                  <li>✔ Low initial investment</li>
                  <li>✔ High demand courses</li>
                  <li>✔ Quick ROI</li>
                </ul>
              </div>

              <div className="p-8 rounded-2xl bg-white shadow-xl">
                <Card>
                  <h3 className="font-semibold text-[#0f2044] text-lg mb-2">
                    Estimated Investment
                  </h3>
                  <p className="text-sm text-gray-600">
                    ₹3L – ₹8L depending on location and scale
                  </p>
                </Card>
              </div>

            </div>

          </Container>
        </div>
      </Section>

      {/* CONTACT */}
      <Section>
        <div className="bg-white py-0">
          <Container>

            <div className="text-center">
              <Heading
                title="Get in Touch"
                subtitle="Contact us to start your franchise journey"
              />
            </div>

            <div className="max-w-5xl mx-auto mt-14">
              <div className="grid md:grid-cols-3 gap-8">

                <div className="p-8 rounded-2xl bg-white shadow-md text-center">
                  <h3 className="font-semibold text-[#0f2044] mb-2">Address</h3>
                  <p className="text-sm text-gray-600">
                    #258/1, 1st Floor, Near 31E Bus Stop Rd,
                    2nd Block, Thyagaraja Nagar,
                    Bengaluru, Karnataka 560028
                  </p>
                </div>

                <div className="p-8 rounded-2xl bg-white shadow-md text-center">
                  <h3 className="font-semibold text-[#0f2044] mb-2">Phone</h3>
                  <p className="text-sm text-gray-600">
                    +91 888 000 7484 <br />
                    +91 966 337 0950
                  </p>
                </div>

                <div className="p-8 rounded-2xl bg-white shadow-md text-center">
                  <h3 className="font-semibold text-[#0f2044] mb-2">Email</h3>
                  <p className="text-sm text-gray-600">
                    support@mcjinstitute.com
                  </p>
                </div>

              </div>
            </div>

          </Container>
        </div>
      </Section>

      {/* CTA */}
      <Section>
        <div className="bg-gradient-to-r from-[#0f2044] to-[#1a3570] py-20">
          <Container>

            <div className="text-center text-white">
              <h2 className="text-3xl font-bold mb-4">
                Ready to Start Your Franchise?
              </h2>

              <p className="text-gray-300 mb-6">
                Join MCJ Institute and grow your business today.
              </p>

              <Button className="bg-[#b8922a] hover:bg-[#a67c1f] text-white px-8 py-3">
                Get Started
              </Button>
            </div>

          </Container>
        </div>
      </Section>

    </main>
  );
}