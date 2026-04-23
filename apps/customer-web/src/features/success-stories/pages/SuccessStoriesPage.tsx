"use client";

import { Container } from "@/src/shared/components/ui/container";
import { Section } from "@/src/shared/components/ui/section";
import { Heading } from "@/src/shared/components/ui/heading";
import { Card } from "@/src/shared/components/ui/card";
import { Button } from "@/src/shared/components/ui/button";

const testimonials = [
  {
    name: "Ravi Kumar",
    role: "Accounts Executive",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    text: "MCJ Institute gave me practical knowledge in Tally and GST. I got placed within 2 months.",
  },
  {
    name: "Sneha Patil",
    role: "GST Analyst",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
    text: "The live classes and support helped me understand real-world accounting easily.",
  },
  {
    name: "Arjun Shetty",
    role: "Junior Accountant",
    image: "https://randomuser.me/api/portraits/men/65.jpg",
    text: "Best training institute. The placement team is very supportive.",
  },
];

export function SuccessStoriesPage() {
  return (
    <main>

      {/* HERO */}
      <Section className="bg-white pt-20 pb-12">
        <Container>

          <Heading
            title="Success Stories"
            subtitle="Real students. Real careers."
            align="center"
          />

          <p className="text-center text-gray-600 mt-4 max-w-2xl mx-auto">
            Our students have successfully built careers in accounting,
            taxation, and finance. Here are some of their stories.
          </p>

        </Container>
      </Section>

      {/* STATS */}
      <Section className="bg-[#fdf8ef] py-16">
        <Container>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">

            {[
              { value: "5000+", label: "Students Placed" },
              { value: "98%", label: "Success Rate" },
              { value: "200+", label: "Hiring Partners" },
              { value: "15+", label: "Years Experience" },
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

      {/* TESTIMONIALS */}
      <Section className="bg-white py-20">
        <Container>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

            {testimonials.map((t, i) => (
              <Card
                key={i}
                className="p-6 hover:shadow-xl transition duration-300"
              >

                <p className="text-gray-700 text-sm leading-relaxed">
                  “{t.text}”
                </p>

                <div className="flex items-center gap-4 mt-6">
                  <img
                    src={t.image}
                    alt={t.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-semibold text-[#0f2044] text-sm">
                      {t.name}
                    </h4>
                    <p className="text-xs text-gray-500">{t.role}</p>
                  </div>
                </div>

              </Card>
            ))}

          </div>

        </Container>
      </Section>

      {/* FEATURE STORY */}
      <Section className="bg-[#fdf8ef] py-20">
        <Container>

          <div className="grid md:grid-cols-2 gap-12 items-center">

            {/* IMAGE */}
            <img
              src="https://images.unsplash.com/photo-1607746882042-944635dfe10e"
              className="rounded-2xl shadow-lg w-full h-[350px] object-cover"
              alt="Success Story"
            />

            {/* CONTENT */}
            <div>
              <h2 className="text-2xl font-bold text-[#0f2044] mb-4">
                From Student to Professional
              </h2>

              <p className="text-gray-600 leading-relaxed mb-4">
                One of our students started with no accounting background and
                successfully secured a job within 3 months after completing training.
              </p>

              <p className="text-gray-600 leading-relaxed">
                This transformation is possible because of our structured learning,
                practical training, and dedicated placement support.
              </p>

              <div className="mt-6">
                <Button>Join Now</Button>
              </div>
            </div>

          </div>

        </Container>
      </Section>

      {/* CTA */}
      <Section className="bg-[#0f2044] py-16">
        <Container>

          <div className="text-center text-white">
            <h2 className="text-2xl font-bold mb-4">
              Be Our Next Success Story
            </h2>

            <p className="text-gray-300 mb-6">
              Start your journey with MCJ Institute today.
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