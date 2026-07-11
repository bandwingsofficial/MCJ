"use client";

import Image from "next/image";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/shared/components/ui/table";

import { EmptyState } from "@/src/shared/components/ui/empty-state";

import { CategoryStatusBadge } from "./category-status-badge";

import { Dropdown } from "@/src/shared/components/ui/dropdown";

import { Button } from "@/src/shared/components/ui/button";

import { MoreHorizontal } from "lucide-react";

import type {
  CategoryListItem,
} from "@/src/features/categories/types/category.types";

interface Props {
  categories: CategoryListItem[];

  onEdit: (
    category: CategoryListItem
  ) => void;

  onActivate: (
    category: CategoryListItem
  ) => void;

  onDeactivate: (
    category: CategoryListItem
  ) => void;

  onDelete: (
    category: CategoryListItem
  ) => void;

  onRestore: (
    category: CategoryListItem
  ) => void;

  onPermanentDelete: (
    category: CategoryListItem
  ) => void;
}

export function CategoryTable({
  categories,
  onEdit,
  onActivate,
  onDeactivate,
  onDelete,
  onRestore,
  onPermanentDelete,
}: Props) {
  if (
    categories.length === 0
  ) {
    return (
      <EmptyState
        title="No Categories Found"
        description="Create your first category."
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>
            Image
          </TableHead>

          <TableHead>
            Name
          </TableHead>

          <TableHead>
            Slug
          </TableHead>

          <TableHead>
            Status
          </TableHead>

          <TableHead>
            Order
          </TableHead>

          <TableHead>
            Created
          </TableHead>

          <TableHead>
            Actions
          </TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {categories.map(
          (category) => (
            <TableRow
              key={
                category.id
              }
            >
              <TableCell>
                {category.thumbnailUrl ? (
                  <Image
                    src={
                      category.thumbnailUrl
                    }
                    alt={
                      category.name
                    }
                    width={50}
                    height={50}
                    className="h-12 w-12 rounded-md object-cover border"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-md border bg-muted text-xs text-muted-foreground">
                    N/A
                  </div>
                )}
              </TableCell>

              <TableCell>
                {
                  category.name
                }
              </TableCell>

              <TableCell>
                {
                  category.slug
                }
              </TableCell>

              <TableCell>
                <CategoryStatusBadge
                  status={
                    category.status
                  }
                />
              </TableCell>

              <TableCell>
                {
                  category.displayOrder
                }
              </TableCell>

              <TableCell>
                {new Date(
                  category.createdAt
                ).toLocaleDateString()}
              </TableCell>

              <TableCell>
                <Dropdown
                  trigger={
                    <Button
                      variant="ghost"
                    >
                      <MoreHorizontal />
                      <span className="sr-only">
                        Open actions
                      </span>
                    </Button>
                  }
                  items={[
                    {
                      label: "Edit",
                      onClick: () =>
                        onEdit(
                          category
                        ),
                    },
                    {
                      label: "Activate",
                      onClick: () =>
                        onActivate(
                          category
                        ),
                    },
                    {
                      label: "Deactivate",
                      onClick: () =>
                        onDeactivate(
                          category
                        ),
                    },
                    {
                      label: "Delete",
                      onClick: () =>
                        onDelete(
                          category
                        ),
                    },
                    {
                      label: "Restore",
                      onClick: () =>
                        onRestore(
                          category
                        ),
                    },
                    {
                      label:
                        "Permanent Delete",
                      onClick: () =>
                        onPermanentDelete(
                          category
                        ),
                    },
                  ]}
                />
              </TableCell>
            </TableRow>
          )
        )}
      </TableBody>
    </Table>
  );
}