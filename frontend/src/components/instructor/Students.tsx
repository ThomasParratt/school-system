import { useEffect, useState } from "react";
import { getUsers, addUser, deleteUser, updateUser, getUserEnrollments } from "../../services/userService";
import { enroll, unenroll } from "../../services/courseService";
import { useCrud } from "../../hooks/useCrud";
import type { User } from "../../types";
import CrudList from "./CrudList";
import CrudModal from "./CrudModal";
import bin from "../../../dist/bin.svg";

export default function Students({ token, users, courses, refreshUsers }) {
    const [editForm, setEditForm] = useState<Partial<User>>({});
    const [selectedCourseId, setSelectedCourseId] = useState("");
    const [addForm, setAddForm] = useState<Partial<User>>({});
    const [add, setAdd] = useState(false);

    const {
        selectedItem: selectedUser,
        setSelectedItem: setSelectedUser,
        addItem,
        updateItem,
        deleteItem
    } = useCrud<User>({
        token,
        getAll: getUsers,
        create: addUser,
        update: updateUser,
        remove: deleteUser
    });

    const emptyUser : Partial<User> = {
        firstName: "",
        secondName: "",
        email: "",
        password: "",
        comments: ""
    }

    useEffect(() => {
        if (selectedUser) {
            handleGetEnrollments(selectedUser.id);
            setEditForm({
                firstName: selectedUser.firstName,
                secondName: selectedUser.secondName,
                email: selectedUser.email,
                comments: selectedUser.comments ?? "",
                enrollments: selectedUser.enrollments ?? []
            });
        }
    }, [selectedUser]);

    useEffect(() => {
        if (add) {
            setAddForm({
                firstName: emptyUser.firstName,
                secondName: emptyUser.secondName,
                email: emptyUser.email,
                password: emptyUser.password,
                comments: emptyUser.comments ?? ""
            });
        }
    }, [add]);

    async function handleAddUser() {
        if (!token || !addForm) return;
        try {
            await addItem(addForm);
            await refreshUsers();
            setAdd(false);
        } catch (err) {
            console.error(err);
            alert(err);
        }
    }

    async function handleDeleteUser(userId: number) {
        if (!token) return;

        try {
            await deleteItem(userId);
            await refreshUsers();
        } catch (err) {
            console.error(err);
            alert(err);
        }
    }

    async function handleUpdateUser(userId: number) {
        if (!token || !editForm) return;

        try {
            await updateItem(userId, editForm);
            await refreshUsers();
            setSelectedUser(null);
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

    async function handleGetEnrollments(userId: number) {
        if (!token) return;

        try {
            const result = await getUserEnrollments(token, userId);
            setEditForm(prev => ({
                ...prev!,
                enrollments: result.data.map(e => e.course)
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
                <h1 className="text-xl font-bold">Students</h1>

                <button
                    onClick={() => setAdd(true)}
                    className="bg-indigo-600 text-white px-3 py-1 rounded cursor-pointer hover:bg-indigo-400"
                >
                    Add
                </button>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto">
                <CrudList<User>
                    items={users.filter(u => u.role === "student")}
                    getKey={(u) => u.id}
                    renderLabel={(u) =>
                        `${u.secondName}, ${u.firstName}`
                    }
                    onEdit={setSelectedUser}
                    onDelete={handleDeleteUser}
                />
            </div>
            <CrudModal
                open={!!add}
                onClose={() => setAdd(false)}
                onSave={() =>
                    handleAddUser()
                }
            >
                {/* First name */}
                <p className="flex justify-between items-center mb-2">
                    <strong>First name</strong>
                    <input
                        value={addForm.firstName || ""}
                        onChange={(e) =>
                            setAddForm(prev => ({
                                ...prev!,
                                firstName: e.target.value
                            }))
                        }
                        className="border border-gray-200 rounded p-1 w-64"
                    />
                </p>

                {/* Last name */}
                <p className="flex justify-between items-center mb-2">
                    <strong>Last name</strong>
                    <input
                        value={addForm.secondName || ""}
                        onChange={(e) =>
                            setAddForm(prev => ({
                                ...prev!,
                                secondName: e.target.value
                            }))
                        }
                        className="border border-gray-200 rounded p-1 w-64"
                    />
                </p>

                {/* Email */}
                <p className="flex justify-between items-center mb-2">
                    <strong>Email</strong>
                    <input
                        value={addForm.email || ""}
                        onChange={(e) =>
                            setAddForm(prev => ({
                                ...prev!,
                                email: e.target.value
                            }))
                        }
                        className="border border-gray-200 rounded p-1 w-64"
                    />
                </p>

                {/* Password */}
                <p className="flex justify-between items-center mb-2">
                    <strong>Password</strong>
                    <input
                        type="password"
                        value={addForm.password || ""}
                        onChange={(e) =>
                            setAddForm(prev => ({
                                ...prev!,
                                password: e.target.value
                            }))
                        }
                        className="border border-gray-200 rounded p-1 w-64"
                    />
                </p>

                {/* Comments */}
                <p className="flex justify-between items-center mb-3">
                    <strong>Comments</strong>
                    <textarea
                        value={addForm.comments || ""}
                        onChange={(e) =>
                            setAddForm(prev => ({
                                ...prev!,
                                comments: e.target.value
                            }))
                        }
                        className="border border-gray-200 rounded p-1 w-64"
                    />
                </p>
            </CrudModal>
            <CrudModal
                open={!!selectedUser}
                onClose={() => setSelectedUser(null)}
                onSave={() =>
                    handleUpdateUser(selectedUser!.id)
                }
            >
                {/* First name */}
                <p className="flex justify-between items-center mb-2">
                    <strong>First name</strong>
                    <input
                        value={editForm.firstName || ""}
                        onChange={(e) =>
                            setEditForm(prev => ({
                                ...prev!,
                                firstName: e.target.value
                            }))
                        }
                        className="border border-gray-200 rounded p-1 w-64"
                    />
                </p>

                {/* Last name */}
                <p className="flex justify-between items-center mb-2">
                    <strong>Last name</strong>
                    <input
                        value={editForm.secondName || ""}
                        onChange={(e) =>
                            setEditForm(prev => ({
                                ...prev!,
                                secondName: e.target.value
                            }))
                        }
                        className="border border-gray-200 rounded p-1 w-64"
                    />
                </p>

                {/* Email */}
                <p className="flex justify-between items-center mb-2">
                    <strong>Email</strong>
                    <input
                        value={editForm.email || ""}
                        onChange={(e) =>
                            setEditForm(prev => ({
                                ...prev!,
                                email: e.target.value
                            }))
                        }
                        className="border border-gray-200 rounded p-1 w-64"
                    />
                </p>

                {/* Comments */}
                <p className="flex justify-between items-center mb-3">
                    <strong>Comments</strong>
                    <textarea
                        value={editForm.comments || ""}
                        onChange={(e) =>
                            setEditForm(prev => ({
                                ...prev!,
                                comments: e.target.value
                            }))
                        }
                        className="border border-gray-200 rounded p-1 w-64"
                    />
                </p>

                {/* Enrollments */}
                <div className="mb-2">
                    <strong>Enrollments</strong>

                    {/* Add course */}
                    <div className="flex gap-2 mt-2 mb-2">
                        <select
                            value={selectedCourseId}
                            onChange={(e) =>
                                setSelectedCourseId(e.target.value)
                            }
                            className="border rounded p-1 flex-1"
                        >
                            <option value="">Select course</option>

                            {courses.map(course => (
                                <option
                                    key={course.id}
                                    value={course.id}
                                >
                                    {course.title}
                                </option>
                            ))}
                        </select>

                        <button
                            type="button"
                            onClick={() => {
                                const course = courses.find(
                                    c =>
                                        c.id === Number(selectedCourseId)
                                );

                                if (!course) return;

                                setEditForm(prev => ({
                                    ...prev!,
                                    enrollments: [
                                        ...(prev?.enrollments ?? []),
                                        course,
                                    ],
                                }));

                                handleEnroll(
                                    Number(selectedCourseId),
                                    selectedUser.id
                                );

                                setSelectedCourseId("");
                            }}
                        >
                            ➕
                        </button>
                    </div>

                    {editForm.enrollments?.map(course => (
                        <div
                            key={course.id}
                            className="flex justify-between items-center border-gray-200 rounded p-1 mb-1"
                        >
                            <span>{course.title}</span>

                            <button
                                type="button"
                                onClick={() => {
                                    setEditForm(prev => ({
                                        ...prev!,
                                        enrollments:
                                            prev?.enrollments?.filter(
                                                c => c.id !== course.id
                                            ) ?? [],
                                    }));

                                    handleUnenroll(course.id, selectedUser.id);
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