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
    setSubmitted(true);
  }

  return (
    <main>

      {/* HERO (BLUE HEADER) */}
      <Section className="bg-gradient-to-r from-[#0f2044] to-[#1b2f5c] pt-28 pb-20">
        <Container>

          <div className="text-center max-w-3xl mx-auto text-white">
            <h1 className="text-4xl md:text-5xl font-bold">
              Contact Us
            </h1>

            <p className="mt-4 text-lg text-gray-300">
              We’d love to hear from you
            </p>

            <p className="mt-6 text-gray-400 leading-relaxed">
              Have questions about courses, placements, or admissions?
              Reach out to our team and we’ll get back to you shortly.
            </p>
          </div>

        </Container>
      </Section>

      {/* CONTENT */}
      <Section className="bg-[#fdf8ef] py-20">
        <Container>

          <div className="grid md:grid-cols-2 gap-12 items-start">

            {/* LEFT: CONTACT INFO */}
            <div className="space-y-6">

              {[
                {
                  title: "Visit Us",
                  value: "MCJ Institute, Bangalore, India",
                },
                {
                  title: "Call Us",
                  value: "+91 98765 43210",
                },
                {
                  title: "Email",
                  value: "support@mcjinstitute.com",
                },
                {
                  title: "Working Hours",
                  value: "Mon - Sat: 9:00 AM – 7:00 PM",
                },
              ].map((item) => (
                <Card
                  key={item.title}
                  className="p-6 rounded-xl border border-[#e8e0cf] bg-white shadow-sm hover:shadow-md transition"
                >
                  <h3 className="text-lg font-semibold text-[#0f2044] mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {item.value}
                  </p>
                </Card>
              ))}

            </div>

            {/* RIGHT: FORM */}
            <Card className="p-8 rounded-xl border border-[#e8e0cf] bg-white shadow-md">

              {!submitted ? (
                <form onSubmit={handleSubmit} className="space-y-5">

                  {/* NAME */}
                  <div>
                    <label className="text-sm font-medium text-[#0f2044]">
                      Full Name
                    </label>
                    <input
                      required
                      className="w-full mt-1 border border-[#e8e0cf] rounded-lg px-4 py-3 outline-none focus:border-[#b8922a] focus:ring-1 focus:ring-[#b8922a] transition"
                      placeholder="Enter your name"
                    />
                  </div>

                  {/* EMAIL */}
                  <div>
                    <label className="text-sm font-medium text-[#0f2044]">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      className="w-full mt-1 border border-[#e8e0cf] rounded-lg px-4 py-3 outline-none focus:border-[#b8922a] focus:ring-1 focus:ring-[#b8922a] transition"
                      placeholder="Enter your email"
                    />
                  </div>

                  {/* PHONE */}
                  <div>
                    <label className="text-sm font-medium text-[#0f2044]">
                      Phone
                    </label>
                    <input
                      className="w-full mt-1 border border-[#e8e0cf] rounded-lg px-4 py-3 outline-none focus:border-[#b8922a] focus:ring-1 focus:ring-[#b8922a] transition"
                      placeholder="Enter your phone"
                    />
                  </div>

                  {/* MESSAGE */}
                  <div>
                    <label className="text-sm font-medium text-[#0f2044]">
                      Message
                    </label>
                    <textarea
                      required
                      rows={4}
                      className="w-full mt-1 border border-[#e8e0cf] rounded-lg px-4 py-3 outline-none focus:border-[#b8922a] focus:ring-1 focus:ring-[#b8922a] transition"
                      placeholder="Write your message..."
                    />
                  </div>

                  <Button className="w-full bg-[#0f2044] hover:bg-[#1b2f5c] text-white py-3 rounded-lg">
                    Send Message
                  </Button>

                </form>
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-2xl font-semibold text-[#0f2044] mb-2">
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

      {/* CTA */}
      <Section className="bg-[#0f2044] py-20">
        <Container>

          <div className="text-center text-white max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Start Your Career?
            </h2>

            <p className="text-gray-300 mb-6">
              Explore our courses and take the first step today.
            </p>

            <Button className="bg-[#b8922a] hover:bg-[#a67c1f] text-white px-8 py-3 rounded-lg">
              Explore Courses
            </Button>
          </div>

        </Container>
      </Section>

    </main>
  );
}