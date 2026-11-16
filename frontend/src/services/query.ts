import type { PageMeta } from "../types";

/** A query string from the params that are set, e.g. "?role=student&page=2". */
export function toQueryString(query: Record<string, string | number | undefined>): string {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
        if (value !== undefined && value !== "") params.set(key, String(value));
    }
    const qs = params.toString();
    return qs ? `?${qs}` : "";
}

/**
 * Every row of a paged list, fetched 100 at a time. For pickers that need the whole
 * list; screens that show a list should page it instead.
 */
export async function fetchAllPages<T>(
    fetchPage: (page: number, limit: number) => Promise<{ data: T[]; meta: PageMeta }>
): Promise<T[]> {
    const limit = 100;
    const rows: T[] = [];
    for (let page = 1; ; page++) {
        const res = await fetchPage(page, limit);
        rows.push(...res.data);
        if (res.data.length < limit || rows.length >= res.meta.total) return rows;
    }
}
