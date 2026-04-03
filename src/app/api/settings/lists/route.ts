import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { listsCategoryOrder: true },
  });

  return NextResponse.json({ listsCategoryOrder: user?.listsCategoryOrder ?? [] });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { listsCategoryOrder } = await req.json();

  if (!Array.isArray(listsCategoryOrder)) {
    return NextResponse.json({ error: "Nieprawidłowe dane" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { listsCategoryOrder },
  });

  return NextResponse.json({ ok: true });
}
