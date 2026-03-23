
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
        <div className="p-8 font-sans min-h-screen">
            <div className="max-w-4xl mx-auto p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold text-gray-700">
                        Welcome {loggedInUser.name} ({loggedInUser.role})
                    </h2>
                    <button
                        onClick={() => setLoggedInUser(null)}
                        className="bg-gray-500 text-white px-4 py-2 rounded"
                    >
                        Logout
                    </button>
                </div>

                {loggedInUser?.role === "Admin" && (
                <div className="mt-4">
                    <h3 className="text-xl font-semibold mb-2 text-gray-700">All Users</h3>
                    {users.length === 0 ? (
                        <p className="text-gray-500">No users found.</p>
                    ) : (
                        <ul className="mb-6">
                            {users.map((u) => (
                                <li
                                    key={u.id}
                                    className="py-1"
                                >
                                    <span>
                                    {u.name} ({u.email}) - {u.role}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}

                    <h3 className="text-xl font-semibold mb-2 text-gray-700">Create User</h3>
                    <div className="flex items-center mb-4">
                        <p className="mr-2 font-medium text-gray-700">Name:</p>
                        <input
                            placeholder="Enter name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none"
                        />
                    </div>
                    <div className="flex items-center mb-4">
                        <p className="mr-2 font-medium text-gray-700">Email:</p>
                        <input
                            placeholder="Enter email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none"
                        />
                    </div>
                    <div className="flex items-center mb-4">
                        <p className="mr-2 font-medium text-gray-700">Password:</p>
                        <input
                            type="password"
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none"
                        />
                    </div>
                    <div className="flex items-center mb-4">
                        <p className="mr-2 font-medium text-gray-700">Role:</p>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none"
                        >
                            <option value="Instructor">Instructor</option>
                            <option value="Student">Student</option>
                        </select>
                    </div>
                    <button
                    onClick={handleSignup}
                    className="bg-blue-500 text-white px-6 py-2 rounded"
                    >
                    Add
                    </button>
                </div>
                )}
                <p className="font-medium text-gray-700">Enrolments</p>
                <p className="font-medium text-gray-700">Students</p>
                <p className="font-medium text-gray-700">Classes</p>
                <p className="font-medium text-gray-700">Calendar</p>
            </div>
        </div>
    );
}

export default Home;