import bin from "../../../assets/bin.png";
import edit from "../../../assets/edit.png";

type CrudListProps<T> = {
    items: T[];
    getKey: (item: T) => number;
    renderLabel: (item: T) => React.ReactNode;
    onEdit: (item: T) => void;
    onDelete: (id: number) => void;
    /** Tighter rows for a dashboard box; useListQuery's ROW_PX assumes this spacing. */
    dense?: boolean;
};

export default function CrudList<T>({
    items,
    getKey,
    renderLabel,
    onEdit,
    onDelete,
    dense = false
}: CrudListProps<T>) {
    return (
        <ol>
            {items.map(item => (
                <li
                    key={getKey(item)}
                    className={`flex justify-between items-center gap-2 ${dense ? "mb-1" : "mb-2"}`}
                >
                    <span className="min-w-0 truncate">{renderLabel(item)}</span>

                    <div className="flex shrink-0 items-center gap-3">
                        <img 
                            onClick={() => onEdit(item)}
                            src={edit} alt="Edit" 
                            className="w-5 h-5 cursor-pointer hover:opacity-70" 
                        />

                        <img
                            onClick={() =>
                                onDelete(getKey(item))
                            }
                            src={bin} alt="Delete" 
                            className="w-5 h-5 cursor-pointer hover:opacity-70"
                        />
                    </div>
                </li>
            ))}
        </ol>
    );
}