import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8FBFF] px-4">
      <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-[#0B1F3A]">Page not found</h1>
        <p className="mt-2 text-sm text-slate-600">
          The learning page you requested does not exist.
        </p>
        <Link
          href="/student/learning"
          className="mt-6 inline-flex rounded-xl bg-[#2563EB] px-4 py-2 text-sm font-medium text-white"
        >
          Back to My Learning
        </Link>
      </div>
    </div>
  );
}
