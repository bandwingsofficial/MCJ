"use client";

import Link from "next/link";

export default function NotFound() {
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

      {/* MAIN */}
      <main className="flex-1 flex items-center justify-center px-6">

        <div className="max-w-xl w-full text-center bg-white border border-[#e8e0cf] rounded-2xl p-10 shadow-sm">

          {/* 404 NUMBER */}
          <h1 className="text-6xl md:text-7xl font-bold text-[#b8922a] mb-4">
            404
          </h1>

          {/* TITLE */}
          <h2 className="text-2xl md:text-3xl font-bold text-[#0f2044] mb-4">
            Page Not Found
          </h2>

          {/* DESCRIPTION */}
          <p className="text-gray-600 mb-8 leading-relaxed">
            The page you’re looking for doesn’t exist or may have been moved.
            Don’t worry — you can return to the homepage or explore our courses.
          </p>

          {/* ACTION BUTTONS */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">

            <Link
              href="/"
              className="px-6 py-3 bg-gradient-to-r from-[#2563D9] to-[#1746A2] text-white rounded-md text-sm font-medium hover:from-[#1E58C7] hover:to-[#123D94] transition"
            >
              Go to Home
            </Link>

            <button
              onClick={() => window.history.back()}
              className="px-6 py-3 border border-[#e8e0cf] rounded-md text-sm font-medium text-[#0f2044] hover:border-[#b8922a] hover:text-[#b8922a] transition"
            >
              Go Back
            </button>

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