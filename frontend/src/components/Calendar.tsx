import { useState, useEffect, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { addCourseSession, getCourseSessions } from "../services/courseService";
import { getAllSessions, deleteSession } from "../services/sessionService";

export default function Calendar({ token, courses }) {
  const [events, setEvents] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");

  /**
   * Load from backend (source of truth)
   */
  const loadSessions = useCallback(async () => {
    if (!token) return;
    const courseId = Number(selectedCourseId); 

    try {
      let data;
      if (courseId === 0)
        data = await getAllSessions(token);
      else
        data = await getCourseSessions(token, courseId);

      setEvents(
        data.map((s) => ({
          id: s.id,
          title: `Session ${s.id} - ${s.location}`,
          start: s.startsAt,
          end: s.endsAt,
        }))
      );
    } catch (err) {
      console.error("Failed to load sessions:", err);
    }
  }, [token]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  /**
   * CREATE FLOW
   * select → addEvent → eventAdd → backend sync
   */
  const handleSelect = (info) => {
    const title = prompt("Session title?");
    if (!title) return;

    info.view.calendar.addEvent({
      title,
      start: info.start,
      end: info.end,
    });

    info.view.calendar.unselect();
  };

  const handleEventAdd = async (info) => {
    const event = info.event;
    const courseId = Number(selectedCourseId);
    try {
      const created = await addCourseSession(token, courseId, {
        location: event.title,
        startsAt: event.start.toISOString(),
        endsAt: event.end.toISOString(),
      });

      // reconcile backend ID with UI event
      event.setProp("id", created.id);
    } catch (err) {
      console.error("Failed to create event:", err);

      // rollback UI event if backend fails
      info.revert();
    }
  };

  /**
   * DELETE FLOW
   */
  const handleEventClick = async (clickInfo) => {
    const event = clickInfo.event;

    if (!confirm(`Delete '${event.title}'?`)) return;

    try {
      await deleteSession(token, event.id);
      event.remove();
    } catch (err) {
      console.error("Failed to delete event:", err);
      alert("Delete failed, reloading calendar...");
      loadSessions();
    }
  };

  return (
    <div className="flex-1 min-h-0">
      <p className="flex justify-between items-center mb-2">
          <select
              value={selectedCourseId}
              onChange={(e) =>
                  setSelectedCourseId(e.target.value)
              }
              className="border border-gray-200 rounded p-1 w-64"
          >
            <option value="">All courses</option>
            {courses
                .map(course => (
                <option
                    key={course.id}
                    value={course.id}
                >
                    {course.title}
                </option>
            ))}
          </select>
      </p>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        dayHeaderContent={(arg) => {
          const date = arg.date;
          return `${arg.text.split(' ')[0]} ${date.getDate()}/${date.getMonth() + 1}`;
        }}
        height="100%"
        allDaySlot={false}
        firstDay={1}
        slotMinTime="08:00:00"
        slotMaxTime="22:00:00"
        slotDuration="00:15:00"
        slotLabelFormat={{
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }}
        eventTimeFormat={{
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }}
        editable={true}
        selectable={true}
        selectMirror={true}
        events={events}
        select={handleSelect}
        eventAdd={handleEventAdd}
        eventClick={handleEventClick}
      />
    </div>
  );
}