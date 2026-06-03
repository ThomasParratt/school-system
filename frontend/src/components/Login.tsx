import { useState } from "react";
import type { AuthState } from "../types.ts"
import { login } from "../services/loginService.ts";

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
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [auth, setAuth] = useState<AuthState | null>(() => readStoredAuth());
    const loggedIn = auth?.user ?? null;

    // Login functions
    const handleLogin = async () => {
        if (!email || !password) return alert("Fill email and password!");
        try {
            const { data: { token, user } } = await login(email, password);
            const nextAuth = { token, user };

            setAuth(nextAuth);
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextAuth));
            setEmail("");
            setPassword("");
        } catch (err) {
            alert("Login failed: " + err);
        }
    };


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
                <div>
                    <h1>Logged in</h1>
                    <button
                        onClick={() => {
                            setAuth(null);
                            localStorage.removeItem(AUTH_STORAGE_KEY);
                        }}
                        className="bg-gray-500 text-white px-4 py-2 rounded"
                    >
                        Logout
                    </button>
                </div>
            )}
        </div>
    );
}

export default Login;