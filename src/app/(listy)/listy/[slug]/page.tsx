import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ListDetail from "@/components/listy/ListDetail";

export default async function ListPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ product?: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { slug } = await params;
  const { product: initialOpenProductId } = await searchParams;

  const [userSettings, list] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user.id }, select: { listsCategoryOrder: true, clientLogoUrl: true } }),
    prisma.shoppingList.findFirst({
      where: {
        userId: session.user.id,
        OR: [{ slug }, { id: slug }],
      },
      include: {
        project: { select: { id: true, title: true, hiddenModules: true } },
        sections: {
          orderBy: { order: "asc" },
          include: { products: { orderBy: { order: "asc" }, include: { _count: { select: { comments: true } } } } },
        },
      },
    }),
  ]);

  if (!list) notFound();

  return (
    <ListDetail
      designerName={(session.user as { name?: string }).name ?? "Projektant"}
      designerLogoUrl={userSettings?.clientLogoUrl ?? undefined}
      initialOpenProductId={initialOpenProductId}
      categoryOrder={userSettings?.listsCategoryOrder ?? []}
      list={{
        id: list.id,
        name: list.name,
        shareToken: list.shareToken,
        project: list.project ? { id: list.project.id, title: list.project.title, hiddenModules: list.project.hiddenModules } : null,
        sections: list.sections.map((s) => ({
          id: s.id,
          name: s.name,
          order: s.order,
          sortBy: s.sortBy,
          products: s.products.map((p) => ({
            id: p.id,
            name: p.name,
            url: p.url,
            imageUrl: p.imageUrl,
            price: p.price,
            manufacturer: p.manufacturer,
            color: p.color,
            size: p.size,
            description: p.description,
            deliveryTime: p.deliveryTime,
            quantity: p.quantity,
            order: p.order,
            category: p.category,
            hidden: p.hidden,
            approval: p.approval,
            commentCount: p._count.comments,
          })),
        })),
      }}
    />
  );
}
