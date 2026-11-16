import { useCallback, useEffect, useState } from "react";
import type { PageMeta } from "../types";

interface CrudConfig<T, CreateBody, UpdateBody, Query> {
    token: string | null;

    /** Fetches the list. A paged endpoint also answers meta. */
    getAll: (
        token: string,
        query: Query
    ) => Promise<{ data: T[]; meta?: PageMeta }>;

    /** Passed to getAll; the list is fetched again whenever it changes. */
    query?: Query;

    create: (
        token: string,
        data: CreateBody
    ) => Promise<{ data: T }>;

    update: (
        token: string,
        id: number,
        data: UpdateBody
    ) => Promise<{ data: T }>;

    remove: (
        token: string,
        id: number
    ) => Promise<unknown>;
}

export function useCrud<
    T extends { id: number },
    CreateBody = Partial<T>,
    UpdateBody = CreateBody,
    Query = Record<string, never>
>({
    token,
    getAll,
    query,
    create,
    update,
    remove
}: CrudConfig<T, CreateBody, UpdateBody, Query>) {
    const [items, setItems] = useState<T[]>([]);
    const [meta, setMeta] = useState<PageMeta | null>(null);
    const [selectedItem, setSelectedItem] =
        useState<T | null>(null);

    // A key rather than the object, so a query rebuilt with the same values doesn't refetch.
    const queryKey = JSON.stringify(query ?? {});

    const refresh = useCallback(async () => {
        if (!token) return;

        const res = await getAll(token, JSON.parse(queryKey) as Query);
        setItems(res.data);
        setMeta(res.meta ?? null);
    }, [token, getAll, queryKey]);

    useEffect(() => {
        if (!token) return;

        // A reply that lands after the query has moved on (typing a search) is dropped.
        let stale = false;
        getAll(token, JSON.parse(queryKey) as Query)
            .then(res => {
                if (stale) return;
                setItems(res.data);
                setMeta(res.meta ?? null);
            })
            .catch(console.error);
        return () => { stale = true; };
    }, [token, getAll, queryKey]);

    // Each change fetches the list again rather than patching it, so a row lands on the
    // page and in the place the server's order puts it.
    async function addItem(
        data: CreateBody
    ) {
        if (!token) return;

        await create(token, data);
        await refresh();
    }

    async function updateItem(
        id: number,
        data: UpdateBody
    ) {
        if (!token) return;

        await update(token, id, data);
        await refresh();
    }

    async function deleteItem(
        id: number
    ) {
        if (!token) return;

        await remove(token, id);
        await refresh();
    }

    return {
        items,
        meta,
        refresh,
        selectedItem,
        setSelectedItem,
        addItem,
        updateItem,
        deleteItem
    };
}
