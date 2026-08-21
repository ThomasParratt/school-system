import { useState } from "react";
import edit from "../../../dist/edit.svg";
import type { Course } from "../../types";

export default function MyCourses({ token, courses }) {
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

    return (
        <div className="flex flex-col flex-1 min-h-0">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-xl font-bold">My Courses</h1>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto">
                <ol>
                    {courses.map(course => (
                        <li
                            key={course.id}
                            className="flex justify-between items-center mb-2"
                        >
                            <span>{course.title} {course.level}</span>

                            <div className="flex items-center gap-3">
                                <img 
                                    onClick={() => setSelectedCourse(course)}
                                    src={edit} alt="Edit" 
                                    className="w-5 h-5 cursor-pointer hover:opacity-70" 
                                />
                            </div>
                        </li>
                    ))}
                </ol>
            </div>
            {selectedCourse && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setSelectedCourse(null)}>
                    <div className="bg-white p-6 rounded shadow-lg w-[420px] relative" onClick={(e) => e.stopPropagation()}>
                    
                        <button
                            onClick={() => setSelectedCourse(null)}
                            className="absolute top-2 right-3 text-gray-500 hover:text-black"
                        >
                            ✕
                        </button>

                        <h2 className="text-lg font-bold mb-4">
                            {selectedCourse.title}
                        </h2>
                        <div className="flex justify-between items-center mb-2">
                            <strong>Language</strong>
                            <div>{selectedCourse.language}</div>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                            <strong>Level</strong>
                            <div>{selectedCourse.level}</div>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                            <strong>Material</strong>
                            <div>{selectedCourse.material}</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}