import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const comment = await prisma.listProductComment.findUnique({
    where: { id },
    include: { product: { include: { section: { include: { list: { select: { id: true } } } } } } },
  });
  if (!comment) {
    return NextResponse.json({ error: "Nie znaleziono" }, { status: 404 });
  }

  await prisma.listProductComment.delete({ where: { id } });
  await pusherServer.trigger(`list-product-${comment.productId}`, "comment-deleted", { id });
  await pusherServer.trigger(`shopping-list-${comment.product.section.list.id}`, "comment-activity", { productId: comment.productId, action: "deleted" });

  return NextResponse.json({ success: true });
}
