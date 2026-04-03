"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LayoutDashboard, Briefcase, ShoppingCart, PanelLeftClose, PanelLeftOpen } from "lucide-react";

interface NavSidebarProps {
  hiddenModules: string[];
}

const items = [
  { label: "Dashboard", href: "/home", icon: <LayoutDashboard size={18} />, slug: null },
  { label: "Projekty", href: "/projekty", icon: <Briefcase size={18} />, slug: null },
  { label: "RenderFlow", href: "/renderflow", icon: null, slug: "renderflow" },
  { label: "Listy", href: "/listy", icon: <ShoppingCart size={18} />, slug: "listy" },
];

const HIDDEN_ON: RegExp[] = [
  /^\/projects\/[^/]+\/renders\//,
  /^\/listy\/.+/,
];

export default function NavSidebar({ hiddenModules }: NavSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("nav-sidebar-collapsed");
    if (saved === "true") setCollapsed(true);
  }, []);

  function toggle() {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("nav-sidebar-collapsed", String(next));
  }

  const forceCollapsed = HIDDEN_ON.some((pattern) => pattern.test(pathname));
  const isCollapsed = forceCollapsed || collapsed;

  const visible = items.filter((item) => !item.slug || !hiddenModules.includes(item.slug));

  return (
    <aside className={`hidden md:flex flex-col border-r bg-card flex-shrink-0 transition-all duration-200 ${isCollapsed ? "w-14" : "w-52"}`}>
      <nav className="flex-1 p-2 space-y-0.5">
        {visible.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              title={isCollapsed ? item.label : undefined}
              className={`flex items-center gap-3 px-2.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-primary/10 text-primary"
                  : "text-gray-600 dark:text-gray-400 hover:bg-muted hover:text-foreground"
              }`}
            >
              <span className="flex-shrink-0 w-5 flex items-center justify-center">
                {item.icon ?? (
                  <>
                    <Image src="/logo.svg" alt="RenderFlow" width={18} height={18} className="block dark:hidden" />
                    <Image src="/logo-dark.svg" alt="RenderFlow" width={18} height={18} className="hidden dark:block" />
                  </>
                )}
              </span>
              {!isCollapsed && item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-2 border-t">
        <button
          onClick={toggle}
          title={isCollapsed ? "Rozwiń pasek" : "Zwiń pasek"}
          className="flex items-center justify-center w-full py-2 px-2.5 rounded-lg text-gray-400 hover:bg-muted hover:text-foreground transition-colors"
        >
          {isCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>
      </div>
    </aside>
  );
}
