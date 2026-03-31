import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { SettingsGeneral } from "@/components/settings/SettingsGeneral";

export default async function SettingsOgolnePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      showProjectTitle: true,
      clientLogoUrl: true,
      clientWelcomeMessage: true,
      accentColor: true,
    },
  });

  if (!user) redirect("/login");

  return (
    <SettingsGeneral
      initialName={user.name ?? ""}
      initialEmail={user.email}
      initialShowProjectTitle={user.showProjectTitle}
      initialClientLogoUrl={user.clientLogoUrl}
      initialClientWelcomeMessage={user.clientWelcomeMessage}
      initialAccentColor={user.accentColor}
    />
  );
}
