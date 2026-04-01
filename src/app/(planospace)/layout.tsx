import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { HomeLinkIcon } from "@/components/dashboard/HomeLinkIcon";
import { SignOutButton } from "@/components/dashboard/SignOutButton";
import { SettingsLink } from "@/components/dashboard/SettingsLink";
import NotificationBell from "@/components/dashboard/NotificationBell";
import { prisma } from "@/lib/prisma";

export default async function VeedeckLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id! },
    select: { name: true, email: true },
  });

  const displayName = dbUser?.name || dbUser?.email || null;

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <nav className="bg-card border-b">
        <div className="px-3 sm:px-6 flex items-center justify-between py-3 gap-4">
          {/* Left: home + logo */}
          <div className="flex items-center gap-2 shrink-0">
            <HomeLinkIcon />
            <div className="flex items-center gap-2.5 shrink-0">
              <Image src="/planospace-logo.svg" alt="Veedeck" width={28} height={28} className="block dark:hidden" />
              <Image src="/planospace-logo-dark.svg" alt="Veedeck" width={28} height={28} className="hidden dark:block" />
              <span className="text-xl font-bold tracking-tight">Veedeck</span>
            </div>
          </div>

          {/* Right: user + settings + logout */}
          <div className="flex items-center gap-3">
            {displayName && (
              <span className="hidden sm:block text-sm text-gray-500 dark:text-gray-400">
                {displayName}
              </span>
            )}
            <NotificationBell userId={session.user.id!} iconOnly />
            <SettingsLink />
            <SignOutButton />
          </div>
        </div>
      </nav>

      <main className="flex-1 px-3 sm:px-6 py-4 sm:py-8">
        {children}
      </main>
    </div>
  );
}
