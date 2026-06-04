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
            console.error("Failed to fetch users:", err);
        }
        }

        fetchUsers();
    }, [token]);

    return (
        <div className="flex flex-col flex-1 min-h-0">
            <h1 className="text-xl font-bold mb-4">Students</h1>
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