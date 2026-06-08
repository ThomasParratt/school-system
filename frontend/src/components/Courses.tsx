import { useEffect, useState } from "react";
import { getCourses, addCourse, deleteCourse, updateCourse } from "../services/courseService";
import { useAuth } from "../context/AuthContext";
import type { Course } from "../types";
import bin from "../../dist/bin.svg";
import edit from "../../dist/edit.svg";

export default function Courses() {
    const { token } = useAuth();
    const [courses, setCourses] = useState<Course[]>([]);;
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [editForm, setEditForm] = useState<Partial<Course> | null>(null);

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

    useEffect(() => {
        if (selectedCourse) {
            setEditForm({
                language: selectedCourse.language,
                level: selectedCourse.level,
                material: selectedCourse.material
            });
        }
    }, [selectedCourse]);

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

    function handleEditClick(course: Course) {
            setSelectedCourse(course);
        }
    
        async function handleUpdateCourse(courseId: number) {
            if (!token || !editForm) return;
    
            try {
                const updatedCourse: { data: Course } = await updateCourse(token, courseId, editForm);
    
                setCourses(prev =>
                    prev.map(course =>
                        course.id === courseId ? updatedCourse.data : course
                    )
                );
    
                setSelectedCourse(updatedCourse.data);
                setEditForm({
                    language: updatedCourse.data.language,
                    level: updatedCourse.data.level,
                    material: updatedCourse.data.material
                });
                setSelectedCourse(null);
            } catch (err) {
                console.error(err);
                alert(err);
            }
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
                            <span>
                                {u.title} {u.level}
                            </span>
                            <div className="flex items-center gap-3">
                                <img 
                                    onClick={() => handleEditClick(u)}
                                    src={edit} alt="Edit" 
                                    className="w-5 h-5 cursor-pointer hover:opacity-70" 
                                />
                                <img 
                                    onClick={() => handleDeleteCourse(u.id)}
                                    src={bin} alt="Delete" 
                                    className="w-5 h-5 cursor-pointer hover:opacity-70" 
                                />
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
            {selectedCourse && editForm && (
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
                        
                        <p className="flex justify-between items-center mb-2">
                            <strong>Language</strong>
                            <select
                                value={editForm.language || ""}
                                onChange={(e) =>
                                    setEditForm(prev => ({ ...prev, language: e.target.value }))
                                }
                                className="border border-gray-200 rounded p-1 w-64"
                            >
                                <option value="English">English</option>
                                <option value="Finnish">Finnish</option>
                                <option value="Swedish">Swedish</option>
                                <option value="Russian">Russian</option>
                                <option value="German">German</option>
                                <option value="French">French</option>
                            </select>
                        </p>
                        <p className="flex justify-between items-center mb-2">
                            <strong>Level</strong>
                            <select
                                value={editForm.level || ""}
                                onChange={(e) =>
                                    setEditForm(prev => ({ ...prev, level: e.target.value }))
                                }
                                className="border border-gray-200 rounded p-1 w-64"
                            >
                                <option value="A1">A1</option>
                                <option value="A2">A2</option>
                                <option value="B1">B1</option>
                                <option value="B2">B2</option>
                                <option value="C1">C1</option>
                                <option value="C2">C2</option>
                            </select>
                        </p>
                        <p className="flex justify-between items-center mb-2">
                            <strong>Material</strong>
                            <textarea
                                value={editForm.material || ""}
                                onChange={(e) =>
                                    setEditForm(prev => ({ ...prev, material: e.target.value }))
                                }
                                className="border border-gray-200 rounded p-1 w-64"
                            />
                        </p>
                        <button
                            onClick={() => handleUpdateCourse(selectedCourse.id)}
                            className="mt-4 bg-indigo-600 text-white px-3 py-1 rounded cursor-pointer hover:bg-indigo-400"
                        >
                            Save changes
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}