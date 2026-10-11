import { useAuth } from "../../context/useAuth";
import type { User, Course, Session } from "../../types";
import { useState, useEffect } from "react";
import { getUserCourses, getUserSessions, getUserStudents } from "../../services/userService";
import MyCourses from "./MyCourses";
import MyCalendar from "./MyCalendar";
import MyLessons from "./MyLessons";
import MyStudents from "./MyStudents";

export default function InstructorDash() {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);

  const fetchSessions = async () => {
    if (!token) return;
    const data = await getUserSessions(token);
    setSessions(data.data);
  };

  useEffect(() => {
    if (!token) return;

    const loadData = async () => {
      try {
        const [studentsResponse, coursesResponse, sessionsResponse] =
          await Promise.all([
            getUserStudents(token),
            getUserCourses(token),
            getUserSessions(token),
          ]);

        setUsers(studentsResponse.data);
        setCourses(coursesResponse.data);
        setSessions(sessionsResponse.data);
      } catch (error) {
        console.error("Failed to load instructor dashboard data", error);
      }
  };

  void loadData();
}, [token]);

  return (
    <div className="flex gap-4 p-4 h-screen">

      {/* Side column */}
      <div className="flex flex-col flex-1 gap-4">
        <div className="flex-1 min-h-0 bg-gray-100 rounded-xl p-4 flex flex-col text-left">
          <MyStudents token={token} users={users} courses={courses} />
        </div>

        <div className="flex-1 min-h-0 bg-gray-100 rounded-xl p-4 flex flex-col text-left">
          <MyCourses token={token} courses={courses} />
        </div>

        <div className="flex-1 min-h-0 bg-gray-100 rounded-xl p-4 flex flex-col text-left">
          <MyLessons token={token} courses={courses} sessions={sessions} refreshSessions={fetchSessions} />
        </div>
      </div>

      {/* Main Calendar */}
      <div className="flex-[3] min-h-0 h-full bg-gray-100 rounded-xl p-4 flex flex-col text-left">
        <MyCalendar token={token} courses={courses} sessions={sessions} refreshSessions={fetchSessions} />
      </div>
    </div>
  );
}