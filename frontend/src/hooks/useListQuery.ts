import { useEffect, useState } from "react";

const SEARCH_DELAY_MS = 300;

/**
 * Page and search state for a paged list. The search waits until typing pauses, and a
 * new search goes back to page 1. Pass `query` to useCrud and the rest to ListControls.
 */
export function useListQuery<Filters extends object>(filters: Filters, limit = 25) {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [q, setQ] = useState("");

    useEffect(() => {
        // Runs only once the search text has changed, so going back to page 1 is always right.
        const timer = setTimeout(() => {
            setQ(search.trim());
            setPage(1);
        }, SEARCH_DELAY_MS);
        return () => clearTimeout(timer);
    }, [search]);

    // An empty search is left out: the API takes no q, not an empty one.
    const query = { ...filters, page, limit, ...(q ? { q } : {}) };

    return { query, page, setPage, search, setSearch };
}
