"use client";

import Image from "next/image";
import { Card } from "@/src/shared/components/ui/card";
import { LoginForm } from "@/src/features/auth/components/login-form";

export function LoginCard() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4 md:p-6">
      <Card className="flex w-full max-w-4xl min-h-[550px] overflow-hidden rounded-2xl border-none shadow-2xl bg-white">
        {/* Left Side: Gradient Design & Center-Aligned Illustration */}
        <div className="hidden lg:flex w-1/2 bg-gradient-to-b from-[#5c4df0] to-[#2b61f4] items-center justify-center p-8">
          <div className="relative w-full h-full min-h-[350px] flex items-center justify-center">
            <Image
              src="/login.jpeg"
              alt="Security Illustration"
              width={340}
              height={340}
              className="object-contain transform hover:scale-102 transition-transform duration-300"
              priority
            />
          </div>
        </div>

        {/* Right Side: Form Content Section */}
        <div className="w-full lg:w-1/2 p-8 sm:p-12 md:p-16 flex flex-col justify-between bg-white">
          <div className="my-auto space-y-6">
            <div className="text-center space-y-1">
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                WELCOME!
              </h1>
              <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">
                Branch Portal Login
              </p>
            </div>

            <LoginForm />

            <div className="text-center pt-2">
              <p className="text-xs text-slate-500 leading-relaxed">
                If you forgot credentials, please{" "}
                <span className="font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer transition-colors duration-200 hover:underline">
                  contact your admin.
                </span>
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}