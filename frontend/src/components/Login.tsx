import { useState } from "react";
import AdminHome from "./AdminHome";

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
};

function Login() {
    const [users, setUsers] = useState<User[]>([]);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("Student");
    const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);

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

    // Login function
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
            setLoggedInUser(data.user);
            setToken(data.token);
            setName("");
            setEmail("");
            setPassword("");
            fetchUsers();
        } catch (err) {
            alert("Login failed: " + err);
        }
    };

    return (
        <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
        <h1>School System</h1>

        {!loggedInUser && (
            <div>
                <h2>Login</h2>
                <input
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button onClick={handleLogin}>Login</button>
            </div>
        )}

        {loggedInUser && (
            <div>
                <AdminHome loggedInUser={loggedInUser} setLoggedInUser={setLoggedInUser} users={users} name={name} setName={setName} email={email} setEmail={setEmail} password={password} setPassword={setPassword} role={role} setRole={setRole} />
            </div>
        )}
        </div>
    );
}

export default Login;