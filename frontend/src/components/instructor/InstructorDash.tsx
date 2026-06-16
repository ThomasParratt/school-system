import Students from "./Students";
import Courses from "./Courses";
import Calendar from "./Calendar";
import { useAuth } from "../../context/AuthContext";
import { getUsers } from "../../services/userService";
import { getCourses } from "../../services/courseService";
import type { User, Course } from "../../types";
import { useState, useEffect } from "react";

export default function InstructorDash() {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

  const fetchUsers = async () => {
    if (!token) return;
    const data = await getUsers(token);
    setUsers(data.data);
  };

  const fetchCourses = async () => {
    if (!token) return;
    const data = await getCourses(token);
    setCourses(data.data);
  };

  useEffect(() => {
    fetchUsers();
    fetchCourses();
  }, [token]);

  return (
    <div className="flex gap-4 p-4 h-screen">

      {/* Side column */}
      <div className="flex flex-col flex-1 gap-4">
        <div className="flex-1 min-h-0 bg-gray-100 rounded-xl p-4 flex flex-col text-left">
          <Students token={token} users={users} courses={courses} refreshUsers={fetchUsers} />
        </div>

        <div className="flex-1 min-h-0 bg-gray-100 rounded-xl p-4 flex flex-col text-left">
          <Courses token={token} users={users} courses={courses} refreshCourses={fetchCourses} />
        </div>
      </div>

      {/* Main Calendar */}
      <div className="flex-[3] min-h-0 h-full bg-gray-100 rounded-xl p-4 flex flex-col">
        <Calendar token={token} courses={courses} />
      </div>
    </div>
  );
}