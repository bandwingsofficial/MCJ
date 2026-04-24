"use client";

import React from "react";

type Props = {
  title?: string;
  children: React.ReactNode;
};

export function LegalLayout({ title, children }: Props) {
  return (
    <main className="min-h-screen bg-white">


      {/* CONTENT */}
      <section className="bg-white py-4">
        <div className="max-w-4xl mx-auto px-4 space-y-8 text-gray-700 leading-relaxed text-sm md:text-base">
          {children}
        </div>
      </section>

    </main>
  );
}