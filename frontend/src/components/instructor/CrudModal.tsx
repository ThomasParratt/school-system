type CrudModalProps = {
    open: boolean;
    title: string;
    onClose: () => void;
    onSave: () => void;
    children: React.ReactNode;
};

export default function CrudModal({
    open,
    title,
    onClose,
    onSave,
    children
}: CrudModalProps) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
            <div className="bg-white p-6 rounded shadow-lg w-[420px] relative" onClick={(e) => e.stopPropagation()}>
            
                <button
                    onClick={onClose}
                    className="absolute top-2 right-3 text-gray-500 hover:text-black"
                >
                    ✕
                </button>

                <h2 className="text-lg font-bold mb-4">
                    {title}
                </h2>

                <div className="space-y-3">
                    {children}
                </div>

                <div className="mt-4 flex justify-end">
                    <button
                        onClick={onSave}
                        className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-400"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}