"use client";

import { Mail, MapPin, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FaInstagram, FaTwitter, FaWhatsapp } from "react-icons/fa";

export function Footer() {
  return (
    <footer className="bg-[#0f2044] border-t mt-20">

      {/* MAIN FOOTER */}
      <div className="max-w-7xl mx-auto px-6 py-14">

        <div className="
          grid 
          grid-cols-1 
          sm:grid-cols-2 
          md:grid-cols-3 
          lg:grid-cols-5 
          gap-8
        ">

          {/* COLUMN 1 — BRAND */}
          <div className="max-w-xs">
            <div className="flex items-center gap-3 mb-4">
              <Image
                src="/logo/MCJ_logo.png"
                alt="MCJ Logo"
                width={40}
                height={40}
                style={{ height: "auto" }}
              />
              <h2 className="text-lg font-semibold text-white">
                MCJ Institute
              </h2>
            </div>

            <p className="text-sm text-gray-300 mb-4 leading-relaxed">
              Empowering students with practical accounting skills, real-world
              training, and placement support to build successful careers.
            </p>

            {/* SOCIAL ICONS */}
            <div className="flex gap-4 text-gray-300">
              <FaInstagram className="w-5 h-5 cursor-pointer transition-all duration-300 hover:scale-125 hover:text-pink-400 hover:drop-shadow-[0_0_8px_rgba(236,72,153,0.6)]" />
              <FaTwitter className="w-5 h-5 cursor-pointer transition-all duration-300 hover:scale-125 hover:text-blue-400 hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
              <FaWhatsapp className="w-5 h-5 cursor-pointer transition-all duration-300 hover:scale-125 hover:text-green-400 hover:drop-shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
            </div>
          </div>

          {/* COLUMN 2 — COMPANY */}
          <div>
            <h3 className="font-semibold mb-4 text-white">Company</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              {[
                { name: "About Us", href: "/about" },
                { name: "Contact Us", href: "/contact" },
                { name: "Careers", href: "/jobs" },
                { name: "Success Stories", href: "/success-stories" },
              ].map((item) => (
                <li key={item.name} className="relative group w-fit">
                  <Link
                    href={item.href}
                    className="
                      transition-all duration-300
                      group-hover:text-transparent
                      group-hover:bg-clip-text
                      group-hover:bg-gradient-to-r
                      group-hover:from-blue-400
                      group-hover:to-yellow-400
                    "
                  >
                    {item.name}
                  </Link>

                  {/* UNDERLINE */}
                  <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-gradient-to-r from-blue-400 to-yellow-400 transition-all duration-300 group-hover:w-full" />
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 3 — LEGAL */}
          <div>
            <h3 className="font-semibold mb-4 text-white">Legal</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              {[
                { name: "Privacy Policy", href: "/legal/privacy-policy" },
                { name: "Terms of Service", href: "/legal/terms" },
                { name: "Return Policy", href: "/legal/return-policy" },
                { name: "Refund Policy", href: "/legal/refund-policy" },
                { name: "FAQ", href: "/faq" },
              ].map((item) => (
                <li key={item.name} className="relative group w-fit">
                  <Link
                    href={item.href}
                    className="
                      transition-all duration-300
                      group-hover:text-transparent
                      group-hover:bg-clip-text
                      group-hover:bg-gradient-to-r
                      group-hover:from-blue-400
                      group-hover:to-yellow-400
                    "
                  >
                    {item.name}
                  </Link>

                  <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-gradient-to-r from-blue-400 to-yellow-400 transition-all duration-300 group-hover:w-full" />
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 4 — BRANCHES */}
          <div>
            <h3 className="font-semibold mb-4 text-white">Branches</h3>
            <ul className="space-y-2 text-esm text-gray-300">
              {[
                "Basavanagudi, Bangalore",
                "Malleshwaram, Bangalore",
                "BTM Layout, Bangalore",
                "Raja Rajeshwari Nagar, Bangalore",
                "Marathahalli, Bangalore",
                "Vijayanagar, Bangalore",
              ].map((item) => (
                <li
                  key={item}
                  className="
                    transition-all duration-300
                    hover:translate-x-1 hover:text-white
                  "
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 5 — CONTACT */}
          <div className="max-w-sm">
            <h3 className="font-semibold mb-4 text-white">Contact</h3>

            <div className="space-y-3 text-sm text-gray-300">

              <div className="flex items-start gap-2 group">
                <MapPin className="w-4 h-4 mt-1 shrink-0 transition group-hover:text-yellow-400" />
                <p className="group-hover:text-white transition">
                  #258/1, 1st Floor, Near 31E Bus Stop Rd,<br />
                  2nd Block, Thyagaraja Nagar,<br />
                  Bengaluru, Karnataka 560028
                </p>
              </div>

              <div className="flex items-center gap-2 group">
                <Phone className="w-4 h-4 shrink-0 transition group-hover:text-green-400" />
                <p className="group-hover:text-white transition">
                  +91 888 000 7484 / +91 966 337 0950
                </p>
              </div>

              <div className="flex items-center gap-2 group">
                <Mail className="w-4 h-4 shrink-0 transition group-hover:text-blue-400" />
                <p className="group-hover:text-white transition">
                  support@mcjinstitute.com
                </p>
              </div>

            </div>

            {/* BUTTONS */}
            <div className="flex gap-3 mt-5">
              <button className="
                border border-white/30 px-3 py-2 rounded-md text-xs text-gray-200
                backdrop-blur-md
                transition-all duration-300
                hover:bg-white/10 hover:scale-105 hover:shadow-lg
              ">
                Google Play
              </button>

              <button className="
                border border-white/30 px-3 py-2 rounded-md text-xs text-gray-200
                backdrop-blur-md
                transition-all duration-300
                hover:bg-white/10 hover:scale-105 hover:shadow-lg
              ">
                App Store
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* BOTTOM BAR */}
      <div className="border-t border-white/10 py-4 text-sm text-gray-300">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-2">
          
          <p className="hover:text-white transition">
            © 2026 MCJ Institute. All rights reserved.
          </p>

          <p className="text-xs hover:text-white transition">
            Made with ❤️ in India
          </p>

        </div>
      </div>

    </footer>
  );
}