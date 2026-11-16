import type { Request } from "express";

// The defaults and bounds match the Page and Limit parameters in openapi.yaml.
// The validator has already rejected anything outside them, so these only fill
// in what was left out.
export const DEFAULT_LIMIT = 25;

export type PageArgs = { page: number; limit: number; skip: number; take: number };

/** The page a list request asks for, as Prisma's skip and take. */
export function pageArgs(req: Request): PageArgs {
  const page = queryInt(req.query.page) ?? 1;
  const limit = queryInt(req.query.limit) ?? DEFAULT_LIMIT;
  return { page, limit, skip: (page - 1) * limit, take: limit };
}

/** The meta a list response carries next to its data. */
export function pageMeta({ page, limit }: PageArgs, total: number) {
  return { total, page, limit };
}

/** A query string param, or undefined when it is missing or empty. */
export function queryString(value: unknown): string | undefined {
  return typeof value === "string" && value !== "" ? value : undefined;
}

/**
 * An integer query param, or undefined when it is missing. Express 5 keeps query
 * values as strings; the validator may or may not have coerced them.
 */
export function queryInt(value: unknown): number | undefined {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value !== "") return Number(value);
  return undefined;
}
