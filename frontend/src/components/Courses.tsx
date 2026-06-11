import { useEffect, useState } from "react";
import { getCourses, addCourse, deleteCourse, updateCourse } from "../services/courseService";
import { useAuth } from "../context/AuthContext";
import { useCrud } from "../hooks/useCrud";
import type { Course } from "../types";
import CrudList from "./CrudList";
import CrudModal from "./CrudModal";

export default function Courses() {
    const { token } = useAuth();
    const [editForm, setEditForm] = useState<Partial<Course>>({});

    const {
        items: courses,
        selectedItem: selectedCourse,
        setSelectedItem: setSelectedCourse,
        addItem,
        updateItem,
        deleteItem
    } = useCrud<Course>({
        token,
        getAll: getCourses,
        create: addCourse,
        update: updateCourse,
        remove: deleteCourse
    });

    useEffect(() => {
        if (selectedCourse) {
            setEditForm({
                language: selectedCourse.language,
                level: selectedCourse.level,
                material: selectedCourse.material
            });
        }
    }, [selectedCourse]);

    async function handleAddCourse() {
        if (!token) return;

        const title = prompt("Title?");
        const language = prompt("Language?");
        const level = prompt("Level?");
        const material = prompt("Material?");

        if (!title || !language || !level || !material) return;

        try {
            await addItem({
                title: `${title}`,
                language: `${language}`,
                level: `${level}`,
                material: `${material}`
            });
        } catch (err) {
            console.error(err);
            alert(err);
        }
    }

    async function handleDeleteCourse(courseId: number) {
        if (!token) return;

        try {
            await deleteItem(courseId);
            //console.log(data);
        } catch (err) {
            console.error(err);
            alert(err);
        }
    }

    async function handleUpdateCourse(courseId: number) {
        if (!token || !editForm) return;

        try {
            await updateItem(courseId, editForm);
            setSelectedCourse(null);
        } catch (err) {
            console.error(err);
            alert(err);
        }
    }

    return (
        <div className="flex flex-col flex-1 min-h-0">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-xl font-bold">Courses</h1>

                <button
                    onClick={handleAddCourse}
                    className="bg-indigo-600 text-white px-3 py-1 rounded cursor-pointer hover:bg-indigo-400"
                >
                    Add
                </button>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto">
                <CrudList<Course>
                    items={courses}
                    getKey={(u) => u.id}
                    renderLabel={(u) =>
                        `${u.title} ${u.level}`
                    }
                    onEdit={setSelectedCourse}
                    onDelete={handleDeleteCourse}
                />
            </div>
            <CrudModal
                open={!!selectedCourse}
                title={`${selectedCourse?.title} ${selectedCourse?.level}`}
                onClose={() => setSelectedCourse(null)}
                onSave={() =>
                    handleUpdateCourse(selectedCourse!.id)
                }
            >
                <p className="flex justify-between items-center mb-2">
                    <strong>Language</strong>
                    <select
                        value={editForm.language || ""}
                        onChange={(e) =>
                            setEditForm(prev => ({ ...prev, language: e.target.value }))
                        }
                        className="border border-gray-200 rounded p-1 w-64"
                    >
                        <option value="English">English</option>
                        <option value="Finnish">Finnish</option>
                        <option value="Swedish">Swedish</option>
                        <option value="Russian">Russian</option>
                        <option value="German">German</option>
                        <option value="French">French</option>
                    </select>
                </p>
                <p className="flex justify-between items-center mb-2">
                    <strong>Level</strong>
                    <select
                        value={editForm.level || ""}
                        onChange={(e) =>
                            setEditForm(prev => ({ ...prev, level: e.target.value }))
                        }
                        className="border border-gray-200 rounded p-1 w-64"
                    >
                        <option value="A1">A1</option>
                        <option value="A2">A2</option>
                        <option value="B1">B1</option>
                        <option value="B2">B2</option>
                        <option value="C1">C1</option>
                        <option value="C2">C2</option>
                    </select>
                </p>
                <p className="flex justify-between items-center mb-2">
                    <strong>Material</strong>
                    <textarea
                        value={editForm.material || ""}
                        onChange={(e) =>
                            setEditForm(prev => ({ ...prev, material: e.target.value }))
                        }
                        className="border border-gray-200 rounded p-1 w-64"
                    />
                </p>
            </CrudModal>
        </div>
    );
}