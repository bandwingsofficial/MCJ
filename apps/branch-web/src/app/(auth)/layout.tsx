import {
  ReactNode,
} from "react";

import { GuestGuard } from "@/src/core/guards/guest.guard";

interface Props {
  children: ReactNode;
}

export default function AuthLayout({
  children,
}: Props) {
  return (
    <GuestGuard>
      {children}
    </GuestGuard>
  )
}