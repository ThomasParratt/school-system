import { useEffect } from "react";
import type { ListVariant, PageMeta } from "../../types";

type ListControlsProps = {
    meta: PageMeta | null;
    page: number;
    onPageChange: (page: number) => void;
    variant?: ListVariant;
};

/**
 * Previous/next buttons for a paged list: under it on a tab, in the header row of a
 * dashboard box. Hidden while everything fits on one page.
 */
export function Pager({ meta, page, onPageChange, variant = "full" }: ListControlsProps) {
    const lastPage = meta ? Math.max(1, Math.ceil(meta.total / meta.limit)) : 1;

    // Deleting the last row of the last page leaves the list past its end; step back.
    useEffect(() => {
        if (page > lastPage) onPageChange(lastPage);
    }, [page, lastPage, onPageChange]);

    if (!meta || lastPage <= 1) return null;

    const compact = variant === "compact";
    const button = `${compact ? "px-1.5" : "px-2"} py-0.5 rounded border border-gray-300 cursor-pointer hover:bg-gray-200 disabled:opacity-40 disabled:cursor-default disabled:hover:bg-transparent`;

    return (
        <div className={compact ? "flex items-center gap-1 text-sm" : "flex justify-between items-center pt-2 text-sm"}>
            <button
                type="button"
                className={button}
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
                aria-label="Previous page"
            >
                {compact ? "‹" : "‹ Prev"}
            </button>
            <span>
                {compact
                    ? `${Math.min(page, lastPage)} / ${lastPage}`
                    : `Page ${Math.min(page, lastPage)} of ${lastPage} · ${meta.total} total`}
            </span>
            <button
                type="button"
                className={button}
                disabled={page >= lastPage}
                onClick={() => onPageChange(page + 1)}
                aria-label="Next page"
            >
                {compact ? "›" : "Next ›"}
            </button>
        </div>
    );
}

type SearchBoxProps = {
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    variant?: ListVariant;
};

export function SearchBox({ value, onChange, placeholder, variant = "full" }: SearchBoxProps) {
    const size = variant === "compact" ? "px-1 py-0.5 mb-2 text-sm" : "p-1 mb-3";
    return (
        <input
            type="search"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            maxLength={100}
            className={`border border-gray-300 rounded w-full bg-white ${size}`}
        />
    );
}

type ListHeaderProps = {
    title: string;
    onAdd: () => void;
    search: string;
    onSearchChange: (value: string) => void;
    searchPlaceholder: string;
    variant?: ListVariant;
    /** The compact layout's Pager, shown in the header row to leave the box's height to the rows. */
    pager?: React.ReactNode;
    /** Controls shown beside the search box, such as filter dropdowns. */
    filters?: React.ReactNode;
};

/** Title, Add button and search box above an admin list, sized for its layout. */
export function ListHeader({
    title,
    onAdd,
    search,
    onSearchChange,
    searchPlaceholder,
    variant = "full",
    pager,
    filters
}: ListHeaderProps) {
    const compact = variant === "compact";

    return (
        <>
            <div className={`flex justify-between items-center gap-2 ${compact ? "mb-2" : "mb-6"}`}>
                <h1 className={`font-bold ${compact ? "text-lg" : "text-xl"}`}>{title}</h1>

                <div className="flex items-center gap-3">
                    {pager}
                    <button
                        type="button"
                        onClick={onAdd}
                        className={`bg-indigo-600 text-white rounded cursor-pointer hover:bg-indigo-400 ${compact ? "px-2 py-0.5 text-sm" : "px-3 py-1"}`}
                    >
                        Add
                    </button>
                </div>
            </div>
            <div className="flex gap-2">
                <SearchBox
                    value={search}
                    onChange={onSearchChange}
                    placeholder={searchPlaceholder}
                    variant={variant}
                />
                {filters}
            </div>
        </>
    );
}
