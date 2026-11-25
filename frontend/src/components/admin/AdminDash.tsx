import Instructors from "./Instructors";
import Students from "./Students";
import Courses from "./Courses";
import Calendar from "./Calendar";
import { useAuth } from "../../context/useAuth";
import { getAllUsers } from "../../services/userService";
import { getAllCourses } from "../../services/courseService";
import type { User, Course } from "../../types";
import { useState, useEffect } from "react";
import { useAdminTab } from "./adminTabs";

export default function AdminDash() {
  const { token } = useAuth();
  // Every user, for the course form's instructor and student pickers. The Instructors
  // and Students lists page their own.
  const [users, setUsers] = useState<User[]>([]);
  // Every course, for the Students course picker and the Calendar. The Courses list
  // pages its own.
  const [courses, setCourses] = useState<Course[]>([]);

  // The tabs themselves are in the page header (AdminTabs).
  const [tab] = useAdminTab();

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

  const box = "flex-1 min-h-0 bg-gray-100 rounded-xl p-4 flex flex-col text-left";
  // A tab shows one list on its own, centred so the row actions stay near the names.
  const fullPanel = "flex-1 min-h-0 w-full max-w-4xl mx-auto bg-gray-100 rounded-xl p-6 flex flex-col text-left";

  return (
    <div className="flex flex-col flex-1 min-h-0 gap-4 pt-4">
      {tab === "overview" && (
        <div className="flex flex-1 min-h-0 gap-4">
          {/* Side column */}
          <div className="flex flex-col flex-1 gap-4">
            <div className={box}>
              <Instructors token={token} courses={courses} refreshUsers={fetchUsers} variant="compact" />
            </div>

            <div className={box}>
              <Students token={token} courses={courses} refreshUsers={fetchUsers} variant="compact" />
            </div>

            <div className={box}>
              <Courses token={token} users={users} refreshCourses={fetchCourses} variant="compact" />
            </div>
          </div>

          {/* Main Calendar */}
          <div className="flex-[3] min-h-0 h-full bg-gray-100 rounded-xl p-4 flex flex-col">
            <Calendar token={token} courses={courses} />
          </div>
        </div>
      )}

      {tab === "instructors" && (
        <div className={fullPanel}>
          <Instructors token={token} courses={courses} refreshUsers={fetchUsers} />
        </div>
      )}

      {tab === "students" && (
        <div className={fullPanel}>
          <Students token={token} courses={courses} refreshUsers={fetchUsers} />
        </div>
      )}

      {tab === "courses" && (
        <div className={fullPanel}>
          <Courses token={token} users={users} refreshCourses={fetchCourses} />
        </div>
      )}
    </div>
  );
}
