"use client";

import { StudentPortalNavigationProvider } from "@/src/features/student/context/StudentPortalNavigationProvider";

export const AuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <StudentPortalNavigationProvider>
      {children}
    </StudentPortalNavigationProvider>
  );
};
