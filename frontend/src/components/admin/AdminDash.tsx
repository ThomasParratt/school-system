import Instructors from "./Instructors";
import Students from "./Students";
import Courses from "./Courses";
import Calendar from "./Calendar";
import { useAuth } from "../../context/useAuth";
import { getAllUsers } from "../../services/userService";
import { getAllCourses } from "../../services/courseService";
import type { User, Course } from "../../types";
import { useState, useEffect } from "react";

export default function AdminDash() {
  const { token } = useAuth();
  // Every user, for the course form's instructor and student pickers. The Instructors
  // and Students lists page their own.
  const [users, setUsers] = useState<User[]>([]);
  // Every course, for the Students course picker and the Calendar. The Courses list
  // pages its own.
  const [courses, setCourses] = useState<Course[]>([]);

  const fetchUsers = async () => {
    if (!token) return;
    setUsers(await getAllUsers(token));
  };

  const fetchCourses = async () => {
    if (!token) return;
    setCourses(await getAllCourses(token));
  };

  useEffect(() => {
    if (!token) return;

    const loadData = async () => {
      try {
        const [usersResponse, coursesResponse] = await Promise.all([
          getAllUsers(token),
          getAllCourses(token),
        ]);

        setUsers(usersResponse);
        setCourses(coursesResponse);
      } catch (error) {
        console.error("Failed to load admin dashboard data", error);
      }
  };

  void loadData();
}, [token]);

  return (
    <div className="flex gap-4 p-4 h-screen">

      {/* Side column */}
      <div className="flex flex-col flex-1 gap-4">
        <div className="flex-1 min-h-0 bg-gray-100 rounded-xl p-4 flex flex-col text-left">
          <Instructors token={token} courses={courses} refreshUsers={fetchUsers} />
        </div>

        <div className="flex-1 min-h-0 bg-gray-100 rounded-xl p-4 flex flex-col text-left">
          <Students token={token} courses={courses} refreshUsers={fetchUsers} />
        </div>

        <div className="flex-1 min-h-0 bg-gray-100 rounded-xl p-4 flex flex-col text-left">
          <Courses token={token} users={users} refreshCourses={fetchCourses} />
        </div>
      </div>

      {/* Main Calendar */}
      <div className="flex-[3] min-h-0 h-full bg-gray-100 rounded-xl p-4 flex flex-col">
        <Calendar token={token} courses={courses} />
      </div>
    </div>
  );
}