"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ButtonSignin from "@/components/ButtonSignin";

const SunIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    className="h-5 w-5"
  >
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.5v2.5M12 19v2.5M4.5 12H2M22 12h-2.5M5.6 5.6 4 4M20 20l-1.6-1.6M18.4 5.6 20 4M4 20l1.6-1.6" />
  </svg>
);

const MoonIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    className="h-5 w-5"
  >
    <path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8 8 0 1 0 11 11Z" />
  </svg>
);

const navLinks = [
  { href: "#services", label: "Services" },
  { href: "/gigs", label: "Gigs" },
  { href: "#about", label: "About" },
  { href: "#contact", label: "Contact" }
];

const AgencyNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("gn-theme") : null;
    const prefersLight = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
    const nextTheme = stored || (prefersLight ? "light" : "dark");
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    if (typeof window !== "undefined") {
      localStorage.setItem("gn-theme", next);
    }
    document.documentElement.setAttribute("data-theme", next);
  };

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
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className="btn btn-ghost btn-circle border border-white/10 hover:border-white/30 transition"
                aria-label="Toggle theme"
              >
                {theme === "light" ? <SunIcon /> : <MoonIcon />}
              </button>
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
              <div className="flex justify-end pb-2">
                <button
                  onClick={toggleTheme}
                  className="btn btn-ghost btn-sm border border-white/10 hover:border-white/30 w-full"
                  aria-label="Toggle theme"
                >
                  {theme === "light" ? "Switch to dark" : "Switch to light"}
                </button>
              </div>
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
