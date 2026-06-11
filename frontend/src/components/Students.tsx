import { useEffect, useState } from "react";
import { getUsers, addUser, deleteUser, updateUser, getEnrollments } from "../services/userService";
import { getCourses, enroll, unenroll } from "../services/courseService";
import { useAuth } from "../context/AuthContext";
import { useCrud } from "../hooks/useCrud";
import type { User, Course, UserEnrollment } from "../types";
import CrudList from "./CrudList";
import CrudModal from "./CrudModal";

export default function Students() {
    const { token } = useAuth();
    const [editForm, setEditForm] = useState<Partial<User>>({});
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedCourseId, setSelectedCourseId] = useState("");

    const {
        items: users,
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

    useEffect(() => {
        if (!token) return;

        async function fetchCourses() {
        try {
            const data = await getCourses(token);
            //console.log(data);
            setCourses(data.data);
        } catch (err) {
            console.error(err);
        }
        }
        fetchCourses();
    }, [token]);

    useEffect(() => {
        if (selectedUser) {
            handleGetEnrollments(selectedUser.id);
            setEditForm({
                email: selectedUser.email,
                comments: selectedUser.comments ?? "",
                enrollments: selectedUser.enrollments ?? []
            });
        }
    }, [selectedUser]);

    async function handleAddUser() {
        if (!token) return;

        const firstName = prompt("First name?");
        const secondName = prompt("Second name?");
        const email = prompt("Email?");
        const password = prompt("Password?");
        const comments = prompt("Comments?");

        if (!firstName || !secondName || !email || !password) return;

        try {
            await addItem({
                firstName: `${firstName}`,
                secondName: `${secondName}`,
                email: `${email}`,
                password: `${password}`,
                comments: `${comments}`
            });
        } catch (err) {
            console.error(err);
            alert(err);
        }
    }

    async function handleDeleteUser(userId: number) {
        if (!token) return;

        try {
            await deleteItem(userId);
        } catch (err) {
            console.error(err);
            alert(err);
        }
    }

    async function handleUpdateUser(userId: number) {
        if (!token || !editForm) return;

        try {
            await updateItem(userId, editForm);
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
            const result = await getEnrollments(token, userId);
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
                    onClick={handleAddUser}
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
                open={!!selectedUser}
                title={`${selectedUser?.firstName} ${selectedUser?.secondName}`}
                onClose={() => setSelectedUser(null)}
                onSave={() =>
                    handleUpdateUser(selectedUser!.id)
                }
            >
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
                <p className="flex justify-between items-center mb-2">
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

                    {editForm.enrollments?.map(course => (
                        <div
                            key={course.id}
                            className="flex justify-between items-center border rounded p-1 mb-1"
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
                                Remove
                            </button>
                        </div>
                    ))}

                    {/* Add course */}
                    <div className="flex gap-2 mt-2">
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
                            Add
                        </button>
                    </div>
                </div>
            </CrudModal>
        </div>
    );
}