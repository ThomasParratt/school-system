import { useEffect, useState } from "react";
import { getUsers, addUser, deleteUser } from "../services/userService";
import { useAuth } from "../context/AuthContext";
import type { User } from "../types";
import bin from "../../dist/bin.svg";

export default function Students() {
    const { token } = useAuth();
    const [users, setUsers] = useState<User[]>([]);;

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

        if (!firstName || !secondName) return;

        try {
            const newUser: { data: User } = await addUser(token, {
                firstName: `${firstName}`,
                secondName: `${secondName}`,
                email: `${email}`,
                password: `${password}`
            });

            setUsers(prev => [...prev, newUser.data]);
        } catch (err) {
            console.error(err);
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
                                <span>{u.secondName}, {u.firstName}</span>
                                <img 
                                    onClick={() => handleDeleteUser(u.id)}
                                    src={bin} alt="Delete" 
                                    className="w-5 h-5 cursor-pointer hover:opacity-70" 
                                />
                            </li>
                        ))}
                </ol>
            </div>
        </div>
    );
}