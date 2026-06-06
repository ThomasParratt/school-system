import { useEffect, useState } from "react";
import { getUsers, addUser, deleteUser } from "../services/userService";
import { useAuth } from "../context/AuthContext";
import type { User } from "../types";
import bin from "../../dist/bin.svg";
import edit from "../../dist/edit.svg";

export default function Students() {
    const { token } = useAuth();
    const [users, setUsers] = useState<User[]>([]);;
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [selectedEdit, setSelectedEdit] = useState<User | null>(null);

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

    function handleNameClick(user: User) {
        setSelectedUser(user);
    }

    function handleEditClick(user: User) {
        setSelectedEdit(user);
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
                                <span 
                                    onClick={() => handleNameClick(u)}
                                    className="cursor-pointer hover:font-semibold"
                                >
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
            {selectedUser && (
                <div className="fixed inset-0 flex items-center justify-center">
                    <div className="bg-white p-6 rounded shadow-lg w-96 relative">
                        
                        <button
                            onClick={() => setSelectedUser(null)}
                            className="absolute top-2 right-3 text-gray-500 hover:text-black"
                        >
                            ✕
                        </button>

                        <h2 className="text-lg font-bold mb-4">
                            {selectedUser.firstName} {selectedUser.secondName}
                        </h2>
                        
                        <p className="mb-2"><strong>Email:</strong> {selectedUser.email}</p>
                        <p className="mb-2"><strong>Comments:</strong> {selectedUser.comments}</p>
                    </div>
                </div>
            )}
            {selectedEdit && (
                <div className="fixed inset-0 flex items-center justify-center">
                    <div className="bg-white p-6 rounded shadow-lg w-96 relative">
                        
                        <button
                            onClick={() => setSelectedEdit(null)}
                            className="absolute top-2 right-3 text-gray-500 hover:text-black"
                        >
                            ✕
                        </button>

                        <h2 className="text-lg font-bold mb-4">
                            {selectedEdit.firstName} {selectedEdit.secondName}
                        </h2>
                        
                        <p className="mb-2"><strong>Email:</strong> {selectedEdit.email}</p>
                        <p className="mb-2"><strong>Comments:</strong> {selectedEdit.comments}</p>
                    </div>
                </div>
            )}
        </div>
    );
}