"use client";

import { useEffect } from "react";
import Link from "next/link";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ error, reset }: Props) {
  useEffect(() => {
    console.error("App Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col bg-[#fdf8ef]">

      {/* MAIN */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-lg w-full text-center bg-white border border-[#e8e0cf] rounded-2xl p-10 shadow-sm">

          {/* TITLE */}
          <h2 className="text-2xl md:text-3xl font-bold text-[#0f2044] mb-4">
            Something went wrong
          </h2>

          {/* DESCRIPTION */}
          <p className="text-gray-600 mb-6">
            An unexpected error occurred. Please try again or return to the homepage.
          </p>

          {/* SAFE ERROR MESSAGE */}
          {error?.message && (
            <p className="text-xs text-gray-400 mb-6 break-words">
              {error.message}
            </p>
          )}

          {/* ACTIONS */}
          <div className="flex gap-4 justify-center">

            <button
              onClick={() => reset()}
              className="px-5 py-2.5 bg-gradient-to-r from-[#2563D9] to-[#1746A2] text-white rounded-md text-sm hover:from-[#1E58C7] hover:to-[#123D94] transition"
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