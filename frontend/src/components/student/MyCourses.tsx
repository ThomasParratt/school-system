import { useEffect, useState } from "react";
import { getUserCourses } from "../../services/userService";
//import { useCrud } from "../../hooks/useCrud";
import type { Course } from "../../types";
import CrudList from "../instructor/CrudList";
//import CrudModal from "./CrudModal";
//import bin from "../../../dist/bin.svg";
import edit from "../../../dist/edit.svg";

export default function MyCourses({ token, courses }) {


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
                                    //onClick={() => onEdit(item)}
                                    src={edit} alt="Edit" 
                                    className="w-5 h-5 cursor-pointer hover:opacity-70" 
                                />
                            </div>
                        </li>
                    ))}
                </ol>
            </div>
        </div>
    );
}