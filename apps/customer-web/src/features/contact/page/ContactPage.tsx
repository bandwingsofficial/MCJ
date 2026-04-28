"use client";

import { useState } from "react";
import { Container } from "@/src/shared/components/ui/container";
import { Section } from "@/src/shared/components/ui/section";
import { Button } from "@/src/shared/components/ui/button";

export function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <main className="relative min-h-screen text-white">

      {/* ================= BACKGROUND IMAGE ================= */}
      <div
        className="absolute inset-0 -z-10 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1521791136064-7986c2920216')",
        }}
      />

      {/* DARK OVERLAY */}
      <div className="absolute inset-0 -z-10 bg-black/70 backdrop-blur-[2px]" />

      {/* ================= HERO ================= */}
      <Section className="pt-8 pb-8 text-center">
        <Container>
          <h1 className="text-4xl md:text-5xl font-bold mb-2 tracking-tight">
            Let’s Talk
          </h1>
          <p className="text-gray-300 max-w-xl mx-auto">
            Have a question, idea, or need support? We’re here to help you.
          </p>
        </Container>
      </Section>

      {/* ================= CONTENT ================= */}
      <Section className="pb-16">
        <Container>

          <div className="grid md:grid-cols-2 gap-16 items-start">

            {/* ================= LEFT: CLEAN CONTENT ================= */}
            <div className="space-y-6 max-w-md">

              <h2 className="text-2xl font-semibold">
                Get in touch
              </h2>

              <p className="text-gray-300 text-sm leading-relaxed">
                Whether you're looking for support, have a business inquiry,
                or just want to say hello — our team is ready to connect with you.
              </p>

              <div className="space-y-4 text-sm text-gray-300">

                <div>
                  <p className="font-medium text-white">📍 Address</p>
                  <p>MCJ Institute, Bangalore, India</p>
                </div>

                <div>
                  <p className="font-medium text-white">📞 Phone</p>
                  <p>+91 98765 43210</p>
                </div>

                <div>
                  <p className="font-medium text-white">📧 Email</p>
                  <p>support@mcjinstitute.com</p>
                </div>

                <div>
                  <p className="font-medium text-white">⏰ Hours</p>
                  <p>Mon - Sat: 9:00 AM – 7:00 PM</p>
                </div>

              </div>

            </div>

            {/* ================= RIGHT: MINIMAL FORM ================= */}
            <div className="max-w-md w-full">

              {!submitted ? (
                <form onSubmit={handleSubmit} className="space-y-6">

                  <input
                    required
                    placeholder="Full Name"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg backdrop-blur-md placeholder-gray-400 focus:outline-none focus:border-white focus:bg-white/20 transition"
                  />

                  <input
                    type="email"
                    required
                    placeholder="Email Address"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg backdrop-blur-md placeholder-gray-400 focus:outline-none focus:border-white focus:bg-white/20 transition"
                  />

                  <input
                    placeholder="Phone Number"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg backdrop-blur-md placeholder-gray-400 focus:outline-none focus:border-white focus:bg-white/20 transition"
                  />

                  <textarea
                    required
                    rows={4}
                    placeholder="Your Message"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg backdrop-blur-md placeholder-gray-400 focus:outline-none focus:border-white focus:bg-white/20 transition"
                  />

                  <Button className="w-full bg-white text-black hover:bg-gray-200 py-3 rounded-lg font-medium transition">
                    Send Message
                  </Button>

                </form>
              ) : (
                <div className="text-center py-10">
                  <h3 className="text-2xl font-semibold mb-2">
                    Thank You!
                  </h3>
                  <p className="text-gray-300 text-sm">
                    Your message has been sent successfully.
                  </p>

                  <Button
                    onClick={() => setSubmitted(false)}
                    className="mt-6 bg-white text-black hover:bg-gray-200"
                  >
                    Send Another
                  </Button>
                </div>
              )}

            </div>

          </div>

        </Container>
      </Section>

    </main>
  );
}