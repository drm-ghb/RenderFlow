import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; clientId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, clientId } = await params;
  const project = await prisma.project.findFirst({ where: { id, userId: session.user.id } });
  if (!project) return NextResponse.json({ error: "Nie znaleziono" }, { status: 404 });

  const { isMainContact } = await req.json();

  if (isMainContact) {
    // Unset all others, set this one
    await prisma.projectClient.updateMany({
      where: { projectId: id },
      data: { isMainContact: false },
    });
    const updated = await prisma.projectClient.update({
      where: { id: clientId },
      data: { isMainContact: true },
    });
    // Sync project clientName/clientEmail
    await prisma.project.update({
      where: { id },
      data: { clientName: updated.name, clientEmail: updated.email ?? null },
    });
    return NextResponse.json(updated);
  }

  // Unset main contact
  const updated = await prisma.projectClient.update({
    where: { id: clientId },
    data: { isMainContact: false },
  });
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; clientId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, clientId } = await params;
  const project = await prisma.project.findFirst({ where: { id, userId: session.user.id } });
  if (!project) return NextResponse.json({ error: "Nie znaleziono" }, { status: 404 });

  // If deleting main contact, clear project clientName/clientEmail
  const client = await prisma.projectClient.findUnique({ where: { id: clientId } });
  await prisma.projectClient.deleteMany({ where: { id: clientId, projectId: id } });

  if (client?.isMainContact) {
    await prisma.project.update({
      where: { id },
      data: { clientName: null, clientEmail: null },
    });
  }

  return NextResponse.json({ success: true });
}
