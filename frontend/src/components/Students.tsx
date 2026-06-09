import { useEffect, useState } from "react";
import { getUsers, addUser, deleteUser, updateUser, getEnrollments } from "../services/userService";
import { getCourses, enroll, unenroll } from "../services/courseService";
import { useAuth } from "../context/AuthContext";
import type { User, Course, UserEnrollment } from "../types";
import bin from "../../dist/bin.svg";
import edit from "../../dist/edit.svg";

export default function Students() {
    const { token } = useAuth();
    const [users, setUsers] = useState<User[]>([]);;
    const [enrollments, setEnrollments] = useState<UserEnrollment[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [editForm, setEditForm] = useState<Partial<User> | null>(null);
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedCourseId, setSelectedCourseId] = useState("");

    useEffect(() => {
        if (!token) return;

        async function fetchUsers() {
        try {
            const data = await getUsers(token);
            //console.log(data);
            setUsers(data.data);
        } catch (err) {
            console.error(err);
        }
        }
        fetchUsers();
    }, [token]);

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
            const newUser: { data: User } = await addUser(token, {
                firstName: `${firstName}`,
                secondName: `${secondName}`,
                email: `${email}`,
                password: `${password}`,
                comments: `${comments}`
            });

            setUsers(prev => [...prev, newUser.data]);
        } catch (err) {
            console.error(err);
            alert(err);
        }
    }

    async function handleDeleteUser(userId: number) {
        if (!token) return;

        try {
            await deleteUser(token, userId);
            //console.log(data);
            setUsers(prev => prev.filter(u => u.id !== userId));
        } catch (err) {
            console.error(err);
            alert(err);
        }
    }

    function handleEditClick(user: User) {
        setSelectedUser(user);
    }

    async function handleUpdateUser(userId: number) {
        if (!token || !editForm) return;

        try {
            const updatedUser: { data: User } = await updateUser(token, userId, editForm);

            setUsers(prev =>
                prev.map(user =>
                    user.id === userId ? updatedUser.data : user
                )
            );

            setSelectedUser(updatedUser.data);
            setEditForm({
                email: updatedUser.data.email,
                comments: updatedUser.data.comments ?? ""
            });
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
            const enrollments: { data: UserEnrollment[] } = await getEnrollments(token, userId);
            //console.log(enrollments);
            setEnrollments(enrollments.data);
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
                <ol>
                    {[...users]
                        .filter(user => user.role === "student")
                        .sort((a, b) => a.secondName.localeCompare(b.secondName))
                        .map(u => (
                            <li
                                className="flex justify-between items-center mb-2"
                                key={u.id}
                            >
                                <span >
                                    {u.secondName}, {u.firstName}
                                </span>
                                <div className="flex items-center gap-3">
                                    <img 
                                        onClick={() => handleEditClick(u)}
                                        src={edit} alt="Edit" 
                                        className="w-5 h-5 cursor-pointer hover:opacity-70" 
                                    />
                                    <img 
                                        onClick={() => handleDeleteUser(u.id)}
                                        src={bin} alt="Delete" 
                                        className="w-5 h-5 cursor-pointer hover:opacity-70" 
                                    />
                                </div>
                            </li>
                        ))}
                </ol>
            </div>
            {selectedUser && editForm && (
                <div className="fixed inset-0 flex items-center justify-center">
                    <div className="bg-white p-6 rounded shadow-lg w-101 relative">
                        
                        <button
                            onClick={() => setSelectedUser(null)}
                            className="absolute top-2 right-3 text-gray-500 hover:text-black"
                        >
                            ✕
                        </button>

                        <h2 className="text-lg font-bold mb-4">
                            {selectedUser.firstName} {selectedUser.secondName}
                        </h2>
                        
                        <p className="flex justify-between items-center mb-2">
                            <strong>Email</strong>
                            <input
                                value={editForm.email || ""}
                                onChange={(e) =>
                                    setEditForm(prev => ({ ...prev, email: e.target.value }))
                                }
                                className="border border-gray-200 rounded p-1 w-64"
                            />
                        </p>
                        <p className="flex justify-between items-center mb-2">
                            <strong>Comments</strong>
                            <textarea
                                value={editForm.comments || ""}
                                onChange={(e) =>
                                    setEditForm(prev => ({ ...prev, comments: e.target.value }))
                                }
                                className="border border-gray-200 rounded p-1 w-64"
                            />
                        </p>
                        <div className="mb-2">
                            <strong>Enrollments</strong>
        
                            {enrollments.map(enrollment => (
                                <div
                                    key={enrollment.id}
                                    className="flex justify-between items-center border rounded p-1 mb-1"
                                >
                                    <span>{enrollment.course.title}</span>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEditForm(prev => ({
                                                ...prev!,
                                                enrollments:
                                                    prev?.enrollments?.filter(
                                                        c => c.id !== enrollment.id
                                                    ) ?? [],
                                            }));

                                            handleUnenroll(enrollment.courseId, enrollment.userId);
                                        }}
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}

                            <div className="flex gap-2 mt-2">
                                <select
                                    value={selectedCourseId}
                                    onChange={(e) => setSelectedCourseId(e.target.value)}
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
                                            c => c.id === Number(selectedCourseId)
                                        );

                                        if (!course) return;

                                        setEditForm(prev => ({
                                            ...prev!,
                                            enrollments: [
                                                ...(prev?.enrollments ?? []),
                                                course,
                                            ],
                                        }));
                                        //console.log(selectedUser.id);
                                        handleEnroll(Number(selectedCourseId), selectedUser.id);
                                    }}
                                >
                                    Add
                                </button>
                            </div>
                        </div>
                        <button
                            onClick={() => handleUpdateUser(selectedUser.id)}
                            className="mt-4 bg-indigo-600 text-white px-3 py-1 rounded cursor-pointer hover:bg-indigo-400"
                        >
                            Save changes
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}