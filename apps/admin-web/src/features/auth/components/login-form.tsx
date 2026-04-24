"use client";

import Image from "next/image";
import { Input } from "@/src/shared/components/ui/input";
import { Button } from "@/src/shared/components/ui/button";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex">
      {/* LEFT SIDE */}
      <div className="w-1/2 bg-[#0B1120] text-white flex flex-col items-center justify-center gap-6 px-10">
        
        {/* Title */}
        <div className="text-center space-y-2">
          <h2 className="text-lg font-medium text-gray-300">
            Admin Login
          </h2>

         
        </div>

        {/* Logo */}
        <Image
          src="/Logo/MCJ_logo.png"
          alt="MCJ Logo"
          width={180}
          height={180}
          className="object-contain"
        />
         <h1 className="text-2xl font-semibold">
            MCJ Accounting Training Institute
          </h1>
      </div>

      {/* RIGHT SIDE */}
      <div className="w-1/2 flex items-center justify-center bg-gray-50">
        <div className="w-[380px] space-y-6">
          
          <h2 className="text-2xl font-semibold text-gray-800 text-center">
            Login
          </h2>

          <div className="space-y-4">
            <Input placeholder="Email" />
            <Input placeholder="Password" type="password" />
          </div>

          <Button
            className="w-full h-11 text-base"
            onClick={() => router.push("/dashboard")}
          >
            Login
          </Button>
        </div>
      </div>
    </div>
  );
}