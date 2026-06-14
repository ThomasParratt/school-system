import Students from "./Students";
import Courses from "./Courses";
import Calendar from "./Calendar";
import { useAuth } from "../context/AuthContext";

export default function InstructorDash() {
  const { token } = useAuth();
  return (
    <div className="flex gap-4 p-4 h-screen">

      {/* Side column */}
      <div className="flex flex-col flex-1 gap-4">
        <div className="flex-1 min-h-0 bg-gray-100 rounded-xl p-4 flex flex-col text-left">
          <Students token={token} />
        </div>

        <div className="flex-1 min-h-0 bg-gray-100 rounded-xl p-4 flex flex-col text-left">
          <Courses token={token} />
        </div>
      </div>

      {/* Main Calendar */}
      <div className="flex-[3] min-h-0 h-full bg-gray-100 rounded-xl p-4 flex flex-col">
        <Calendar token={token} />
      </div>
    </div>
  );
}