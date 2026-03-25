
function Home( { loggedInAdmin, setLoggedInAdmin, loggedInStudent, setLoggedInStudent, loggedInInstructor, setLoggedInInstructor, admin, instructors, students, name, setName, firstName, setFirstName, secondName, setSecondName, email, setEmail, password, setPassword } ) {

    // Signup functions
    const handleInstructorSignup = async () => {
        if (!name || !firstName || !secondName || !email || !password ) return alert("Fill all fields!");
        try {
            const res = await fetch("http://localhost:3000/instructors", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, firstName, secondName, email, password }),
            });
            if (!res.ok) throw new Error(await res.text());
            alert("User created successfully!");
            setName("");
            setFirstName("");
            setSecondName("");
            setEmail("");
            setPassword("");
        } catch (err) {
            alert("Error: " + err);
        }
    };

    const handleStudentSignup = async () => {
        if (!name || !firstName || !secondName || !email || !password ) return alert("Fill all fields!");
        try {
            const res = await fetch("http://localhost:3000/students", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, firstName, secondName, email, password }),
            });
            if (!res.ok) throw new Error(await res.text());
            alert("User created successfully!");
            setName("");
            setFirstName("");
            setSecondName("");
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
                        Welcome {loggedInAdmin?.name || loggedInInstructor?.first_name || loggedInStudent?.first_name || "Guest"}
                    </h2>
                    <button
                        onClick={() => {
                            setLoggedInAdmin(null);
                            setLoggedInInstructor(null);
                            setLoggedInStudent(null);
                        }}
                        className="bg-gray-500 text-white px-4 py-2 rounded"
                    >
                        Logout
                    </button>
                </div>

                {loggedInAdmin && (
                <div className="mt-4">
                    <h3 className="text-xl font-semibold mb-2 text-gray-700">All Instructors</h3>
                    {instructors.length === 0 ? (
                        <p className="text-gray-500">No instructors found.</p>
                    ) : (
                        <ul className="mb-6">
                            {instructors.map((u) => (
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
                    <h3 className="text-xl font-semibold mb-2 text-gray-700">All Students</h3>
                    {students.length === 0 ? (
                        <p className="text-gray-500">No students found.</p>
                    ) : (
                        <ul className="mb-6">
                            {students.map((u) => (
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

                    <h3 className="text-xl font-semibold mb-2 text-gray-700">Add Instructor</h3>
                    <div className="flex items-center mb-4">
                        <p className="mr-2 font-medium text-gray-700">Username:</p>
                        <input
                            placeholder="Enter username"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none"
                        />
                    </div>
                    <div className="flex items-center mb-4">
                        <p className="mr-2 font-medium text-gray-700">First name:</p>
                        <input
                            placeholder="Enter first name"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none"
                        />
                    </div>
                    <div className="flex items-center mb-4">
                        <p className="mr-2 font-medium text-gray-700">Second name:</p>
                        <input
                            placeholder="Enter second name"
                            value={secondName}
                            onChange={(e) => setSecondName(e.target.value)}
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
                    <button
                    onClick={handleInstructorSignup}
                    className="bg-blue-500 text-white px-6 py-2 rounded"
                    >
                    Add
                    </button>
                    <h3 className="text-xl font-semibold mb-2 text-gray-700">Add Student</h3>
                    <div className="flex items-center mb-4">
                        <p className="mr-2 font-medium text-gray-700">Username:</p>
                        <input
                            placeholder="Enter username"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none"
                        />
                    </div>
                    <div className="flex items-center mb-4">
                        <p className="mr-2 font-medium text-gray-700">First name:</p>
                        <input
                            placeholder="Enter first name"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none"
                        />
                    </div>
                    <div className="flex items-center mb-4">
                        <p className="mr-2 font-medium text-gray-700">Second name:</p>
                        <input
                            placeholder="Enter second name"
                            value={secondName}
                            onChange={(e) => setSecondName(e.target.value)}
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
                    <button
                    onClick={handleStudentSignup}
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