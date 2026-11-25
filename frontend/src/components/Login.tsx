import { useState } from "react";
import { login } from "../services/loginService.ts";
import { useAuth } from "../context/useAuth.ts";
import AdminDash from "./admin/AdminDash.tsx";
import AdminTabs from "./admin/AdminTabs.tsx";
import InstructorDash from "./instructor/InstructorDash.tsx";
import StudentDash from "./student/StudentDash.tsx";

function Login() {
    const { user, loginUser, logout } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async () => {
        if (!email || !password) {
            setError("Fill email and password!");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await login(email, password);

            const loggedInUser = response.data.user;
            const token = response.data.token;

            loginUser(loggedInUser, token);

            setEmail("");
            setPassword("");
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Login failed"
            );
        } finally {
            setLoading(false);
        }
    };

    // Signed in, the page is exactly one screen tall and the dashboard fills what the
    // header leaves, so the lists and the calendar scroll inside their own panels.
    return (
        <div className={`font-sans ${user ? "p-4 h-screen flex flex-col" : "p-8 min-h-screen"}`}>
            {!user ? (
                <div className="max-w-md mx-auto bg-white p-6 rounded-lg border border-gray-300">
                    <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">
                        School Management System
                    </h1>
                    <h2 className="text-2xl font-semibold mb-4 text-gray-700">
                        Login
                    </h2>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleLogin();
                        }}
                    >
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full mb-4 px-4 py-2 border border-gray-300 rounded"
                        />

                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full mb-4 px-4 py-2 border border-gray-300 rounded"
                        />

                        {error && (
                            <p className="text-red-500 mb-2">{error}</p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 text-white font-semibold py-2 rounded"
                        >
                            {loading ? "Logging in..." : "Login"}
                        </button>
                    </form>
                </div>
            ) : (
                <div className="text-center flex flex-col flex-1 min-h-0">
                    <header className="bg-white rounded-xl">
                        <div className="max-w-8xl mx-auto px-6 py-2 flex items-center justify-between">
                            {/* Left side */}
                            <h1 className="text-2xl font-bold text-gray-700">
                                School Management System
                            </h1>

                            {user.role === "admin" && <AdminTabs />}

                            {/* Right side */}
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-gray-700">
                                    Welcome, <span className="font-medium">{user.firstName}</span>
                                </span>

                                <button
                                    onClick={logout}
                                    className="bg-gray-600 hover:bg-gray-700 text-white text-sm px-3 py-1 rounded-md transition"
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    </header>
                    {user.role === "admin" && (
                        <AdminDash />
                    )}

                    {user.role === "instructor" && (
                        <InstructorDash />
                    )}

                    {user.role === "student" && (
                        <StudentDash />
                    )}
                </div>
            )}
        </div>
    );
}

export default Login;