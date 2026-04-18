import { useState } from "react";
import Home from "./Home";
import { useEffect } from "react";

type User = {
  id: number;
  name: string;
  firstName: string;
  secondName: string;
  email: string;
};

function Login() {
    const [users, setUsers] = useState<User[]>([]);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loggedIn, setLoggedIn] = useState<User | null>(null);
    //const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        //const storedRole = localStorage.getItem("role");

        if (storedUser) {
            const user = JSON.parse(storedUser);
            setLoggedIn(user);
            fetchUsers();
        }
    }, []);

    // Fetch all users
    const fetchUsers = async () => {
        try {
            const res = await fetch("http://localhost:3000/users");
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
            setLoggedIn(data.user);
            localStorage.setItem("user", JSON.stringify(data.user));
            localStorage.setItem("role", "student");
            //setToken(data.token);
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
                            <>
                            {/* Show login form based on selected role */}
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
                            </>
                    </div>
                )}

            {(loggedIn) && (
                <div className="max-w-4xl mx-auto mt-6">
                <Home
                    loggedIn={loggedIn}
                    setLoggedIn={setLoggedIn}
                    users={users}
                    email={email}
                    setEmail={setEmail}
                    password={password}
                    setPassword={setPassword}
                />
                </div>
            )}
        </div>
    );
}

export default Login;