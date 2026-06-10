import { useEffect, useState } from "react";

interface CrudConfig<T> {
    token: string | null;

    getAll: (
        token: string
    ) => Promise<{ data: T[] }>;

    create: (
        token: string,
        data: Partial<T>
    ) => Promise<{ data: T }>;

    update: (
        token: string,
        id: number,
        data: Partial<T>
    ) => Promise<{ data: T }>;

    remove: (
        token: string,
        id: number
    ) => Promise<void>;
}

export function useCrud<
    T extends { id: number }
>({
    token,
    getAll,
    create,
    update,
    remove
}: CrudConfig<T>) {
    const [items, setItems] = useState<T[]>([]);
    const [selectedItem, setSelectedItem] =
        useState<T | null>(null);

    useEffect(() => {
        if (!token) return;

        getAll(token)
            .then(res => setItems(res.data))
            .catch(console.error);
    }, [token]);

    async function addItem(
        data: Partial<T>
    ) {
        if (!token) return;

        const res = await create(token, data);

        setItems(prev => [
            ...prev,
            res.data
        ]);
    }

    async function updateItem(
        id: number,
        data: Partial<T>
    ) {
        if (!token) return;

        const res = await update(
            token,
            id,
            data
        );

        setItems(prev =>
            prev.map(item =>
                item.id === id
                    ? res.data
                    : item
            )
        );
    }

    async function deleteItem(
        id: number
    ) {
        if (!token) return;

        await remove(token, id);

        setItems(prev =>
            prev.filter(
                item => item.id !== id
            )
        );
    }

    return {
        items,
        setItems,
        selectedItem,
        setSelectedItem,
        addItem,
        updateItem,
        deleteItem
    };
}