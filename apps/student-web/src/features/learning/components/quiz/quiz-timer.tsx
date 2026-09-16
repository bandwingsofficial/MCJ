"use client";

import { useEffect, useRef } from "react";
import { Clock3 } from "lucide-react";

import { cn } from "@/src/shared/lib/cn";

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

interface QuizTimerProps {
  totalSeconds: number;
  remainingSeconds: number;
  onTick: () => void;
  onExpire: () => void;
  paused?: boolean;
  className?: string;
}

export function QuizTimer({
  totalSeconds,
  remainingSeconds,
  onTick,
  onExpire,
  paused = false,
  className,
}: QuizTimerProps) {
  const expiredRef = useRef(false);

  useEffect(() => {
    expiredRef.current = false;
  }, [totalSeconds]);

  useEffect(() => {
    if (paused) {
      return;
    }

    const intervalId = window.setInterval(() => {
      onTick();
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [paused, onTick]);

  useEffect(() => {
    if (remainingSeconds <= 0 && !expiredRef.current) {
      expiredRef.current = true;
      onExpire();
    }
  }, [remainingSeconds, onExpire]);

  const isLow = remainingSeconds <= 60;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium",
        isLow
          ? "border-rose-200 bg-rose-50 text-rose-700"
          : "border-violet-200 bg-violet-50 text-violet-700",
        className,
      )}
    >
      <Clock3 className="h-4 w-4" />
      <span>{formatTime(remainingSeconds)}</span>
      <span className="text-xs font-normal opacity-80">
        / {formatTime(totalSeconds)}
      </span>
    </div>
  );
}

export function formatQuizDuration(totalSeconds: number): string {
  return formatTime(totalSeconds);
}
