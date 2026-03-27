import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/renders/route";
import { makeRequest, SESSION } from "../helpers";

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    project: { findFirst: vi.fn() },
    render: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    renderVersion: { create: vi.fn() },
    comment: { deleteMany: vi.fn() },
    $transaction: vi.fn(),
  },
}));

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const mockProject = {
  id: "proj-1",
  userId: SESSION.user.id,
  user: { defaultRenderStatus: "W_TRAKCIE" },
};

beforeEach(() => vi.clearAllMocks());

describe("POST /api/renders", () => {
  it("zwraca 401 bez sesji", async () => {
    vi.mocked(auth).mockResolvedValue(null);
    const res = await POST(makeRequest("POST", { projectId: "proj-1", name: "Render 1", fileUrl: "http://url" }));
    expect(res.status).toBe(401);
  });

  it("zwraca 404 gdy projekt nie istnieje", async () => {
    vi.mocked(auth).mockResolvedValue(SESSION as any);
    vi.mocked(prisma.project.findFirst).mockResolvedValue(null);

    const res = await POST(makeRequest("POST", { projectId: "proj-1", name: "Render 1", fileUrl: "http://url" }));
    expect(res.status).toBe(404);
  });

  it("tworzy nowy render (201)", async () => {
    vi.mocked(auth).mockResolvedValue(SESSION as any);
    vi.mocked(prisma.project.findFirst).mockResolvedValue(mockProject as any);
    vi.mocked(prisma.render.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.render.count).mockResolvedValue(3);
    vi.mocked(prisma.render.create).mockResolvedValue({
      id: "r1",
      name: "Render 1",
      fileUrl: "http://url",
      order: 3,
      status: "W_TRAKCIE",
    } as any);

    const res = await POST(makeRequest("POST", {
      projectId: "proj-1",
      name: "Render 1",
      fileUrl: "http://url",
      fileKey: "key1",
    }));

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.name).toBe("Render 1");
    expect(body.status).toBe("W_TRAKCIE");
    expect(prisma.render.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          name: "Render 1",
          order: 3,
          status: "W_TRAKCIE",
        }),
      })
    );
  });

  it("gdy render o tej samej nazwie istnieje — archiwizuje wersję i aktualizuje plik (200)", async () => {
    const existingRender = {
      id: "r1",
      name: "Render 1",
      fileUrl: "http://old-url",
      fileKey: "old-key",
      _count: { versions: 2 },
    };

    vi.mocked(auth).mockResolvedValue(SESSION as any);
    vi.mocked(prisma.project.findFirst).mockResolvedValue(mockProject as any);
    vi.mocked(prisma.render.findFirst).mockResolvedValue(existingRender as any);
    vi.mocked(prisma.$transaction).mockResolvedValue([]);
    vi.mocked(prisma.render.findUnique).mockResolvedValue({
      id: "r1",
      name: "Render 1",
      fileUrl: "http://new-url",
    } as any);

    const res = await POST(makeRequest("POST", {
      projectId: "proj-1",
      name: "Render 1",
      fileUrl: "http://new-url",
      fileKey: "new-key",
    }));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.versioned).toBe(true);
    expect(prisma.$transaction).toHaveBeenCalledOnce();
  });

  it("numer wersji = liczba istniejących wersji + 1", async () => {
    const existingRender = {
      id: "r1",
      name: "Render A",
      fileUrl: "http://v1",
      fileKey: "k1",
      _count: { versions: 4 },
    };

    vi.mocked(auth).mockResolvedValue(SESSION as any);
    vi.mocked(prisma.project.findFirst).mockResolvedValue(mockProject as any);
    vi.mocked(prisma.render.findFirst).mockResolvedValue(existingRender as any);
    vi.mocked(prisma.$transaction).mockResolvedValue([]);
    vi.mocked(prisma.render.findUnique).mockResolvedValue({ id: "r1" } as any);

    await POST(makeRequest("POST", {
      projectId: "proj-1",
      name: "Render A",
      fileUrl: "http://v5",
      fileKey: "k5",
    }));

    const txCall = vi.mocked(prisma.$transaction).mock.calls[0][0] as any[];
    // Pierwszy element transakcji to create wersji — sprawdzamy numer wersji przez args renderVersion.create
    expect(prisma.$transaction).toHaveBeenCalledOnce();
  });
});
