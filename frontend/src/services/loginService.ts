import type { LoginResponse } from "../types.ts";
import { apiFetch } from "./http";

export function login(email: string, password: string): Promise<LoginResponse> {
  return apiFetch("/auth/login", { method: "POST", body: { email, password } });
}
