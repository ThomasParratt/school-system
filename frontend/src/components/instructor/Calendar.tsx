import { useState, useEffect, useCallback, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type {
  DateSelectArg,
  EventAddArg,
  EventClickArg,
  EventContentArg,
  EventInput,
} from "@fullcalendar/core";
import { addCourseSession, getCourseSessions } from "../../services/courseService";
import { getAllSessions, deleteSession, getSession, updateSession } from "../../services/sessionService";
import type { Course, Session } from "../../types";
import CrudModal from "./CrudModal";

type CalendarSession = {
  id: number;
  courseId: number;
  location: string;
  startsAt: string;
  endsAt: string | null;
  title?: string;
};

type CalendarProps = {
  token: string | null;
  courses: Course[];
};

export default function Calendar({ token, courses }: CalendarProps) {
  const [events, setEvents] = useState<EventInput[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [clickedSession, setClickedSession] = useState<Session | null>(null);
  const [clickedEventId, setClickedEventId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Session>>({});

  const calendarRef = useRef<FullCalendar | null>(null);

  useEffect(() => {
      if (clickedSession) {
          setEditForm({
              location: clickedSession.location,
              content: clickedSession.content ?? "",
              homework: clickedSession.homework ?? ""
          });
      }
  }, [clickedSession]);

  async function handleUpdateSession(sessionId: number) {
      if (!token || !editForm) return;

      try {
          await updateSession(token, sessionId, editForm);
          setClickedSession(null);
      } catch (err) {
          console.error(err);
          alert(err);
      }
  }

  const getCourseTitle = (courseId: number) =>
    courses.find((course: Course) => course.id === courseId)?.title ?? "";

  /**
   * Load from backend (source of truth)
   */
  const loadSessions = useCallback(async () => {
    if (!token) return;
    const courseId = Number(selectedCourseId);

    try {
      let data: CalendarSession[];
      if (courseId === 0)
        data = await getAllSessions(token);
      else
        data = await getCourseSessions(token, courseId);

      setEvents(
        data.map((s: CalendarSession) => ({
          id: String(s.id),
          title: getCourseTitle(s.courseId) || s.title || "",
          start: s.startsAt,
          end: s.endsAt ?? undefined,
          extendedProps: {
            location: s.location,
            courseId: s.courseId,
          },
        }))
      );
    } catch (err) {
      console.error("Failed to load sessions:", err);
    }
  }, [token, selectedCourseId, courses]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions, clickedEventId]);

  /**
   * CREATE FLOW
   * select → addEvent → eventAdd → backend sync
   */
  const handleSelect = (info: DateSelectArg) => {
    const courseId = Number(selectedCourseId);

    if (courseId === 0) {
      alert("Cannot add session. Choose a course from the drop down menu.");
      return;
    }
    const title = getCourseTitle(courseId);
    if (!title) return;

    const location = prompt("Session location?");
    if (!location) return;

    const end = new Date(info.start.getTime() + 45 * 60 * 1000);

    info.view.calendar.addEvent({
      title,
      start: info.start,
      end,
      extendedProps: {
        location,
        courseId,
      },
    });

    info.view.calendar.unselect();
  };

  const handleEventAdd = async (info: EventAddArg) => {
    const event = info.event;
    const courseId = event.extendedProps.courseId;

    if (!event.start || !event.end) {
      info.revert();
      return;
    }

    try {
      const created = await addCourseSession(token, courseId, {
        location: event.extendedProps.location,
        startsAt: event.start.toISOString(),
        endsAt: event.end.toISOString(),
      });

      // reconcile backend ID with UI event
      event.setProp("id", String(created.id));
    } catch (err) {
      console.error("Failed to create event:", err);

      // rollback UI event if backend fails
      info.revert();
    }
  };

  /**
   * DELETE FLOW
   */
  const handleEventClick = async (clickInfo: EventClickArg) => {
    const event = clickInfo.event;
    const session = await getSession(token, Number(event.id));
    setClickedSession(session.data);
    setClickedEventId(Number(event.id));
    console.log(Number(event.id));
    console.log(session.data);
  };

  async function handleEventDelete() {
    if (!token || !clickedEventId) return;
    if (!confirm("Delete this session?")) return;

    try {
      await deleteSession(token, clickedEventId);

      const calendarApi = calendarRef.current?.getApi();
      const event = calendarApi?.getEventById(String(clickedEventId));

      event?.remove();

      setClickedSession(null);
      setClickedEventId(null);
    } catch (err) {
      console.error(err);
      alert("Delete failed, reloading calendar...");
      loadSessions();
    }
  }

  const eventContent = (arg: EventContentArg) => {
    const { title, start, end } = arg.event;
    const { location } = arg.event.extendedProps;

    return (
      <div className="p-1">
        <div>{title}</div>
        <div>{location}</div>
        <div>
          {start?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}{" "}
          -{" "}
          {end?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="mb-2 flex items-center justify-between border-b border-gray-200 pb-2">
        <h1 className="text-xl font-bold">Calendar</h1>
        <select
          value={selectedCourseId}
          onChange={(e) => setSelectedCourseId(e.target.value)}
          className="w-64 rounded border border-gray-200 p-1"
        >
          <option value="">All courses</option>
          {courses.map((course: Course) => (
            <option key={course.id} value={course.id}>
              {course.title}
            </option>
          ))}
        </select>
      </div>
      <div className="min-h-0 flex-1">
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
          eventBackgroundColor="#5759e9"
          editable={true}
          selectable={true}
          selectMirror={true}
          events={events}
          select={handleSelect}
          eventAdd={handleEventAdd}
          eventClick={handleEventClick}
          eventContent={eventContent}
        />
        <CrudModal
            open={!!clickedSession}
            title={`${getCourseTitle(clickedSession?.courseId)}`}
            onClose={() => setClickedSession(null)}
            onSave={() =>
                handleUpdateSession(clickedSession!.id)
            }
        >
            <p className="flex justify-between items-center mb-2">
                <strong>Location</strong>
                <input
                    value={editForm.location || ""}
                    onChange={(e) =>
                        setEditForm(prev => ({
                            ...prev!,
                            location: e.target.value
                        }))
                    }
                    className="border border-gray-200 rounded p-1 w-64"
                />
            </p>
            <p className="flex justify-between items-center mb-2">
                <strong>Content</strong>
                <textarea
                    value={editForm.content || ""}
                    onChange={(e) =>
                        setEditForm(prev => ({ ...prev, content: e.target.value }))
                    }
                    className="border border-gray-200 rounded p-1 w-64"
                />
            </p>
            <p className="flex justify-between items-center mb-3">
                <strong>Homework</strong>
                <textarea
                    value={editForm.homework || ""}
                    onChange={(e) =>
                        setEditForm(prev => ({ ...prev, homework: e.target.value }))
                    }
                    className="border border-gray-200 rounded p-1 w-64"
                />
            </p>
            <div>
              <button
                  onClick={handleEventDelete}
                  className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-400"
              >
                  Delete session
              </button>
            </div>
        </CrudModal>
      </div>
    </div>
  );
}