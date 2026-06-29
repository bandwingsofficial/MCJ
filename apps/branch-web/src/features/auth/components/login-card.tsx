"use client";

import Image from "next/image";
import { Card } from "@/src/shared/components/ui/card";
import { LoginForm } from "@/src/features/auth/components/login-form";

export function LoginCard() {
  return (
    <>
      <style>{`
        @keyframes gradient-drift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        .branch-bg {
          background: #f8fafc;
          position: relative;
        }
        .branch-bg::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(-45deg, #f1f5f9, #e2e8f0, #f8fafc);
          background-size: 400% 400%;
          animation: gradient-drift 12s ease infinite;
          opacity: 0.6;
          z-index: 0;
        }
        .modern-shadow {
          box-shadow: 
            0 4px 6px -1px rgba(0, 0, 0, 0.02),
            0 12px 40px -8px rgba(15, 23, 42, 0.08),
            0 0 0 1px rgba(15, 23, 42, 0.04);
        }
      `}</style>

      <div className="branch-bg flex items-center justify-center min-h-screen p-4 overflow-hidden">
        <Card className="modern-shadow flex w-full max-w-[800px] overflow-hidden rounded-2xl border-none bg-white relative z-10">
          
          {/* Left Side: Clean, Compact Illustration Column */}
          <div className="hidden lg:flex w-[42%] bg-slate-50/70 flex-col justify-center gap-6 p-6 border-r border-slate-100">
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 rounded bg-indigo-600" />
              <span className="text-xs font-black tracking-wider text-slate-800 uppercase">Branch</span>
            </div>

            {/* Clean image fitting with eliminated margins */}
            <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-slate-200/60 bg-white p-1 shadow-sm">
              <Image
                src="/login.jpeg"
                alt="Security Gateway"
                fill
                className="object-cover rounded-lg"
                priority
                sizes="(max-w-768px) 100vw, 300px"
              />
            </div>

            <div className="space-y-1">
              <h3 className="text-xs font-bold text-slate-800">Workspace Node</h3>
              <p className="text-[11px] leading-normal text-slate-400 font-medium">
                Secure link connection system for regional client operational panels.
              </p>
            </div>
          </div>

          {/* Right Side: Tightened, Compact Form Content Panel */}
          <div className="w-full lg:w-[58%] p-6 sm:p-8 flex flex-col justify-center bg-white">
            <div className="space-y-4 w-full max-w-[340px] mx-auto">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-indigo-50 border border-indigo-100/50">
                  <span className="w-1 h-1 rounded-full bg-indigo-600" />
                  <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-600">
                    Client Workspace
                  </span>
                </div>
                <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
                  Sign In
                </h1>
                <p className="text-xs text-slate-400 font-medium">
                  Enter your assigned credentials to access your system.
                </p>
              </div>

              {/* Injected Login Form */}
              <LoginForm />

              <div className="text-center pt-2.5 border-t border-slate-100">
                <p className="text-[11px] text-slate-400 font-medium">
                  Need access help?{" "}
                  <span className="font-semibold text-indigo-600 hover:text-indigo-700 underline cursor-pointer">
                    Contact Admin
                  </span>
                </p>
              </div>
            </div>
          </div>

        </Card>
      </div>
    </>
  );
}