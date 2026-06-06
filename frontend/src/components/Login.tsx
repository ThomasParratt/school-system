import { useState } from "react";
import { login } from "../services/loginService.ts";
import { useAuth } from "../context/AuthContext";
import InstructorDash from "./InstructorDash.tsx";

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

    return (
        <div className="p-8 font-sans min-h-screen">
            <h1 className="text-3xl font-bold mb-4 text-center text-gray-800">
                School Management System
            </h1>

            {!user ? (
                <div className="max-w-md mx-auto bg-white p-6 rounded-lg border border-gray-300">
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
                <div className="text-center">
                    <div className="relative mb-4">
                        <h1 className="text-xl text-center">
                            Welcome {user.firstName}!
                        </h1>

                        <button
                            onClick={logout}
                            className="absolute right-0 top-1/2 -translate-y-1/2 bg-gray-500 text-white px-4 py-2 rounded"
                        >
                            Logout
                        </button>
                    </div>
                    {user.role === "instructor" && (
                        <InstructorDash />
                    )}

                    {user.role === "student" && (
                        <p className="mb-4 text-gray-600">
                            Student dashboard
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}

export default Login;