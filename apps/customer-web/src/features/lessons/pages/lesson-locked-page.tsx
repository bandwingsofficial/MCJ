import Link from "next/link";
import { Lock } from "lucide-react";

export function LessonLockedPage() {
  return (
    <main className="flex min-h-[60vh] items-center justify-center px-6 py-16">
      <div className="max-w-md text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
          <Lock className="h-8 w-8 text-slate-400" />
        </div>

        <h1 className="mt-6 text-2xl font-bold text-slate-900">
          Lesson Locked
        </h1>

        <p className="mt-3 text-slate-600">
          This lesson is currently unavailable. Learning content will unlock when
          it becomes accessible.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/student/my-learning"
            className="inline-flex items-center justify-center rounded-md bg-gradient-to-r from-[#2563D9] to-[#1746A2] px-4 py-2 text-sm font-medium text-white hover:from-[#1E58C7] hover:to-[#123D94]"
          >
            Go to My Learning
          </Link>
          <Link
            href="/courses"
            className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Browse Courses
          </Link>
        </div>
      </div>
    </main>
  );
}
