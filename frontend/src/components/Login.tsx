import { useState } from "react";
import Home from "./Home";

type Admin = {
  id: number;
  name: string;
  email: string;
};

type Instructor = {
  id: number;
  name: string;
  firstName: string;
  secondName: string;
  email: string;
};

type Student = {
  id: number;
  name: string;
  firstName: string;
  secondName: string;
  email: string;
};


function Login() {
    const [admin, setAdmin] = useState<Admin[]>([]);
    const [instructors, setInstructors] = useState<Instructor[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [name, setName] = useState("");
    const [firstName, setFirstName] = useState("");
    const [secondName, setSecondName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loggedInAdmin, setLoggedInAdmin] = useState<Admin | null>(null);
    const [loggedInInstructor, setLoggedInInstructor] = useState<Instructor | null>(null);
    const [loggedInStudent, setLoggedInStudent] = useState<Student | null>(null);
    //const [token, setToken] = useState<string | null>(null);

    // Fetch all admin
    const fetchAdmin = async () => {
        try {
            const res = await fetch("http://localhost:3000/admin");
            const data = await res.json();
            setAdmin(data);
        } catch (err) {
            console.error(err);
        }
    };

    // Fetch all instructors
    const fetchInstructors = async () => {
        try {
            const res = await fetch("http://localhost:3000/instructors");
            const data = await res.json();
            setInstructors(data);
        } catch (err) {
            console.error(err);
        }
    };

    // Fetch all students
    const fetchStudents = async () => {
        try {
            const res = await fetch("http://localhost:3000/students");
            const data = await res.json();
            setStudents(data);
        } catch (err) {
            console.error(err);
        }
    };

    // Login functions
    const handleAdminLogin = async () => {
        if (!email || !password) return alert("Fill email and password!");
        try {
            const res = await fetch("http://localhost:3000/admin/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            if (!res.ok) throw new Error(await res.text());
            const data = await res.json();
            setLoggedInAdmin(data.user);
            //setToken(data.token);
            setName("");
            setEmail("");
            setPassword("");
            fetchAdmin();
        } catch (err) {
            alert("Login failed: " + err);
        }
    };

    const handleInstructorLogin = async () => {
        if (!email || !password) return alert("Fill email and password!");
        try {
            const res = await fetch("http://localhost:3000/instructors/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            if (!res.ok) throw new Error(await res.text());
            const data = await res.json();
            setLoggedInInstructor(data.user);
            //setToken(data.token);
            setName("");
            setFirstName("");
            setSecondName("");
            setEmail("");
            setPassword("");
            fetchInstructors();
        } catch (err) {
            alert("Login failed: " + err);
        }
    };

    const handleStudentLogin = async () => {
        if (!email || !password) return alert("Fill email and password!");
        try {
            const res = await fetch("http://localhost:3000/students/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            if (!res.ok) throw new Error(await res.text());
            const data = await res.json();
            setLoggedInStudent(data.user);
            //setToken(data.token);
            setName("");
            setFirstName("");
            setSecondName("");
            setEmail("");
            setPassword("");
            fetchStudents();
        } catch (err) {
            alert("Login failed: " + err);
        }
    };

    return (
        <div className="p-8 font-sans min-h-screen">
            <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">School Management System</h1>

            {!loggedInAdmin && !loggedInInstructor && !loggedInStudent && (
                <div className="max-w-md mx-auto bg-white p-6 rounded-lg border border-gray-300">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-700">Admin Login</h2>
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
                        onClick={handleAdminLogin}
                        className="w-full bg-blue-500 text-white font-semibold py-2 rounded"
                    >
                        Login
                    </button>
                    <h2 className="text-2xl font-semibold mb-4 text-gray-700">Instructor Login</h2>
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
                        onClick={handleInstructorLogin}
                        className="w-full bg-blue-500 text-white font-semibold py-2 rounded"
                    >
                        Login
                    </button>
                    <h2 className="text-2xl font-semibold mb-4 text-gray-700">Student Login</h2>
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
                        onClick={handleStudentLogin}
                        className="w-full bg-blue-500 text-white font-semibold py-2 rounded"
                    >
                        Login
                    </button>
                </div>
            )}

            {(loggedInAdmin || loggedInInstructor || loggedInStudent) && (
                <div className="max-w-4xl mx-auto mt-6">
                <Home
                    loggedInAdmin={loggedInAdmin}
                    setLoggedInAdmin={setLoggedInAdmin}
                    loggedInInstructor={loggedInInstructor}
                    setLoggedInInstructor={setLoggedInInstructor}
                    loggedInStudent={loggedInStudent}
                    setLoggedInStudent={setLoggedInStudent}
                    admin={admin}
                    instructors={instructors}
                    students={students}
                    name={name}
                    setName={setName}
                    firstName={firstName}
                    setFirstName={setFirstName}
                    secondName={secondName}
                    setSecondName={setSecondName}
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