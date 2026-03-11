"use client";

import { Menu, X } from "lucide-react";
import { useState } from "react";

export function MobileMenuButton({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 md:hidden dark:text-gray-300 dark:hover:bg-gray-800"
        aria-label="Toggle menu"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Desktop nav */}
      <div className="hidden items-center gap-4 md:flex">{children}</div>

      {/* Mobile nav */}
      {open && (
        <div
          className="absolute left-0 right-0 top-full z-50 border-b border-gray-200 bg-white p-4 shadow-lg md:hidden dark:border-gray-700 dark:bg-gray-900"
          onClick={() => setOpen(false)}
        >
          <div className="flex flex-col gap-3">{children}</div>
        </div>
      )}
    </>
  );
}
