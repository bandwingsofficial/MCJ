"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { Loader } from "@/src/shared/components/ui/loader";
import { useStudentPortalNavigation } from "@/src/features/student/context/StudentPortalNavigationProvider";

function matchesRoute(pathname: string, prefix: string): boolean {
  return (
    pathname === prefix ||
    pathname.startsWith(`${prefix}/`)
  );
}

function getRedirectPath(input: {
  pathname: string;
  showMyApplications: boolean;
  showMyCourses: boolean;
}): string | null {
  const { pathname } = input;

  if (matchesRoute(pathname, "/student/profile")) {
    return null;
  }

  if (matchesRoute(pathname, "/student/applications")) {
    return input.showMyApplications ? null : "/student/profile";
  }

  if (matchesRoute(pathname, "/student/my-learning")) {
    return input.showMyCourses ? null : "/student/profile";
  }

  if (pathname.startsWith("/student")) {
    return "/student/profile";
  }

  return null;
}

export function StudentPortalAccessControl({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const navigation = useStudentPortalNavigation();

  useEffect(() => {
    if (navigation.isLoading) {
      return;
    }

    const redirectPath = getRedirectPath({
      pathname,
      showMyApplications: navigation.showMyApplications,
      showMyCourses: navigation.showMyCourses,
    });

    if (redirectPath && redirectPath !== pathname) {
      router.replace(redirectPath);
    }
  }, [navigation, pathname, router]);

  if (navigation.isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader />
      </div>
    );
  }

  return children;
}
