import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/rooms/route";
import { PATCH, DELETE } from "@/app/api/rooms/[id]/route";
import { makeRequest, makeParams, SESSION } from "../helpers";

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    project: { findFirst: vi.fn() },
    room: {
      count: vi.fn(),
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const mockProject = { id: "proj-1", userId: SESSION.user.id };
const mockRoom = {
  id: "room-1",
  name: "Salon",
  type: "SALON",
  project: mockProject,
};

beforeEach(() => vi.clearAllMocks());

describe("POST /api/rooms", () => {
  it("zwraca 401 bez sesji", async () => {
    vi.mocked(auth).mockResolvedValue(null);
    const res = await POST(makeRequest("POST", { projectId: "proj-1", name: "Salon" }));
    expect(res.status).toBe(401);
  });

  it("zwraca 400 gdy brak wymaganych pól", async () => {
    vi.mocked(auth).mockResolvedValue(SESSION as any);
    const res = await POST(makeRequest("POST", { projectId: "proj-1", name: "" }));
    expect(res.status).toBe(400);
  });

  it("zwraca 403 gdy projekt nie należy do użytkownika", async () => {
    vi.mocked(auth).mockResolvedValue(SESSION as any);
    vi.mocked(prisma.project.findFirst).mockResolvedValue(null);
    const res = await POST(makeRequest("POST", { projectId: "proj-1", name: "Salon" }));
    expect(res.status).toBe(403);
  });

  it("tworzy pomieszczenie z domyślnym typem INNE", async () => {
    vi.mocked(auth).mockResolvedValue(SESSION as any);
    vi.mocked(prisma.project.findFirst).mockResolvedValue(mockProject as any);
    vi.mocked(prisma.room.count).mockResolvedValue(2);
    vi.mocked(prisma.room.create).mockResolvedValue({ id: "room-1", name: "Kuchnia", type: "INNE", order: 2 } as any);

    const res = await POST(makeRequest("POST", { projectId: "proj-1", name: "Kuchnia" }));
    expect(res.status).toBe(201);
    expect(prisma.room.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ name: "Kuchnia", type: "INNE", order: 2 }),
      })
    );
  });

  it("tworzy pomieszczenie z podanym typem i ikoną", async () => {
    vi.mocked(auth).mockResolvedValue(SESSION as any);
    vi.mocked(prisma.project.findFirst).mockResolvedValue(mockProject as any);
    vi.mocked(prisma.room.count).mockResolvedValue(0);
    vi.mocked(prisma.room.create).mockResolvedValue({ id: "room-2", name: "Salon", type: "SALON" } as any);

    const res = await POST(makeRequest("POST", { projectId: "proj-1", name: "Salon", type: "SALON", icon: "sofa" }));
    expect(res.status).toBe(201);
    expect(prisma.room.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ type: "SALON", icon: "sofa" }),
      })
    );
  });
});

describe("PATCH /api/rooms/[id]", () => {
  it("zwraca 401 bez sesji", async () => {
    vi.mocked(auth).mockResolvedValue(null);
    const res = await PATCH(makeRequest("PATCH", { name: "Nowy" }), makeParams({ id: "room-1" }));
    expect(res.status).toBe(401);
  });

  it("zwraca 403 gdy pomieszczenie nie należy do użytkownika", async () => {
    vi.mocked(auth).mockResolvedValue(SESSION as any);
    vi.mocked(prisma.room.findUnique).mockResolvedValue(null);
    const res = await PATCH(makeRequest("PATCH", { name: "Nowy" }), makeParams({ id: "room-1" }));
    expect(res.status).toBe(403);
  });

  it("aktualizuje pomieszczenie", async () => {
    vi.mocked(auth).mockResolvedValue(SESSION as any);
    vi.mocked(prisma.room.findUnique).mockResolvedValue(mockRoom as any);
    vi.mocked(prisma.room.update).mockResolvedValue({ ...mockRoom, name: "Nowy Salon" } as any);

    const res = await PATCH(makeRequest("PATCH", { name: "Nowy Salon" }), makeParams({ id: "room-1" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.name).toBe("Nowy Salon");
  });
});

describe("DELETE /api/rooms/[id]", () => {
  it("zwraca 401 bez sesji", async () => {
    vi.mocked(auth).mockResolvedValue(null);
    const res = await DELETE(makeRequest("DELETE"), makeParams({ id: "room-1" }));
    expect(res.status).toBe(401);
  });

  it("zwraca 403 gdy pomieszczenie nie należy do użytkownika", async () => {
    vi.mocked(auth).mockResolvedValue(SESSION as any);
    vi.mocked(prisma.room.findUnique).mockResolvedValue({ ...mockRoom, project: { userId: "other-user" } } as any);
    const res = await DELETE(makeRequest("DELETE"), makeParams({ id: "room-1" }));
    expect(res.status).toBe(403);
  });

  it("usuwa pomieszczenie", async () => {
    vi.mocked(auth).mockResolvedValue(SESSION as any);
    vi.mocked(prisma.room.findUnique).mockResolvedValue(mockRoom as any);
    vi.mocked(prisma.room.delete).mockResolvedValue(mockRoom as any);

    const res = await DELETE(makeRequest("DELETE"), makeParams({ id: "room-1" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });
});
