"use client";

import { Button } from "@/src/shared/components/ui/button";
import { Badge } from "@/src/shared/components/ui/badge";
import { EmptyState } from "@/src/shared/components/ui/empty-state";
import { Loader } from "@/src/shared/components/ui/loader";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/shared/components/ui/table";

import {
  useSessions,
  useRevokeSession,
} from "@/src/features/auth/hooks/use-sessions";

export function SessionList() {
  const { data, isLoading } =
    useSessions();

  const revokeMutation =
    useRevokeSession();

  if (isLoading) {
    return <Loader />;
  }

  if (
    !data?.sessions.length
  ) {
    return (
      <EmptyState
        title="No Active Sessions"
        description="No active devices found."
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>
            Device
          </TableHead>

          <TableHead>
            IP Address
          </TableHead>

          <TableHead>
            Status
          </TableHead>

          <TableHead>
            Action
          </TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {data.sessions.map(
          (session) => (
            <TableRow
              key={session.id}
            >
              <TableCell>
                {session.device}
              </TableCell>

              <TableCell>
                {
                  session.ipAddress
                }
              </TableCell>

              <TableCell>
                {session.isCurrent ? (
                  <Badge variant="success">
                    Current
                  </Badge>
                ) : (
                  <Badge>
                    Active
                  </Badge>
                )}
              </TableCell>

              <TableCell>
                {!session.isCurrent && (
                  <Button
                    variant="danger"
                    loading={
                      revokeMutation.isPending
                    }
                    onClick={() =>
                      revokeMutation.mutate(
                        session.id
                      )
                    }
                  >
                    Revoke
                  </Button>
                )}
              </TableCell>
            </TableRow>
          )
        )}
      </TableBody>
    </Table>
  );
}