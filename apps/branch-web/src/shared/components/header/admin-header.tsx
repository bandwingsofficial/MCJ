"use client";

import { Input } from "@/src/shared/components/ui/input";
import { Avatar } from "@/src/shared/components/ui/avatar";
import { useEffect, useState } from "react";
import { Settings } from "lucide-react";

export function AdminHeader() {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");

  // TEMP STATIC (later replace with store / API)
  const branchName = "Hubli, Karnataka";

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();

      const formattedTime = now.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      });

      const formattedDate = now.toLocaleDateString("en-IN", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

      setTime(formattedTime);
      setDate(formattedDate);
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6">

      {/* LEFT SIDE */}
      <div className="flex items-center gap-6">

        {/* SEARCH */}
        <div className="w-[360px]">
          <Input
            placeholder="Search analytics, students or courses..."
            className="h-10"
          />
        </div>

        {/* BRANCH NAME */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full">
          <span className="text-xs text-gray-500">Branch</span>
          <span className="text-sm font-medium text-gray-800">
            {branchName}
          </span>
        </div>

      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-5">

        {/* TIME */}
        <div className="text-sm font-medium text-gray-800">
          {time}
        </div>

        {/* DATE */}
        <div className="text-sm text-gray-500">
          {date}
        </div>

        {/* SETTINGS */}
        <button className="p-2 rounded-full hover:bg-gray-100 transition">
          <Settings className="w-5 h-5 text-gray-600" />
        </button>

        {/* PROFILE */}
        <div className="cursor-pointer">
          <Avatar />
        </div>

      </div>
    </header>
  );
}