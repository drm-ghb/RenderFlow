import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Settings, ShoppingCart } from "lucide-react";
import { SignOutButton } from "@/components/dashboard/SignOutButton";
import NotificationBell from "@/components/dashboard/NotificationBell";
import { HomeLinkIcon } from "@/components/dashboard/HomeLinkIcon";
import NavSidebar from "@/components/dashboard/NavSidebar";
import { prisma } from "@/lib/prisma";

export default async function ListyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id! },
    select: { name: true, email: true, navMode: true, globalHiddenModules: true },
  });

  const displayName = dbUser?.name || dbUser?.email || null;
  const navMode = dbUser?.navMode ?? "dashboard";
  const hiddenModules = dbUser?.globalHiddenModules ?? [];

  return (
    <div className="h-screen flex flex-col">
      <nav className="bg-card border-b">
        <div className="px-3 sm:px-6 flex items-center justify-between py-3 gap-4">

          {/* Home (Planospace launcher) */}
          <HomeLinkIcon hidden={navMode === "sidebar"} />

          {/* Logo */}
          <Link href="/listy" className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 rounded-lg bg-[#19213D] flex items-center justify-center">
              <ShoppingCart size={15} className="text-white" />
            </div>
            <span className="text-xl font-bold">Listy</span>
          </Link>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Right actions */}
          <div className="flex items-center gap-4 shrink-0">
            <span className="hidden md:block text-sm text-gray-500 dark:text-gray-400">{displayName}</span>
            <NotificationBell userId={session.user.id!} iconOnly />
            <Link
              href="/settings/listy"
              title="Ustawienia"
              className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-muted"
            >
              <Settings size={18} />
            </Link>
            <SignOutButton />
          </div>

        </div>
      </nav>
      {navMode === "sidebar" ? (
        <div className="flex flex-1 min-h-0">
          <NavSidebar hiddenModules={hiddenModules} />
          <main className="flex-1 px-3 sm:px-6 py-4 sm:py-8 overflow-y-auto">
            {children}
          </main>
        </div>
      ) : (
        <main className="flex-1 px-3 sm:px-6 py-4 sm:py-8">
          {children}
        </main>
      )}
    </div>
  );
}
