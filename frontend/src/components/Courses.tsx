import { useEffect, useState } from "react";
import { getCourses, addCourse, deleteCourse } from "../services/courseService";
import { useAuth } from "../context/AuthContext";
import type { Course } from "../types";
import bin from "../../dist/bin.svg";

export default function Courses() {
    const { token } = useAuth();
    const [courses, setCourses] = useState<Course[]>([]);;
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

    useEffect(() => {
        if (!token) return;

        async function fetchCourses() {
        try {
            const data = await getCourses(token);
            //console.log(data);
            setCourses(data.data);
        } catch (err) {
            console.error(err);
        }
        }
        fetchCourses();
    }, [token]);

    async function handleAddCourse() {
        if (!token) return;

        const title = prompt("Title?");
        const language = prompt("Language?");
        const level = prompt("Level?");
        const material = prompt("Material?");

        if (!title || !language || !level || !material) return;

        try {
            const newCourse: { data: Course } = await addCourse(token, {
                title: `${title}`,
                language: `${language}`,
                level: `${level}`,
                material: `${material}`
            });
            setCourses(prev => [...prev, newCourse.data]);
        } catch (err) {
            console.error(err);
            alert(err);
        }
    }

    async function handleDeleteCourse(courseId: number) {
        if (!token) return;

        try {
            await deleteCourse(token, courseId);
            //console.log(data);
            setCourses(prev => prev.filter(u => u.id !== courseId));
        } catch (err) {
            console.error(err);
            alert(err);
        }
    }

    function handleCourseClick(course: Course) {
        setSelectedCourse(course);
    }

    return (
        <div className="flex flex-col flex-1 min-h-0">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-xl font-bold">Courses</h1>

                <button
                    onClick={handleAddCourse}
                    className="bg-indigo-600 text-white px-3 py-1 rounded cursor-pointer hover:bg-indigo-400"
                >
                    Add
                </button>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto">
                <ul>
                    {courses.map(u => (
                        <li 
                            className="flex justify-between items-center mb-2" key={u.id}
                        >
                            <span
                                onClick={() => handleCourseClick(u)}
                                className="cursor-pointer hover:font-semibold"
                            >
                                {u.title} {u.level}
                            </span>
                            <img 
                                onClick={() => handleDeleteCourse(u.id)}
                                src={bin} 
                                alt="Delete" 
                                className="w-5 h-5 cursor-pointer hover:opacity-70" />
                        </li>
                    ))}
                </ul>
            </div>
            {selectedCourse && (
                <div className="fixed inset-0 flex items-center justify-center">
                    <div className="bg-white p-6 rounded shadow-lg w-96 relative">
                        
                        <button
                            onClick={() => setSelectedCourse(null)}
                            className="absolute top-2 right-3 text-gray-500 hover:text-black"
                        >
                            ✕
                        </button>

                        <h2 className="text-lg font-bold mb-4">
                            {selectedCourse.title}
                        </h2>
                        
                        <p className="mb-2"><strong>Language:</strong> {selectedCourse.language}</p>
                        <p className="mb-2"><strong>Level:</strong> {selectedCourse.level}</p>
                        <p className="mb-2"><strong>Material:</strong> {selectedCourse.material}</p>
                    </div>
                </div>
            )}
        </div>
    );
}