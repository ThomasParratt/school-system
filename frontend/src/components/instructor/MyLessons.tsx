import { useState, useEffect } from "react";
import edit from "../../../dist/edit.svg";
import type { Course, Session } from "../../types";
import CrudModal from "../admin/CrudModal";
import { updateSession } from "../../services/sessionService";

export default function MyLessons({ token, courses, sessions, refreshSessions }) {
    const [selectedSession, setSelectedSession] = useState<Session | null>(null);
    const [editForm, setEditForm] = useState<Partial<Session>>({});

    useEffect(() => {
        if (selectedSession) {
            setEditForm({
                location: selectedSession.location,
                content: selectedSession.content ?? "",
                homework: selectedSession.homework ?? ""
            });
        }
    }, [selectedSession]);

    const getCourseTitle = (courseId?: number) =>
        courseId === undefined
        ? ""
        : courses.find((course: Course) => course.id === courseId)?.title ?? "";

    async function handleUpdateSession(sessionId: number) {
        if (!token || !editForm) return;

        try {
            await updateSession(token, sessionId, editForm);
            await refreshSessions();
            setSelectedSession(null);
        } catch (err) {
            console.error(err);
            alert(err);
        }
    }

    return (
        <div className="flex flex-col flex-1 min-h-0">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-xl font-bold">My Lessons</h1>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto">
                <ol>
                    {[...sessions]
                        .sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt))
                        .map(session => (
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
                                    src={edit}
                                    alt="Edit"
                                    className="w-5 h-5 cursor-pointer hover:opacity-70"
                                />
                            </div>
                            </li>
                    ))}
                </ol>
            </div>
            <CrudModal
                open={!!selectedSession}
                onClose={() => setSelectedSession(null)}
                onSave={() =>
                    handleUpdateSession(selectedSession!.id)
                }
            >
                <h2 className="text-lg font-bold mb-4">
                    {`${getCourseTitle(selectedSession?.courseId)}`}
                </h2>
                <p className="flex justify-between items-center mb-2">
                    <strong>Location</strong>
                    <input
                        value={editForm.location || ""}
                        onChange={(e) =>
                            setEditForm(prev => ({
                                ...prev!,
                                location: e.target.value
                            }))
                        }
                        className="border border-gray-200 rounded p-1 w-64"
                    />
                </p>
                <p className="flex justify-between items-center mb-2">
                    <strong>Content</strong>
                    <textarea
                        value={editForm.content || ""}
                        onChange={(e) =>
                            setEditForm(prev => ({ ...prev, content: e.target.value }))
                        }
                        className="border border-gray-200 rounded p-1 w-64"
                    />
                </p>
                <p className="flex justify-between items-center mb-3">
                    <strong>Homework</strong>
                    <textarea
                        value={editForm.homework || ""}
                        onChange={(e) =>
                            setEditForm(prev => ({ ...prev, homework: e.target.value }))
                        }
                        className="border border-gray-200 rounded p-1 w-64"
                    />
                </p>
            </CrudModal>
        </div>
    );
}