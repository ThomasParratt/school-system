import { useState } from "react";
import edit from "../../../dist/edit.svg";
import type { Course, Session } from "../../types";

export default function MyLessons({ token, courses, sessions }) {
    const [selectedSession, setSelectedSession] = useState<Session | null>(null);

    const getCourseTitle = (courseId: number) =>
        courses.find((course: Course) => course.id === courseId)?.title ?? "";

    return (
        <div className="flex flex-col flex-1 min-h-0">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-xl font-bold">My Lessons</h1>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto">
                <ol>
                    {sessions.map(session => (
                        <li
                            key={session.id}
                            className="flex justify-between items-center mb-2"
                        >
                            <div className="flex items-center gap-4">
                                <span>{getCourseTitle(session.courseId)}</span>
                                <span>
                                    {new Date(session.startsAt).toLocaleString("en-GB", {
                                        dateStyle: "short",
                                        timeStyle: "short",
                                        hour12: false,
                                    })}
                                </span>
                            </div>

                            <div className="flex items-center gap-3">
                                <img 
                                    onClick={() => setSelectedSession(session)}
                                    src={edit} alt="Edit" 
                                    className="w-5 h-5 cursor-pointer hover:opacity-70"

                                />
                            </div>
                        </li>
                    ))}
                </ol>
            </div>
            {selectedSession && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setSelectedSession(null)}>
                    <div className="bg-white p-6 rounded shadow-lg w-[420px] relative" onClick={(e) => e.stopPropagation()}>
                    
                        <button
                            onClick={() => setSelectedSession(null)}
                            className="absolute top-2 right-3 text-gray-500 hover:text-black"
                        >
                            ✕
                        </button>

                        <h2 className="text-lg font-bold mb-4">
                            {getCourseTitle(selectedSession.courseId)}
                        </h2>
                        <p className="flex justify-between items-center mb-2">
                            <strong>Location</strong>
                            <h2>{selectedSession.location}</h2>
                        </p>
                        <p className="flex justify-between items-center mb-2">
                            <strong>Content</strong>
                            <h2>{selectedSession.content}</h2>
                        </p>
                        <p className="flex justify-between items-center mb-2">
                            <strong>Homework</strong>
                            <h2>{selectedSession.homework}</h2>
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}