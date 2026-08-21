import { useAuth } from "../../context/AuthContext";
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

  const fetchStudents = async () => {
    if (!token) return;
    const data = await getUserStudents(token);
    //console.log(data.data);
    setUsers(data.data);
  };

  const fetchCourses = async () => {
    if (!token) return;
    const data = await getUserCourses(token);
    //console.log(data.data);
    setCourses(data.data);
  };

  const fetchSessions = async () => {
    if (!token) return;
    const data = await getUserSessions(token);
    setSessions(data.data);
  };

  useEffect(() => {
    fetchStudents();
    fetchCourses();
    fetchSessions();
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
        <MyCalendar token={token} courses={courses} sessions={sessions} />
      </div>
    </div>
  );
}