import type { LoginResponse, ApiErrorResponse } from "../types.ts";

export async function login(email: string, password: string): Promise<LoginResponse> {
  const res = await fetch("http://localhost:3000/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const contentType = res.headers.get("content-type") ?? "";
    const errorMessage = contentType.includes("application/json")
        ? ((await res.json()) as ApiErrorResponse).error?.message ?? "Request failed"
        : await res.text();
    throw new Error(errorMessage);
  }

  return res.json();
}