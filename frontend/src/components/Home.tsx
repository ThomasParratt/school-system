
function Home( { loggedInUser, setLoggedInUser, users, name, setName, email, setEmail, password, setPassword, role, setRole } ) {

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

    return (
        <div>
            <h2>
                Welcome {loggedInUser.name} ({loggedInUser.role})
            </h2>
                <button onClick={() => setLoggedInUser(null)}>Logout</button>

            {loggedInUser?.role === "Admin" && (
                <div>
                    <h3>All Users</h3>
                    <ul>
                        {users.map((u) => (
                            <li key={u.id}>
                                {u.name} ({u.email}) - {u.role}
                            </li>
                        ))}
                    </ul>
                    <h2>Create User</h2>
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
                        <option value="Instructor">Instructor</option>
                        <option value="Student">Student</option>
                    </select>
                    <button onClick={handleSignup}>Add</button>
                </div>
            )}
        </div>
    );
}

export default Home;