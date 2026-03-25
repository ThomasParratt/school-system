import { useState } from "react";

function Home( { loggedInAdmin, setLoggedInAdmin, loggedInStudent, setLoggedInStudent, loggedInInstructor, setLoggedInInstructor, admin, instructors, students, name, setName, firstName, setFirstName, secondName, setSecondName, email, setEmail, password, setPassword } ) {
    const [selectedAddRole, setSelectedAddRole] = useState(null);
    
    const handleSignup = async () => {
        if (!name || !firstName || !secondName || !email || !password)
        return alert("Fill all fields!");
        try {
        const endpoint =
            selectedAddRole === "Instructor"
            ? "http://localhost:3000/instructors"
            : "http://localhost:3000/students";
        const res = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, firstName, secondName, email, password }),
        });
        if (!res.ok) throw new Error(await res.text());
        alert(`${selectedAddRole} created successfully!`);
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
                                    {u.name} {u.first_name} {u.last_name} {u.email}
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
                                    {u.name} {u.first_name} {u.last_name} {u.email}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}

                    <h3 className="text-xl font-semibold mb-2 text-gray-700">Add User</h3>

            {/* Role selector */}
            {!selectedAddRole ? (
              <div className="flex gap-4 mb-4">
                <button
                  onClick={() => setSelectedAddRole("Instructor")}
                  className="flex-1 bg-blue-500 text-white font-semibold py-2 rounded"
                >
                  Add Instructor
                </button>
                <button
                  onClick={() => setSelectedAddRole("Student")}
                  className="flex-1 bg-blue-500 text-white font-semibold py-2 rounded"
                >
                  Add Student
                </button>
              </div>
            ) : (
              <>
                {/* Form for the selected role */}
                <p className="mb-2 font-medium text-gray-700">
                  {selectedAddRole} Details
                </p>
                <div className="flex flex-col gap-4 mb-4">
                  <input
                    placeholder="Username"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded focus:outline-none"
                  />
                  <input
                    placeholder="First name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded focus:outline-none"
                  />
                  <input
                    placeholder="Second name"
                    value={secondName}
                    onChange={(e) => setSecondName(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded focus:outline-none"
                  />
                  <input
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded focus:outline-none"
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded focus:outline-none"
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={handleSignup}
                    className="flex-1 bg-blue-500 text-white py-2 rounded"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setSelectedAddRole(null)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
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