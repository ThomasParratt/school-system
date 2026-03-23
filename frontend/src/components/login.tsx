import { useState } from "react";

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

    // Signup function
    const handleSignup = async () => {
        if (!name || !email || !password || !role) return alert("Fill all fields!");
        try {
            const res = await fetch("http://localhost:3000/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password, role }),
            });
            if (!res.ok) throw new Error(await res.text());
            alert("User created successfully!");
            setName("");
            setEmail("");
            setPassword("");
            } catch (err) {
            alert("Error: " + err);
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
            <h2>Sign Up</h2>
            <input
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
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
            <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="Admin">Admin</option>
                <option value="Instructor">Instructor</option>
                <option value="Student">Student</option>
            </select>
            <button onClick={handleSignup}>Sign Up</button>

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
                <h2>
                    Welcome {loggedInUser.name} ({loggedInUser.role})
                </h2>
                    <button onClick={() => setLoggedInUser(null)}>Logout</button>

                <h3>All Users</h3>
                <ul>
                    {users.map((u) => (
                        <li key={u.id}>
                            {u.name} ({u.email}) - {u.role}
                        </li>
                    ))}
                </ul>
            </div>
        )}
        </div>
    );
}

export default Login;