"use client";

import Link from "next/link";

import { Badge } from "@/src/shared/components/ui/badge";
import { Button } from "@/src/shared/components/ui/button";
import { Card } from "@/src/shared/components/ui/card";

interface TrainerSocialLinksCardProps {
  linkedInUrl: string | null;
  youtubeUrl: string | null;
  instagramUrl: string | null;
}

export function TrainerSocialLinksCard({
  linkedInUrl,
  youtubeUrl,
  instagramUrl,
}: TrainerSocialLinksCardProps) {
  const hasLinks =
    Boolean(linkedInUrl) ||
    Boolean(youtubeUrl) ||
    Boolean(instagramUrl);

  return (
    <Card className="p-6">
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            Social Links
          </h3>

          <Badge variant="info">
            {[
              linkedInUrl,
              youtubeUrl,
              instagramUrl,
            ].filter(Boolean).length}{" "}
            Connected
          </Badge>
        </div>

        {hasLinks ? (
          <div className="flex flex-col gap-3">
            {linkedInUrl && (
              <Button
                variant="outline"
                className="justify-start"
              >
                <Link
                  href={linkedInUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  LinkedIn
                </Link>
              </Button>
            )}

            {youtubeUrl && (
              <Button
                variant="outline"
                className="justify-start"
              >
                <Link
                  href={youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  YouTube
                </Link>
              </Button>
            )}

            {instagramUrl && (
              <Button
                variant="outline"
                className="justify-start"
              >
                <Link
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Instagram
                </Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed py-8 text-center">
            <p className="text-sm text-muted-foreground">
              No social links available.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}