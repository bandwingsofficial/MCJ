// src/app/not-found.tsx

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-gray-500 mt-2">Page not found</p>

      <Link href="/dashboard" className="mt-4 text-blue-500">
        Go to Dashboard
      </Link>
    </div>
  );
}