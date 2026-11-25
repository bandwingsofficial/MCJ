
"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQ_ITEMS = [
  {
    question: "Which accounting courses are available at MCJ Academy?",
    answer:
      "MCJ offers Junior Accountant, Accounts Executive and Senior Accountant courses.",
  },
  {
    question: "What is the duration of the accounting courses?",
    answer:
      "Junior Accountant is 2 months, Accounts Executive is 2.5 months and Senior Accountant is 3 months.",
  },
  {
    question: "What subjects are covered?",
    answer:
      "Training topics include accounting, Tally Prime, Excel, GST, Income Tax, TDS, Payroll and Zoho Books. Course coverage varies by programme.",
  },
  {
    question: "Does MCJ provide practical accounting training?",
    answer:
      "Yes. MCJ includes practical exercises and hands-on learning using simulation software.",
  },
  {
    question: "Are online accounting classes available?",
    answer:
      "Yes. Students can choose classroom training, live online classes or pre-recorded video courses.",
  },
  {
    question: "Does MCJ provide placement assistance?",
    answer:
      "Yes. MCJ provides placement assistance to support students in exploring relevant accounting job opportunities.",
  },
  {
    question: "Can I attend a demo class before joining?",
    answer:
      "You can enquire about upcoming free demo classes and register for an available session.",
  },
  {
    question: "Where is MCJ Accounting Training Institute located?",
    answer:
      "MCJ has training branches in Bangalore. Visit the branches page for current locations and contact details.",
  },
];

export function HomeFaqSection() {
  const [openItem, setOpenItem] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    setOpenItem((current) => (current === index ? null : index));
  };

  return (
    <section className="bg-white px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-[#2563EB]">
            FAQs
          </span>

          <h2 className="mt-3 text-2xl font-bold leading-tight text-[#0B1F3A] sm:text-3xl">
            Frequently Asked Questions About{" "}
            <span className="text-[#2563EB]">Accounting Courses</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2 md:gap-5">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openItem === index;

            return (
              <div
                key={item.question}
                className={`overflow-hidden rounded-xl border bg-white transition-colors duration-300 ${
                  isOpen
                    ? "border-[#7DA2FF]"
                    : "border-slate-200 hover:border-[#7DA2FF]"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleItem(index)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${index}`}
                  className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left"
                >
                  <span className="text-sm font-semibold leading-6 text-[#0B1F3A] sm:text-base">
                    {item.question}
                  </span>

                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-[#2563EB] transition-transform duration-300 ease-in-out ${
                      isOpen ? "rotate-180" : "rotate-0"
                    }`}
                  />
                </button>

                <div
                  id={`faq-answer-${index}`}
                  className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
                    isOpen
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                  aria-hidden={!isOpen}
                >
                  <div className="overflow-hidden">
                    <div className="border-t border-slate-100 px-5 py-4">
                      <p className="text-sm leading-7 text-slate-600">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
