import { useState } from "react";
import edit from "../../../dist/edit.svg";
import type { MyStudentsProps, User } from "../../types";

export default function MyStudents({ users }: MyStudentsProps) {
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    return (
        <div className="flex flex-col flex-1 min-h-0">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-xl font-bold">My Students</h1>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto">
                <ol>
                    {users.map(user => (
                        <li
                            key={user.id}
                            className="flex justify-between items-center mb-2"
                        >
                            <span>{user.secondName}, {user.firstName}</span>

                            <div className="flex items-center gap-3">
                                <img 
                                    onClick={() => setSelectedUser(user)}
                                    src={edit} alt="Edit" 
                                    className="w-5 h-5 cursor-pointer hover:opacity-70" 
                                />
                            </div>
                        </li>
                    ))}
                </ol>
            </div>
            {selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setSelectedUser(null)}>
                    <div className="bg-white p-6 rounded shadow-lg w-[420px] relative" onClick={(e) => e.stopPropagation()}>
                    
                        <button
                            onClick={() => setSelectedUser(null)}
                            className="absolute top-2 right-3 text-gray-500 hover:text-black"
                        >
                            ✕
                        </button>

                        <div className="flex justify-between items-center mb-2">
                            <strong>First name</strong>
                            <div>{selectedUser.firstName}</div>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                            <strong>Last name</strong>
                            <div>{selectedUser.secondName}</div>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                            <strong>Email</strong>
                            <div>{selectedUser.email}</div>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                            <strong>Comments</strong>
                            <div>{selectedUser.comments}</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}