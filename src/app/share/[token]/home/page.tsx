import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ImageIcon, ShoppingBag } from "lucide-react";
import ShareNavbar from "@/components/share/ShareNavbar";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default async function ProjectHomePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const project = await prisma.project.findUnique({
    where: { shareToken: token },
    include: {
      renders: { where: { archived: false }, select: { id: true }, take: 1 },
      shoppingLists: { select: { id: true, name: true, shareToken: true } },
    },
  });

  if (!project) notFound();

  const hasRenders = project.renders.length > 0;
  const moduleCount = (hasRenders ? 1 : 0) + project.shoppingLists.length;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <ShareNavbar />

      <main className="flex-1 container mx-auto px-3 sm:px-6 py-4 sm:py-8 max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
          <div>
            <h1 className="text-2xl font-bold">{project.title}</h1>
            <p className="text-gray-500 mt-1">
              {moduleCount === 0
                ? "Brak dostępnych modułów"
                : `${moduleCount} moduł${moduleCount === 1 ? "" : moduleCount < 5 ? "y" : "ów"}`}
            </p>
          </div>
        </div>

        {moduleCount === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-muted-foreground">Brak dostępnych modułów.</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {hasRenders && (
            <Link href={`/share/${token}`} className="block">
              <Card className="hover:shadow-[0_4px_16px_rgba(25,33,61,0.2)] hover:border-[#19213D]/30 transition-all cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#19213D]/10 flex items-center justify-center shrink-0">
                      <ImageIcon size={22} className="text-[#19213D]" />
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="text-base leading-tight">RenderFlow</CardTitle>
                      <CardDescription className="mt-0.5">Wizualizacje i rendery projektu</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          )}

          {project.shoppingLists.map((list) => (
            <Link key={list.id} href={`/share/list/${list.shareToken}`} className="block">
              <Card className="hover:shadow-[0_4px_16px_rgba(25,33,61,0.2)] hover:border-[#19213D]/30 transition-all cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#19213D]/10 flex items-center justify-center shrink-0">
                      <ShoppingBag size={22} className="text-[#19213D]" />
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="text-base leading-tight">{list.name}</CardTitle>
                      <CardDescription className="mt-0.5">Lista zakupowa</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
