"use client";

import { useState } from "react";
import { Container } from "@/src/shared/components/ui/container";
import { Section } from "@/src/shared/components/ui/section";
import { Heading } from "@/src/shared/components/ui/heading";
import { Card } from "@/src/shared/components/ui/card";
import { Button } from "@/src/shared/components/ui/button";

export function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // TODO: integrate API (domain layer)
    setSubmitted(true);
  }

  return (
    <main>

      {/* HERO */}
      <Section className="bg-white pt-20 pb-12">
        <Container>
          <Heading
            title="Contact Us"
            subtitle="We’d love to hear from you"
            align="center"
          />
          <p className="text-center text-gray-600 mt-4 max-w-2xl mx-auto">
            Have questions about courses, placements, or admissions? Reach out to our team and we’ll get back to you shortly.
          </p>
        </Container>
      </Section>

      {/* CONTENT */}
      <Section className="bg-[#fdf8ef] py-16">
        <Container>

          <div className="grid md:grid-cols-2 gap-10 items-start">

            {/* LEFT: CONTACT INFO */}
            <div className="space-y-6">

              <Card className="p-6">
                <h3 className="text-lg font-semibold text-[#0f2044] mb-2">
                  Visit Us
                </h3>
                <p className="text-sm text-gray-600">
                  MCJ Institute, Bangalore, India
                </p>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold text-[#0f2044] mb-2">
                  Call Us
                </h3>
                <p className="text-sm text-gray-600">
                  +91 98765 43210
                </p>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold text-[#0f2044] mb-2">
                  Email
                </h3>
                <p className="text-sm text-gray-600">
                  support@mcjinstitute.com
                </p>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold text-[#0f2044] mb-2">
                  Working Hours
                </h3>
                <p className="text-sm text-gray-600">
                  Mon - Sat: 9:00 AM – 7:00 PM
                </p>
              </Card>

            </div>

            {/* RIGHT: FORM */}
            <Card className="p-8">

              {!submitted ? (
                <form onSubmit={handleSubmit} className="space-y-5">

                  <div>
                    <label className="text-sm font-medium text-[#0f2044]">
                      Full Name
                    </label>
                    <input
                      required
                      className="w-full mt-1 border border-[#e8e0cf] rounded-md p-3 outline-none focus:border-[#b8922a]"
                      placeholder="Enter your name"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-[#0f2044]">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      className="w-full mt-1 border border-[#e8e0cf] rounded-md p-3 outline-none focus:border-[#b8922a]"
                      placeholder="Enter your email"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-[#0f2044]">
                      Phone
                    </label>
                    <input
                      className="w-full mt-1 border border-[#e8e0cf] rounded-md p-3 outline-none focus:border-[#b8922a]"
                      placeholder="Enter your phone"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-[#0f2044]">
                      Message
                    </label>
                    <textarea
                      required
                      rows={4}
                      className="w-full mt-1 border border-[#e8e0cf] rounded-md p-3 outline-none focus:border-[#b8922a]"
                      placeholder="Write your message..."
                    />
                  </div>

                  <Button className="w-full">
                    Send Message
                  </Button>

                </form>
              ) : (
                <div className="text-center py-10">
                  <h3 className="text-xl font-semibold text-[#0f2044] mb-2">
                    Thank You!
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Your message has been submitted. Our team will contact you soon.
                  </p>

                  <div className="mt-6">
                    <Button onClick={() => setSubmitted(false)}>
                      Send Another Message
                    </Button>
                  </div>
                </div>
              )}

            </Card>

          </div>

        </Container>
      </Section>

      {/* MAP / CTA */}
      <Section className="bg-white py-16">
        <Container>

          <div className="text-center">
            <h2 className="text-2xl font-bold text-[#0f2044] mb-4">
              Ready to Start Your Career?
            </h2>

            <p className="text-gray-600 mb-6">
              Explore our courses and take the first step today.
            </p>

            <Button className="bg-[#b8922a] hover:bg-[#a67c1f] text-white">
              Explore Courses
            </Button>
          </div>

        </Container>
      </Section>

    </main>
  );
}