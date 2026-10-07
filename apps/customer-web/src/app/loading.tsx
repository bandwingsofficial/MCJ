"use client";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/40 border-t-blue-600" />
    </div>
  );
}
