import { useState } from "react";
import type { User } from "./Login"

type HomeProps = {
    loggedIn: User;
    users: User[];
    token: string;
    canManageUsers: boolean;
    onLogout: () => void;
    onUserDeleted: (id: number) => void;
};

function Home({ loggedIn, users, token, canManageUsers, onLogout, onUserDeleted }: HomeProps) {
    const [firstName, setFirstName] = useState("");
    const [secondName, setSecondName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [selectedAddRole, setSelectedAddRole] = useState<string | null>(null);
    const students = users.filter((user) => user.role === "student");

    const handleSignup = async () => {
        if (!firstName || !secondName || !email || !password) {
            return alert("Fill all fields!");
        }

        try {
            if (!canManageUsers) {
                return;
            }

            const res = await fetch("http://localhost:3000/users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ firstName, secondName, email, password }),
            });

            if (!res.ok) {
                throw new Error(await res.text());
            }

            alert(`${selectedAddRole} created successfully!`);
            setFirstName("");
            setSecondName("");
            setEmail("");
            setPassword("");
        } catch (err) {
            alert("Error: " + err);
        }
    };

    const deleteUser = async (id: number) => {
        if (!canManageUsers) {
            return;
        }

        const res = await fetch(`http://localhost:3000/users/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!res.ok) {
            throw new Error(await res.text());
        }

        onUserDeleted(id);
    };

    return (
        <div className="p-8 font-sans min-h-screen">
            <div className="max-w-4xl mx-auto p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold text-gray-700">
                        Welcome {loggedIn.firstName}
                    </h2>
                    <button
                        onClick={onLogout}
                        className="bg-gray-500 text-white px-4 py-2 rounded"
                    >
                        Logout
                    </button>
                </div>

                <div className="mt-4">
                    <h3 className="text-xl font-semibold mb-2 text-gray-700">Students</h3>
                    {canManageUsers ? (
                        selectedAddRole ? (
                            <>
                                <p className="mb-2 font-medium text-gray-700">
                                    {selectedAddRole} Details
                                </p>
                                <div className="flex flex-col gap-4 mb-4">
                                    <input
                                        placeholder="First name"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        className="px-4 py-2 border border-gray-300 rounded focus:outline-none"
                                    />
                                    <input
                                        placeholder="Second name"
                                        value={secondName}
                                        onChange={(e) => setSecondName(e.target.value)}
                                        className="px-4 py-2 border border-gray-300 rounded focus:outline-none"
                                    />
                                    <input
                                        placeholder="Email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="px-4 py-2 border border-gray-300 rounded focus:outline-none"
                                    />
                                    <input
                                        type="password"
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="px-4 py-2 border border-gray-300 rounded focus:outline-none"
                                    />
                                </div>
                                <div className="flex gap-4">
                                    <button
                                        onClick={handleSignup}
                                        className="flex-1 bg-blue-500 text-white py-2 rounded"
                                    >
                                        Add
                                    </button>
                                    <button
                                        onClick={() => setSelectedAddRole(null)}
                                        className="flex-1 bg-gray-300 text-gray-700 py-2 rounded"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="flex gap-4 mb-4">
                                <button
                                    onClick={() => setSelectedAddRole("Student")}
                                    className="bg-blue-500 text-white px-4 py-1 rounded"
                                >
                                    Add Student
                                </button>
                            </div>
                        )
                    ) : null}
                    {students.length === 0 ? (
                        <p className="text-gray-500">No students found.</p>
                    ) : (
                        <ul className="mb-6">
                            {students.map((user) => (
                                <li key={user.id} className="py-1">
                                    <div className="flex items-center gap-2">
                                        <span> {user.firstName} {user.secondName} </span>
                                        {canManageUsers && (
                                            <button
                                                onClick={() => deleteUser(user.id)}
                                                className="bg-red-500 text-white px-2 rounded"
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Home;
