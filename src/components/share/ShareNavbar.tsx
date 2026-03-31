"use client";

import Link from "next/link";

interface ShareNavbarProps {
  backHref?: string;
  backLabel?: string;
}

export default function ShareNavbar({ backHref, backLabel }: ShareNavbarProps) {
  return (
    <nav className="bg-card border-b">
      <div className="container mx-auto px-3 sm:px-6 max-w-6xl flex items-center justify-between py-3 gap-4">
        {/* Planospace logo — identyczny jak w layout projektanta */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/planospace-logo.svg" alt="Planospace" width={28} height={28} className="block dark:hidden" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/planospace-logo-dark.svg" alt="Planospace" width={28} height={28} className="hidden dark:block" />
          <span className="text-xl font-bold tracking-tight">Planospace</span>
        </div>

        {backHref && (
          <Link
            href={backHref}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {backLabel ?? "Powrót"}
          </Link>
        )}
      </div>
    </nav>
  );
}
