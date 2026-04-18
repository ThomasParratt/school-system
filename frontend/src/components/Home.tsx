import { useState } from "react";

// users only stored when page is refreshed
function Home( { loggedIn, users } ) {
    const [name, setName] = useState("");
    const [firstName, setFirstName] = useState("");
    const [secondName, setSecondName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [selectedAddRole, setSelectedAddRole] = useState(null);
    
    //can't create user
    const handleSignup = async () => {
        if (!name || !firstName || !secondName || !email || !password)
          return alert("Fill all fields!");
        try {
        const endpoint = "http://localhost:3000/users";
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
                        Welcome {loggedIn.first_name}
                    </h2>
                    <button
                        onClick={() => {
                            setLoggedIn(null);
                            localStorage.removeItem("user");
                            localStorage.removeItem("role");
                        }}
                        className="bg-gray-500 text-white px-4 py-2 rounded"
                    >
                        Logout
                    </button>
                </div>

                {loggedIn && (
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
                                    {u.name} {u.first_name} {u.last_name} {u.email}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}


            {!selectedAddRole ? (
              <div className="flex gap-4 mb-4">
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
      </div>
    </div>
  );
}

export default Home;