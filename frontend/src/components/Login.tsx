import { useEffect, useState } from "react";
import Home from "./Home.tsx";

export type User = {
    id: number;
    firstName: string;
    secondName: string;
    email: string;
    role: string;
};

type AuthState = {
    token: string;
    user: User;
};

const AUTH_STORAGE_KEY = "auth";

function readStoredAuth() {
    if (typeof window === "undefined") {
        return null;
    }

    const storedAuth = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!storedAuth) {
        return null;
    }

    try {
        return JSON.parse(storedAuth) as AuthState;
    } catch {
        window.localStorage.removeItem(AUTH_STORAGE_KEY);
        return null;
    }
}

function Login() {
    const [users, setUsers] = useState<User[]>([]);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [auth, setAuth] = useState<AuthState | null>(() => readStoredAuth());
    const loggedIn = auth?.user ?? null;

    // Fetch all users
    const fetchUsers = async () => {
        try {
            if (!auth?.token) {
                return;
            }

            const res = await fetch("http://localhost:3000/users", {
                headers: {
                    Authorization: `Bearer ${auth.token}`,
                },
            });

            if (!res.ok) {
                throw new Error(await res.text());
            }

            const data = await res.json();
            setUsers(data);
        } catch (err) {
            console.error(err);
        }
    };

    // Login functions
    const handleLogin = async () => {
        if (!email || !password) return alert("Fill email and password!");
        try {
            const res = await fetch("http://localhost:3000/users/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            if (!res.ok) throw new Error(await res.text());
            const data = await res.json();
            const nextAuth = {
                token: data.token,
                user: data.user,
            };

            setAuth(nextAuth);
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextAuth));
            await fetchUsers();
            setEmail("");
            setPassword("");
        } catch (err) {
            alert("Login failed: " + err);
        }
    };

    useEffect(() => {
        if (auth?.token) {
            void fetchUsers();
        }
    }, [auth]);

    return (
        <div className="p-8 font-sans min-h-screen">
            <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">School Management System</h1>
            {!loggedIn && (
                <div className="max-w-md mx-auto bg-white p-6 rounded-lg border border-gray-300">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-700">Login</h2>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault(); // prevent page reload
                            handleLogin();
                        }}
                    >
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full mb-4 px-4 py-2 border border-gray-300 rounded focus:outline-none"
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full mb-4 px-4 py-2 border border-gray-300 rounded focus:outline-none"
                        />
                        <button
                            type="submit"
                            className="w-full bg-blue-500 text-white font-semibold py-2 rounded"
                        >
                            Login
                        </button>
                    </form>
                </div>
            )}

            {(loggedIn) && (
                <div className="max-w-4xl mx-auto mt-6">
                    <Home
                        loggedIn={loggedIn}
                        users={users}
                        token={auth?.token ?? ""}
                        canManageUsers={loggedIn.role === "instructor"}
                        onLogout={() => {
                            setAuth(null);
                            localStorage.removeItem(AUTH_STORAGE_KEY);
                        }}
                        onUserDeleted={(id: number) => {
                            setUsers((currentUsers) =>
                                currentUsers.filter((user) => user.id !== id)
                            );
                        }}
                    />
                </div>
            )}
        </div>
    );
}

export default Login;