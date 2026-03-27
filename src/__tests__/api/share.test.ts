import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/share/[token]/route";
import { makeRequest, makeParams } from "../helpers";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    project: { findUnique: vi.fn() },
  },
}));

import { prisma } from "@/lib/prisma";

const mockProject = {
  id: "proj-1",
  title: "Projekt Test",
  shareToken: "token-abc",
  sharePassword: null,
  shareExpiresAt: null,
  user: {
    name: "Projektant",
    allowDirectStatusChange: false,
    allowClientComments: true,
    allowClientAcceptance: true,
    requireClientEmail: false,
    hideCommentCount: false,
    clientWelcomeMessage: null,
    clientLogoUrl: null,
    accentColor: null,
    defaultRenderOrder: "asc",
    notifyClientOnStatusChange: true,
    notifyClientOnReply: true,
    allowClientVersionRestore: true,
    showProjectTitle: true,
  },
  rooms: [],
};

beforeEach(() => vi.clearAllMocks());

describe("GET /api/share/[token]", () => {
  it("zwraca 404 gdy token nie istnieje", async () => {
    vi.mocked(prisma.project.findUnique).mockResolvedValue(null);
    const res = await GET(makeRequest("GET"), makeParams({ token: "nieistniejacy" }));
    expect(res.status).toBe(404);
  });

  it("zwraca 410 gdy link wygasł", async () => {
    vi.mocked(prisma.project.findUnique).mockResolvedValue({
      ...mockProject,
      shareExpiresAt: new Date("2020-01-01"),
    } as any);

    const res = await GET(makeRequest("GET"), makeParams({ token: "token-abc" }));
    expect(res.status).toBe(410);
    const body = await res.json();
    expect(body.expired).toBe(true);
  });

  it("zwraca 401 gdy link wymaga hasła a nie podano hasła", async () => {
    vi.mocked(prisma.project.findUnique).mockResolvedValue({
      ...mockProject,
      sharePassword: "tajnehaslo",
    } as any);

    const res = await GET(makeRequest("GET"), makeParams({ token: "token-abc" }));
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.passwordRequired).toBe(true);
  });

  it("zwraca 401 gdy podano złe hasło", async () => {
    vi.mocked(prisma.project.findUnique).mockResolvedValue({
      ...mockProject,
      sharePassword: "tajnehaslo",
    } as any);

    const res = await GET(
      makeRequest("GET", undefined, { "x-share-password": "zlehaslo" }),
      makeParams({ token: "token-abc" })
    );
    expect(res.status).toBe(401);
  });

  it("zwraca 200 gdy podano poprawne hasło", async () => {
    vi.mocked(prisma.project.findUnique).mockResolvedValue({
      ...mockProject,
      sharePassword: "tajnehaslo",
    } as any);

    const res = await GET(
      makeRequest("GET", undefined, { "x-share-password": "tajnehaslo" }),
      makeParams({ token: "token-abc" })
    );
    expect(res.status).toBe(200);
  });

  it("zwraca 200 dla publicznego linku (bez hasła)", async () => {
    vi.mocked(prisma.project.findUnique).mockResolvedValue(mockProject as any);
    const res = await GET(makeRequest("GET"), makeParams({ token: "token-abc" }));
    expect(res.status).toBe(200);
  });

  it("nie zwraca sharePassword w odpowiedzi", async () => {
    vi.mocked(prisma.project.findUnique).mockResolvedValue({
      ...mockProject,
      sharePassword: "tajnehaslo",
    } as any);

    const res = await GET(
      makeRequest("GET", undefined, { "x-share-password": "tajnehaslo" }),
      makeParams({ token: "token-abc" })
    );

    const body = await res.json();
    expect(body).not.toHaveProperty("sharePassword");
    expect(body.hasPassword).toBe(true);
  });

  it("nie wygasa gdy shareExpiresAt jest w przyszłości", async () => {
    const future = new Date();
    future.setFullYear(future.getFullYear() + 1);

    vi.mocked(prisma.project.findUnique).mockResolvedValue({
      ...mockProject,
      shareExpiresAt: future,
    } as any);

    const res = await GET(makeRequest("GET"), makeParams({ token: "token-abc" }));
    expect(res.status).toBe(200);
  });

  it("zwraca designerName i ustawienia projektanta", async () => {
    vi.mocked(prisma.project.findUnique).mockResolvedValue(mockProject as any);
    const res = await GET(makeRequest("GET"), makeParams({ token: "token-abc" }));
    const body = await res.json();
    expect(body.designerName).toBe("Projektant");
    expect(body).toHaveProperty("allowClientComments");
    expect(body).not.toHaveProperty("user");
  });
});
