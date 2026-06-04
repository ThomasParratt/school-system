import { useEffect, useState } from "react";
import { getUsers } from "../services/userService";
import { useAuth } from "../context/AuthContext";

export default function Students() {
    const { token } = useAuth();
    const [users, setUsers] = useState([]);

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

    return (
        <div className="flex flex-col flex-1 min-h-0">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-xl font-bold">Students</h1>

                <button className="bg-indigo-600 text-white px-3 py-1 rounded">
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