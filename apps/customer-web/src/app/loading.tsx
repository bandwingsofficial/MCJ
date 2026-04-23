"use client";

import Link from "next/link";

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col bg-[#fdf8ef]">

      {/* HEADER */}
      <header className="w-full bg-white border-b border-[#e8e0cf]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="font-bold text-lg text-[#0f2044]">
            MCJ Institute
          </h1>

          <Link
            href="/"
            className="text-sm font-medium text-[#0f2044] hover:text-[#b8922a] transition"
          >
            Home
          </Link>
        </div>
      </header>

      {/* MAIN LOADER */}
      <main className="flex-1 flex items-center justify-center px-6">

        <div className="flex flex-col items-center gap-6 bg-white border border-[#e8e0cf] rounded-2xl px-10 py-12 shadow-sm">

          {/* PREMIUM SPINNER */}
          <div className="relative">
            <div className="w-12 h-12 border-4 border-[#e8e0cf] rounded-full"></div>
            <div className="w-12 h-12 border-4 border-[#b8922a] border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          </div>

          {/* TEXT */}
          <div className="text-center">
            <p className="text-[#0f2044] font-medium text-sm">
              Loading, please wait...
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Preparing your experience
            </p>
          </div>

        </div>

      </main>

      {/* FOOTER */}
      <footer className="w-full bg-white border-t border-[#e8e0cf]">
        <div className="max-w-7xl mx-auto px-6 py-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} MCJ Institute. All rights reserved.
        </div>
      </footer>

    </div>
  );
}