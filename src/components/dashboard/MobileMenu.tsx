"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Settings, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export default function MobileMenu({ userName }: { userName: string | null }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="p-1.5 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-muted transition-colors"
        aria-label="Menu"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-xl shadow-lg py-1 z-50">
          {userName && (
            <div className="px-4 py-2 text-sm font-medium text-foreground border-b border-border truncate">
              {userName}
            </div>
          )}
          <Link
            href="/settings/renderflow"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-muted transition-colors"
          >
            <Settings size={15} />
            Ustawienia
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-muted transition-colors"
          >
            <LogOut size={15} />
            Wyloguj
          </button>
        </div>
      )}
    </div>
  );
}
