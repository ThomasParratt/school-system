import Students from "../instructor/Students";
import Courses from "../instructor/Courses";
import Calendar from "../instructor/Calendar";
import { useAuth } from "../../context/AuthContext";
import { getUsers } from "../../services/userService";
import { getCourses } from "../../services/courseService";
import type { User, Course } from "../../types";
import { useState, useEffect } from "react";
import { getUserCourses } from "../../services/userService";
import MyCourses from "./MyCourses";

export default function StudentDash() {
  const { token } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);

  const fetchCourses = async () => {
    if (!token) return;
    const data = await getUserCourses(token);
    setCourses(data.data);
  };

  useEffect(() => {
    fetchCourses();
  }, [token]);

  return (
    <div className="flex gap-4 p-4 h-screen">

      {/* Side column */}
      <div className="flex flex-col flex-1 gap-4">
        <div className="flex-1 min-h-0 bg-gray-100 rounded-xl p-4 flex flex-col text-left">
          <MyCourses token={token} courses={courses} />
        </div>

        <div className="flex-1 min-h-0 bg-gray-100 rounded-xl p-4 flex flex-col text-left">
          Upcoming lessons
        </div>
      </div>

      {/* Main Calendar */}
      <div className="flex-[3] min-h-0 h-full bg-gray-100 rounded-xl p-4 flex flex-col">
        Calendar
      </div>
    </div>
  );
}