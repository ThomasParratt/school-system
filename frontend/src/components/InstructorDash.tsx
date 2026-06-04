import Students from "./Students";
import Courses from "./Courses";
import Calendar from "./Calendar";

export default function InstructorDash() {
  return (
    <div className="flex gap-4 p-4 h-screen">

      {/* Side column */}
      <div className="flex flex-col flex-1 gap-4">
        <div className="flex-1 aspect-square bg-gray-100 rounded-xl p-4 flex items-center justify-center">
          <Courses />
        </div>

        <div className="flex-1 aspect-square bg-gray-100 rounded-xl p-4 flex items-center justify-center">
          <Students />
        </div>
      </div>

      {/* Main Calendar */}
      <div className="flex-[3] aspect-square bg-gray-100 rounded-xl p-4 flex items-center justify-center">
        <Calendar />
      </div>
    </div>
  );
}