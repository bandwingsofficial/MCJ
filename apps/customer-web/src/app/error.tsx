"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col bg-[#fdf8ef]">

      {/* HEADER */}
      <header className="w-full border-b border-[#e8e0cf] bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="font-bold text-lg text-[#0f2044]">
            MCJ Institute
          </h1>

          <Link
            href="/"
            className="text-sm font-medium text-[#0f2044] hover:text-[#b8922a]"
          >
            Home
          </Link>
        </div>
      </header>

      {/* MAIN ERROR CONTENT */}
      <main className="flex-1 flex items-center justify-center px-6">

        <div className="max-w-lg w-full text-center bg-white border border-[#e8e0cf] rounded-2xl p-10 shadow-sm">

          <h2 className="text-2xl md:text-3xl font-bold text-[#0f2044] mb-4">
            Something went wrong
          </h2>

          <p className="text-gray-600 mb-6">
            We encountered an unexpected error. Please try again or return to the homepage.
          </p>

          {/* OPTIONAL ERROR MESSAGE (SAFE) */}
          <p className="text-xs text-gray-400 mb-6">
            {error?.message}
          </p>

          {/* ACTION BUTTONS */}
          <div className="flex gap-4 justify-center">

            <button
              onClick={() => reset()}
              className="px-5 py-2.5 bg-[#0f2044] text-white rounded-md text-sm hover:bg-[#1a3460] transition"
            >
              Try Again
            </button>

            <Link
              href="/"
              className="px-5 py-2.5 border border-[#e8e0cf] rounded-md text-sm text-[#0f2044] hover:border-[#b8922a] hover:text-[#b8922a] transition"
            >
              Go Home
            </Link>

          </div>
        </div>

      </main>

      {/* FOOTER */}
      <footer className="w-full border-t border-[#e8e0cf] bg-white">
        <div className="max-w-7xl mx-auto px-6 py-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} MCJ Institute. All rights reserved.
        </div>
      </footer>

    </div>
  );
}