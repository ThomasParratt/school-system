import { useEffect, useState } from "react";
import type { ListVariant } from "../types";

const SEARCH_DELAY_MS = 300;

/** Rows per page on a list's own tab. */
const FULL_PAGE_SIZE = 25;

/** Rows per page in a dashboard box until its height has been measured. */
const COMPACT_FALLBACK_SIZE = 4;

/** Height of one dense CrudList row: a 24px line plus its mb-1 margin. */
const ROW_PX = 28;

/**
 * Page and search state for a paged list. The search waits until typing pauses, and a
 * new search or a change to `filters` goes back to page 1. Pass `query` to useCrud and the rest to ListControls.
 *
 * In the compact layout a page holds as many rows as fit the list's box, so attach
 * `listRef` to the element the rows scroll in. The box's height comes from the
 * dashboard, not from the rows, so the measurement doesn't feed back on itself.
 */
export function useListQuery<Filters extends object>(filters: Filters, variant: ListVariant = "full") {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [q, setQ] = useState("");
    const [fitRows, setFitRows] = useState<number | null>(null);
    // A callback ref kept in state, so the observer below follows the element it's given.
    const [listEl, listRef] = useState<HTMLDivElement | null>(null);

    // Compared by value, since callers build `filters` afresh on every render. Resetting
    // during render, not in an effect, means the old page is never fetched with new filters.
    const filtersKey = JSON.stringify(filters);
    const [prevFiltersKey, setPrevFiltersKey] = useState(filtersKey);
    if (filtersKey !== prevFiltersKey) {
        setPrevFiltersKey(filtersKey);
        setPage(1);
    }

    useEffect(() => {
        // Runs only once the search text has changed, so going back to page 1 is always right.
        const timer = setTimeout(() => {
            setQ(search.trim());
            setPage(1);
        }, SEARCH_DELAY_MS);
        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        const el = listEl;
        if (variant !== "compact" || !el) return;

        // Setting the same count again doesn't re-render, so only a resize that changes
        // the number of rows refetches.
        const observer = new ResizeObserver(() => {
            setFitRows(Math.max(1, Math.floor(el.clientHeight / ROW_PX)));
        });
        observer.observe(el);
        return () => observer.disconnect();
    }, [variant, listEl]);

    const limit = variant === "compact" ? fitRows ?? COMPACT_FALLBACK_SIZE : FULL_PAGE_SIZE;

    // An empty search is left out: the API takes no q, not an empty one.
    const query = { ...filters, page, limit, ...(q ? { q } : {}) };

    return { query, page, setPage, search, setSearch, listRef };
}
