import bin from "../../../dist/bin.svg";
import edit from "../../../dist/edit.svg";

type CrudListProps<T> = {
    items: T[];
    getKey: (item: T) => number;
    renderLabel: (item: T) => React.ReactNode;
    onEdit: (item: T) => void;
    onDelete: (id: number) => void;
};

export default function CrudList<T>({
    items,
    getKey,
    renderLabel,
    onEdit,
    onDelete
}: CrudListProps<T>) {
    return (
        <ol>
            {items.map(item => (
                <li
                    key={getKey(item)}
                    className="flex justify-between items-center mb-2"
                >
                    <span>{renderLabel(item)}</span>

                    <div className="flex items-center gap-3">
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