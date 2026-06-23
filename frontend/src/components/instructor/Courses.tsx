import { useEffect, useState } from "react";
import { getCourses, addCourse, deleteCourse, updateCourse, enroll, unenroll, getCourseEnrollments } from "../../services/courseService";
import { useCrud } from "../../hooks/useCrud";
import type { Course } from "../../types";
import CrudList from "./CrudList";
import CrudModal from "./CrudModal";
import bin from "../../../dist/bin.svg";

export default function Courses({ token, users, courses, refreshCourses }) {
    const [editForm, setEditForm] = useState<Partial<Course>>({});
    const [selectedUserId, setSelectedUserId] = useState("");

    const {
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
            handleGetEnrollments(selectedCourse.id);
            setEditForm({
                title: selectedCourse.title,
                language: selectedCourse.language,
                level: selectedCourse.level,
                material: selectedCourse.material,
                enrollments: selectedCourse.enrollments ?? []
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
            await refreshCourses();
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
            await refreshCourses();
        } catch (err) {
            console.error(err);
            alert(err);
        }
    }

    async function handleUpdateCourse(courseId: number) {
        if (!token || !editForm) return;

        try {
            await updateItem(courseId, editForm);
            await refreshCourses();
            setSelectedCourse(null);
        } catch (err) {
            console.error(err);
            alert(err);
        }
    }

    async function handleEnroll(courseId: number, userId: number) {
        if (!token) return;

        try {
            await enroll(token, courseId, userId);

        } catch (err) {
            console.error(err);
            alert(err);
        }
    }

    async function handleGetEnrollments(courseId: number) {
        if (!token) return;

        try {
            const result = await getCourseEnrollments(token, courseId);
            setEditForm(prev => ({
                ...prev!,
                enrollments: result.data.map(e => e.user)
            }));
        } catch (err) {
            console.error(err);
            alert(err);
        }
    }

    async function handleUnenroll(courseId: number, studentId: number) {
        if (!token) return;

        try {
            await unenroll(token, courseId, studentId);

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
                onClose={() => setSelectedCourse(null)}
                onSave={() =>
                    handleUpdateCourse(selectedCourse!.id)
                }
            >
                <p className="flex justify-between items-center mb-2">
                    <strong>Course name</strong>
                    <input
                        value={editForm.title || ""}
                        onChange={(e) =>
                            setEditForm(prev => ({
                                ...prev!,
                                title: e.target.value
                            }))
                        }
                        className="border border-gray-200 rounded p-1 w-64"
                    />
                </p>
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
                <p className="flex justify-between items-center mb-3">
                    <strong>Material</strong>
                    <textarea
                        value={editForm.material || ""}
                        onChange={(e) =>
                            setEditForm(prev => ({ ...prev, material: e.target.value }))
                        }
                        className="border border-gray-200 rounded p-1 w-64"
                    />
                </p>

                <div className="mb-2">
                    <strong>Enrollments</strong>

                    {/* Add course */}
                    <div className="flex gap-2 mt-2 mb-2">
                        <select
                            value={selectedUserId}
                            onChange={(e) =>
                                setSelectedUserId(e.target.value)
                            }
                            className="border rounded p-1 flex-1"
                        >
                            <option value="">Select student</option>

                            {users
                                .filter(u => u.role === "student")
                                .map(user => (
                                <option
                                    key={user.id}
                                    value={user.id}
                                >
                                    {user.firstName}, {user.secondName}
                                </option>
                            ))}
                        </select>

                        <button
                            type="button"
                            onClick={() => {
                                const user = users.find(
                                    c =>
                                        c.id === Number(selectedUserId)
                                );

                                if (!user) return;

                                setEditForm(prev => ({
                                    ...prev!,
                                    enrollments: [
                                        ...(prev?.enrollments ?? []),
                                        user,
                                    ],
                                }));

                                handleEnroll(
                                    selectedCourse.id,
                                    Number(selectedUserId)
                                );

                                setSelectedUserId("");
                            }}
                        >
                            ➕
                        </button>
                    </div>

                    {editForm.enrollments?.map(user => (
                        <div
                            key={user.id}
                            className="flex justify-between items-center border-gray-200 rounded p-1 mb-1"
                        >
                            <span>{user.firstName}, {user.secondName}</span>

                            <button
                                type="button"
                                onClick={() => {
                                    setEditForm(prev => ({
                                        ...prev!,
                                        enrollments:
                                            prev?.enrollments?.filter(
                                                c => c.id !== user.id
                                            ) ?? [],
                                    }));

                                    handleUnenroll(selectedCourse.id, user.id);
                                }}
                            >
                                <img
                                    src={bin} alt="Delete" 
                                    className="w-5 h-5 cursor-pointer hover:opacity-70" 
                                />
                            </button>
                        </div>
                    ))}
                </div>
            </CrudModal>
        </div>
    );
}