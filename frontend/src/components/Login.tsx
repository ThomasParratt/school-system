import { useState } from "react";
import { login } from "../services/loginService.ts";
import { useAuth } from "../context/useAuth.ts";
import AdminDash from "./admin/AdminDash.tsx";
import AdminTabs from "./admin/AdminTabs.tsx";
import InstructorDash from "./instructor/InstructorDash.tsx";
import StudentDash from "./student/StudentDash.tsx";
import ChangePassword from "./ChangePassword.tsx";
import Logo from "./Logo.tsx";
import { errorMessage } from "../lib/errors.ts";
import { INVALID_EMAIL_MESSAGE, isValidEmail } from "../lib/validation.ts";

function Login() {
    const { user, loginUser, logout, sessionExpired } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async () => {
        if (!email || !password) {
            setError("Fill email and password!");
            return;
        }
        if (!isValidEmail(email.trim())) {
            setError(INVALID_EMAIL_MESSAGE);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await login(email.trim(), password);

            const loggedInUser = response.data.user;
            const token = response.data.token;

            loginUser(loggedInUser, token);

            setEmail("");
            setPassword("");
        } catch (err) {
            setError(errorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    // Signed in, the page is exactly one screen tall and the dashboard fills what the
    // header leaves, so the lists and the calendar scroll inside their own panels.
    return (
        <div className={`font-sans ${user ? "p-4 h-screen flex flex-col" : "p-8 min-h-screen flex items-center justify-center"}`}>
            {!user ? (
                <div className="w-full max-w-md bg-white p-6 rounded-lg border border-gray-300">
                    <h1 className="mb-6 text-center">
                        <Logo size={40} />
                    </h1>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleLogin();
                        }}
                    >
                        <input
                            type="email"
                            placeholder="Email"
                            aria-label="Email"
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full mb-4 px-4 py-2 border border-gray-300 rounded"
                        />

                        <input
                            type="password"
                            placeholder="Password"
                            aria-label="Password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full mb-4 px-4 py-2 border border-gray-300 rounded"
                        />

                        {error ? (
                            <p className="text-red-500 mb-2">{error}</p>
                        ) : sessionExpired && (
                            <p className="text-gray-600 mb-2">Your session has expired. Please log in again.</p>
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
                            <h1>
                                <Logo size={40} />
                            </h1>

                            {user.role === "admin" && !user.mustChangePassword && <AdminTabs />}

                            {/* Right side */}
                            <div className="flex items-center gap-4">
                                <span className="text-gray-700">
                                    Welcome, <span className="font-medium">{user.firstName}</span>
                                </span>

                                <button
                                    onClick={logout}
                                    className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1.5 rounded-md transition"
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    </header>
                    {/* Until the password is changed the API refuses everything else, so no dashboard. */}
                    {user.mustChangePassword ? (
                        <div className="flex-1 flex items-center justify-center">
                            <ChangePassword />
                        </div>
                    ) : (
                        <>
                            {user.role === "admin" && (
                                <AdminDash />
                            )}

                            {user.role === "instructor" && (
                                <InstructorDash />
                            )}

                            {user.role === "student" && (
                                <StudentDash />
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

export default Login;