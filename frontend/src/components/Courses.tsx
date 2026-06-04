import { useEffect, useState } from "react";
import { getCourses, addCourse } from "../services/courseService";
import { useAuth } from "../context/AuthContext";
import type { Course } from "../types";
import bin from "../../dist/bin.svg";

export default function Courses() {
    const { token } = useAuth();
    const [courses, setCourses] = useState<Course[]>([]);;

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

        if (!title || !language) return;

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
        }
    }

    return (
        <div className="flex flex-col flex-1 min-h-0">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-xl font-bold">Courses</h1>

                <button
                    onClick={handleAddCourse}
                    className="bg-indigo-600 text-white px-3 py-1 rounded"
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
                            <span>{u.title} {u.level}</span>
                            <img src={bin} alt="Delete" className="w-5 h-5" />
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}