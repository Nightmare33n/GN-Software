"use client";

import { useState } from "react";
import Link from "next/link";
import ButtonSignin from "@/components/ButtonSignin";

const navLinks = [
  { href: "#services", label: "Services" },
  { href: "#about", label: "About" },
  { href: "#contact", label: "Contact" }
];

const AgencyNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* AgencyNavbar START */}
      <nav className="sticky top-0 z-50 backdrop-blur-lg bg-black/80 border-b border-neutral/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <span className="text-xl font-bold">
                <span className="text-gn-cyan">GN</span>{" "}
                <span className="text-white group-hover:text-gn-emerald transition-colors">
                  Software
                </span>
              </span>
            </Link>

            {/* Desktop Links */}
            <div className="hidden md:flex gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-white/80 hover:text-gn-cyan transition-colors text-sm font-medium"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* CTA Button */}
            <div className="hidden md:block">
              <ButtonSignin extraStyle="!px-5 !py-2 !rounded-full !border !border-white/15 !bg-white/5 hover:!bg-white/10 hover:!border-white/25" />
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 text-white hover:text-gn-cyan transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden bg-gn-dark border-t border-neutral/10">
            <div className="px-4 py-4 space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block text-white/80 hover:text-gn-cyan transition-colors py-2"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-2">
                <ButtonSignin extraStyle="w-full !justify-center !px-5 !py-2.5 !rounded-full !border !border-white/15 !bg-white/5 hover:!bg-white/10 hover:!border-white/25" />
              </div>
            </div>
          </div>
        )}
      </nav>
      {/* AgencyNavbar END */}
    </>
  );
};

export default AgencyNavbar;
