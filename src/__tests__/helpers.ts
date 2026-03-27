import { NextRequest } from "next/server";

export function makeRequest(
  method: string,
  body?: object,
  headers?: Record<string, string>
): NextRequest {
  return new NextRequest("http://localhost:3000/api/test", {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });
}

export function makeParams<T extends Record<string, string>>(params: T): { params: Promise<T> } {
  return { params: Promise.resolve(params) };
}

export const SESSION = { user: { id: "user-1", email: "test@test.com" } };
