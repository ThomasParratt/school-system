import { useEffect, useState } from "react";
import { getUsers, addUser } from "../services/userService";
import { useAuth } from "../context/AuthContext";
import type { User } from "../types";

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

    return (
        <div className="flex flex-col flex-1 min-h-0">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-xl font-bold">Students</h1>

                <button
                    onClick={handleAddUser}
                    className="bg-indigo-600 text-white px-3 py-1 rounded"
                >
                    Add
                </button>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto">
                <ul>
                    {users.map(u => (
                        <li key={u.id}>{u.firstName} {u.secondName}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
}