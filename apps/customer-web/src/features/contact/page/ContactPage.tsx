"use client";

import Image from "next/image";
import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  Building2,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send,
  User,
} from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { Input } from "@/src/shared/components/ui/input";
import { Label } from "@/src/shared/components/ui/label";
import { Textarea } from "@/src/shared/components/ui/textarea";
import { MCJ_CONTACT } from "@/src/shared/constants/site.constants";

function telHref(phone: string) {
  return `tel:${phone.replace(/\s/g, "")}`;
}

function ContactInfoBlock({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Phone;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-[0_2px_12px_rgba(11,31,58,0.04)] sm:p-5">
      <div className="flex items-start gap-3.5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#2563EB]">
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
            {label}
          </p>
          <div className="mt-1.5 text-sm font-semibold leading-relaxed text-[#0B1F3A]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const mapsQuery = useMemo(
    () => encodeURIComponent(MCJ_CONTACT.addressLines.join(", ")),
    [],
  );
  const mapsEmbedUrl = `https://maps.google.com/maps?q=${mapsQuery}&z=15&output=embed`;
  const mapsOpenUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="m-0 w-full bg-white p-0">
      {/* —— Premium contact hero —— */}
      <section className="relative overflow-hidden border-b border-slate-100 bg-[#F8FBFF]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#EFF6FF] to-transparent" />
        <div className="pointer-events-none absolute -right-16 top-0 h-56 w-56 rounded-full bg-[#E0E7FF]/50 blur-3xl" />
        <div className="pointer-events-none absolute -left-10 bottom-0 h-44 w-44 rounded-full bg-[#EDE9FE]/40 blur-3xl" />
        <div className="pointer-events-none absolute right-1/3 top-1/2 h-32 w-32 -translate-y-1/2 rounded-full bg-[#DBEAFE]/40 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-4 py-8 sm:px-6 sm:py-9 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10 lg:px-8 lg:py-10">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#2563EB]">
              Get in Touch
            </p>
            <h1 className="mt-2.5 text-3xl font-bold leading-[1.12] tracking-tight text-[#0B1F3A] sm:text-[2.35rem]">
              Let&apos;s Talk
            </h1>
            <p className="mt-3.5 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
              Have a question, idea, or need support? We&apos;re here to help
              you connect with MCJ Training Institute.
            </p>

            <div className="mt-5 flex flex-wrap gap-2.5">
              <a
                href={telHref(MCJ_CONTACT.phone)}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200/90 bg-white px-3.5 py-2 text-sm font-semibold text-[#0B1F3A] shadow-sm transition hover:border-[#2563EB]/30 hover:text-[#2563EB]"
              >
                <Phone className="h-3.5 w-3.5 text-[#2563EB]" />
                {MCJ_CONTACT.phone}
              </a>
              <a
                href={`mailto:${MCJ_CONTACT.email}`}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200/90 bg-white px-3.5 py-2 text-sm font-semibold text-[#0B1F3A] shadow-sm transition hover:border-[#2563EB]/30 hover:text-[#2563EB]"
              >
                <Mail className="h-3.5 w-3.5 text-[#2563EB]" />
                {MCJ_CONTACT.email}
              </a>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:mx-0 lg:max-w-none">
            <div className="pointer-events-none absolute -inset-3 rounded-[1.75rem] bg-gradient-to-br from-[#BFDBFE]/45 via-transparent to-[#DDD6FE]/40 blur-md" />
            <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_16px_40px_rgba(11,31,58,0.08)]">
              <div className="relative aspect-[16/10] w-full">
                <Image
                  src="/why/Image-Expert-Mentors.jpg"
                  alt="MCJ Training Institute"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 420px"
                  className="object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F3A]/50 via-[#0B1F3A]/10 to-transparent" />
              </div>
              <div className="absolute bottom-3 left-3 right-3 rounded-xl border border-white/20 bg-white/95 px-3.5 py-2.5 backdrop-blur-sm">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#2563EB]">
                  Visit us
                </p>
                <p className="mt-1 text-xs leading-relaxed text-[#0B1F3A]">
                  {MCJ_CONTACT.addressLines[MCJ_CONTACT.addressLines.length - 1]}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* —— Main form + contact info —— */}
      <section className="relative bg-white py-10 sm:py-12 lg:py-14">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#F8FBFF] to-transparent" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)] lg:gap-10">
            {/* Form */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-[0_8px_28px_rgba(11,31,58,0.06)] sm:p-7">
              {!submitted ? (
                <>
                  <div className="mb-6 border-b border-slate-100 pb-5">
                    <h2 className="text-xl font-bold tracking-tight text-[#0B1F3A] sm:text-2xl">
                      Send us a message
                    </h2>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
                      Whether you&apos;re looking for support, have a business
                      inquiry, or just want to say hello — our team is ready to
                      connect with you.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <Label required htmlFor="contact-name">
                        Full Name
                      </Label>
                      <div className="relative">
                        <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                          id="contact-name"
                          name="fullName"
                          required
                          placeholder="Enter your full name"
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <Label required htmlFor="contact-email">
                          Email Address
                        </Label>
                        <div className="relative">
                          <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <Input
                            id="contact-email"
                            name="email"
                            type="email"
                            required
                            placeholder="you@example.com"
                            className="pl-10"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="contact-phone">Phone Number</Label>
                        <div className="relative">
                          <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <Input
                            id="contact-phone"
                            name="phone"
                            type="tel"
                            placeholder="Your phone number"
                            className="pl-10"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label required htmlFor="contact-message">
                        Your Message
                      </Label>
                      <div className="relative">
                        <MessageSquare className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                        <Textarea
                          id="contact-message"
                          name="message"
                          required
                          rows={5}
                          placeholder="How can we help you?"
                          className="min-h-[140px] resize-y pl-10"
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="h-12 w-full rounded-xl bg-[#0B1F3A] text-sm font-semibold text-white hover:bg-[#102A56] sm:w-auto sm:px-8"
                    >
                      <Send className="mr-2 h-4 w-4" />
                      Send Message
                    </Button>
                  </form>
                </>
              ) : (
                <div className="flex flex-col items-center py-10 text-center sm:py-14">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 ring-4 ring-emerald-50">
                    <CheckCircle2 className="h-7 w-7 text-emerald-600" />
                  </span>
                  <h3 className="mt-5 text-2xl font-bold text-[#0B1F3A]">
                    Thank You!
                  </h3>
                  <p className="mt-2 max-w-sm text-sm text-slate-500">
                    Your message has been sent successfully.
                  </p>
                  <Button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="mt-6 h-11 rounded-xl bg-[#0B1F3A] px-6 text-white hover:bg-[#102A56]"
                  >
                    Send Another
                  </Button>
                </div>
              )}
            </div>

            {/* Contact information */}
            <aside className="space-y-4 lg:sticky lg:top-20">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#2563EB]">
                  Contact details
                </p>
                <h2 className="mt-1.5 text-xl font-bold tracking-tight text-[#0B1F3A]">
                  Reach MCJ Institute
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
                  Prefer to talk directly? Use the details below to call, email,
                  or visit us.
                </p>
              </div>

              <ContactInfoBlock icon={Phone} label="Phone">
                <a
                  href={telHref(MCJ_CONTACT.phone)}
                  className="block transition hover:text-[#2563EB]"
                >
                  {MCJ_CONTACT.phone}
                </a>
                <a
                  href={telHref(MCJ_CONTACT.phoneSecondary)}
                  className="mt-1 block font-medium text-slate-600 transition hover:text-[#2563EB]"
                >
                  {MCJ_CONTACT.phoneSecondary}
                </a>
              </ContactInfoBlock>

              <ContactInfoBlock icon={Mail} label="Email">
                <a
                  href={`mailto:${MCJ_CONTACT.email}`}
                  className="transition hover:text-[#2563EB]"
                >
                  {MCJ_CONTACT.email}
                </a>
              </ContactInfoBlock>

              <ContactInfoBlock icon={MapPin} label="Address">
                <address className="not-italic">
                  {MCJ_CONTACT.addressLines.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </address>
              </ContactInfoBlock>

              <ContactInfoBlock icon={Clock3} label="Hours">
                {MCJ_CONTACT.hours}
              </ContactInfoBlock>

              <ContactInfoBlock icon={Building2} label="Institute">
                MCJ Training Institute
              </ContactInfoBlock>
            </aside>
          </div>
        </div>
      </section>

      {/* —— Location / map —— */}
      <section className="relative overflow-hidden border-t border-slate-100 bg-[#F8FBFF] py-10 sm:py-12">
        <div className="pointer-events-none absolute -right-20 top-0 h-56 w-56 rounded-full bg-[#E0E7FF]/45 blur-3xl" />
        <div className="pointer-events-none absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-[#EDE9FE]/35 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#2563EB]">
                Find us
              </p>
              <h2 className="mt-1.5 text-xl font-bold tracking-tight text-[#0B1F3A] sm:text-2xl">
                Our location
              </h2>
              <p className="mt-1.5 max-w-xl text-sm text-slate-500">
                {MCJ_CONTACT.addressLines.join(", ")}
              </p>
            </div>
            <a
              href={mapsOpenUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-[#0B1F3A] transition hover:border-[#2563EB]/30 hover:text-[#2563EB]"
            >
              Open in Maps
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_8px_28px_rgba(11,31,58,0.06)]">
            <div className="relative aspect-[21/9] min-h-[220px] w-full sm:min-h-[280px]">
              <iframe
                title="MCJ Institute location"
                src={mapsEmbedUrl}
                className="absolute inset-0 h-full w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
            <span className="inline-flex items-center gap-1.5 font-medium text-[#0B1F3A]">
              <MapPin className="h-3.5 w-3.5 text-[#2563EB]" />
              {MCJ_CONTACT.addressLines[1]}
            </span>
            <span>{MCJ_CONTACT.hours}</span>
          </div>
        </div>
      </section>
    </div>
  );
}
