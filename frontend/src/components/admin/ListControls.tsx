import { useEffect } from "react";
import type { PageMeta } from "../../types";

type ListControlsProps = {
    meta: PageMeta | null;
    page: number;
    onPageChange: (page: number) => void;
};

/** Previous/next buttons under a paged list. Hidden while everything fits on one page. */
export function Pager({ meta, page, onPageChange }: ListControlsProps) {
    const lastPage = meta ? Math.max(1, Math.ceil(meta.total / meta.limit)) : 1;

    // Deleting the last row of the last page leaves the list past its end; step back.
    useEffect(() => {
        if (page > lastPage) onPageChange(lastPage);
    }, [page, lastPage, onPageChange]);

    if (!meta || lastPage <= 1) return null;

    const button = "px-2 py-0.5 rounded border border-gray-300 cursor-pointer hover:bg-gray-200 disabled:opacity-40 disabled:cursor-default disabled:hover:bg-transparent";

    return (
        <div className="flex justify-between items-center pt-2 text-sm">
            <button
                type="button"
                className={button}
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
            >
                ‹ Prev
            </button>
            <span>
                Page {Math.min(page, lastPage)} of {lastPage} · {meta.total} total
            </span>
            <button
                type="button"
                className={button}
                disabled={page >= lastPage}
                onClick={() => onPageChange(page + 1)}
            >
                Next ›
            </button>
        </div>
    );
}

type SearchBoxProps = {
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
};

export function SearchBox({ value, onChange, placeholder }: SearchBoxProps) {
    return (
        <input
            type="search"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            maxLength={100}
            className="border border-gray-300 rounded p-1 mb-3 w-full bg-white"
        />
    );
}
