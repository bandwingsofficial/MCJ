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
              <h2 className="text-lg font-semibold text-white">MCJ Institute</h2>
            </div>

            <p className="text-sm text-gray-300 mb-4 leading-relaxed">
              Empowering students with practical accounting skills, real-world
              training, and placement support to build successful careers.
            </p>

            <div className="flex gap-4 text-gray-300">
              <FaInstagram className="w-5 h-5 cursor-pointer hover:text-pink-400" />
              <FaTwitter className="w-5 h-5 cursor-pointer hover:text-blue-400" />
              <FaWhatsapp className="w-5 h-5 cursor-pointer hover:text-green-400" />
            </div>
          </div>

          {/* COLUMN 2 — COMPANY */}
          <div>
            <h3 className="font-semibold mb-4 text-white">Company</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link href="/about">About Us</Link></li>
              <li><Link href="/contact">Contact Us</Link></li>
              <li><Link href="/jobs">Careers</Link></li>
              <li><Link href="/success-stories">Success Stories</Link></li>
            </ul>
          </div>

          {/* COLUMN 3 — LEGAL */}
          <div>
            <h3 className="font-semibold mb-4 text-white">Legal</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link href="#">Privacy Policy</Link></li>
              <li><Link href="#">Terms of Service</Link></li>
              <li><Link href="#">Return Policy</Link></li>
              <li><Link href="#">Refund Policy</Link></li>
              <li><Link href="/faq">FAQ</Link></li>
            </ul>
          </div>

          {/* COLUMN 4 — BRANCHES */}
          <div>
            <h3 className="font-semibold mb-4 text-white">Branches</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>Basavanagudi, Bangalore</li>
              <li>Malleshwaram, Bangalore</li>
              <li>BTM Layout, Bangalore</li>
              <li>Raja Rajeshwari Nagar, Bangalore</li>
              <li>Marathahalli, Bangalore</li>
              <li>Vijayanagar, Bangalore</li>
            </ul>
          </div>

          {/* COLUMN 5 — CONTACT */}
          <div className="max-w-sm">
            <h3 className="font-semibold mb-4 text-white">Contact</h3>

            <div className="space-y-3 text-sm text-gray-300">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-1 shrink-0" />
                <p>
                  #258/1, 1st Floor, Near 31E Bus Stop Rd,<br />
                  2nd Block, Thyagaraja Nagar,<br />
                  Bengaluru, Karnataka 560028
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 shrink-0" />
                <p>+91 888 000 7484 / +91 966 337 0950</p>
              </div>

              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 shrink-0" />
                <p>support@mcjinstitute.com</p>
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button className="border border-gray-400 px-3 py-2 rounded-md text-xs text-gray-200 hover:bg-white/10">
                Google Play
              </button>
              <button className="border border-gray-400 px-3 py-2 rounded-md text-xs text-gray-200 hover:bg-white/10">
                App Store
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* BOTTOM BAR */}
      <div className="border-t border-white/10 py-4 text-sm text-gray-300">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-2">
          
          <p>© 2026 MCJ Institute. All rights reserved.</p>

          <p className="text-xs">
            Made with ❤️ in India
          </p>

        </div>
      </div>

    </footer>
  );
}