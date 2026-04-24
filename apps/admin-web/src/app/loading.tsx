"use client";

export default function Loading() {
  return (
    <div className="h-screen flex items-center justify-center bg-gray-50">
      <div className="space-y-4 text-center">
        {/* Spinner */}
        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />

        {/* Text */}
        <p className="text-gray-500 text-sm">
          Loading dashboard...
        </p>
      </div>
    </div>
  );
}