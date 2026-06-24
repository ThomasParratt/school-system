import { useAuth } from "../../context/AuthContext";
import type { Course, Session } from "../../types";
import { useState, useEffect } from "react";
import { getUserCourses, getUserSessions } from "../../services/userService";
import MyCourses from "./MyCourses";
import MyCalendar from "./MyCalendar";
import MyLessons from "./MyLessons";

export default function StudentDash() {
  const { token } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);

  const fetchCourses = async () => {
    if (!token) return;
    const data = await getUserCourses(token);
    setCourses(data.data);
  };

  const fetchSessions = async () => {
    if (!token) return;
    const data = await getUserSessions(token);
    setSessions(data.data);
  };

  useEffect(() => {
    fetchCourses();
    fetchSessions();
  }, [token]);

  return (
    <div className="flex gap-4 p-4 h-screen">

      {/* Side column */}
      <div className="flex flex-col flex-1 gap-4">
        <div className="flex-1 min-h-0 bg-gray-100 rounded-xl p-4 flex flex-col text-left">
          <MyCourses token={token} courses={courses} />
        </div>

        <div className="flex-1 min-h-0 bg-gray-100 rounded-xl p-4 flex flex-col text-left">
          <MyLessons token={token} courses={courses} sessions={sessions} />
        </div>
      </div>

      {/* Main Calendar */}
      <div className="flex-[3] min-h-0 h-full bg-gray-100 rounded-xl p-4 flex flex-col text-left">
        <MyCalendar token={token} courses={courses} sessions={sessions} />
      </div>
    </div>
  );
}