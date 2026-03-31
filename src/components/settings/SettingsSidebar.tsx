"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Settings, ShoppingCart } from "lucide-react";

const items = [
  {
    href: "/settings/ogolne",
    label: "Ustawienia ogólne",
    icon: <Settings size={16} />,
  },
  {
    href: "/settings/renderflow",
    label: "RenderFlow",
    icon: (
      <span className="flex items-center justify-center w-4 h-4">
        <Image src="/logo-dark.svg" alt="RenderFlow" width={16} height={16} className="hidden dark:block" />
        <Image src="/logo.svg" alt="RenderFlow" width={16} height={16} className="block dark:hidden" />
      </span>
    ),
  },
  {
    href: "/settings/listy",
    label: "Listy",
    icon: <ShoppingCart size={16} />,
  },
];

export default function SettingsSidebar() {
  const pathname = usePathname();

  return (
    <nav className="w-48 shrink-0">
      <ul className="space-y-0.5">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                  active
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <span className={active ? "text-primary" : "text-muted-foreground"}>{item.icon}</span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
