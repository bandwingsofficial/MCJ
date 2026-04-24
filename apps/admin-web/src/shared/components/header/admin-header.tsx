"use client";

import { Input } from "@/src/shared/components/ui/input";
import { Avatar } from "@/src/shared/components/ui/avatar";
import { useEffect, useState } from "react";
import { Settings } from "lucide-react";

export function AdminHeader() {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();

      // Time (HH:MM AM/PM)
      const formattedTime = now.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      });

      // Date (Day, DD Month YYYY)
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
      
      {/* LEFT: SEARCH */}
      <div className="w-[380px]">
        <Input
          placeholder="Search analytics, students or courses..."
          className="h-10"
        />
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

        {/* SETTINGS ICON */}
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