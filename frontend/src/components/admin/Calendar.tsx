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
  EventDropArg,
  EventInput
} from "@fullcalendar/core";
import type { EventResizeDoneArg } from "@fullcalendar/interaction";
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

const EMPTY_SESSION : Partial<Session> = {
    location: "",
    startsAt: ""
}

export default function Calendar({ token, courses }: CalendarProps) {
  const [events, setEvents] = useState<EventInput[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [clickedSession, setClickedSession] = useState<Session | null>(null);
  const [clickedEventId, setClickedEventId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Session>>({});
  const [add, setAdd] = useState(false);
  const [addForm, setAddForm] = useState<Partial<Session>>({});

  const calendarRef = useRef<FullCalendar | null>(null);

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

  async function handleAddSession() {
      if (!token || !addForm) return;
      if (Number(selectedCourseId) === 0) {
        alert("Cannot add session. Choose a course from the drop down menu.");
        return;
      }

      const startsAtValue = addForm.startsAt;

      if (!startsAtValue) {
        alert("Please choose a valid start time.");
        return;
      }

      const startsAt = new Date(startsAtValue);

      if (Number.isNaN(startsAt.getTime())) {
        alert("Please choose a valid start time.");
        return;
      }

      const endsAt = new Date(startsAt.getTime() + 45 * 60 * 1000);

      try {
          await addCourseSession(token, Number(selectedCourseId), {
            location: addForm.location ?? "",
            startsAt: startsAt.toISOString(),
            endsAt: endsAt.toISOString()
          });
          setAdd(false);
          setEvents(await loadSessions());
      } catch (err) {
          console.error(err);
          alert(err);
      }
  }

  const handleOpenAddModal = () => {
      if (!selectedCourseId) {
          alert("Cannot add session. Choose a course from the drop down menu.");
          return;
      }

      setAddForm({
          location: EMPTY_SESSION.location,
          startsAt: EMPTY_SESSION.startsAt,
      });
      setAdd(true);
  };

  const getCourseTitle = useCallback(
      (courseId?: number) =>
          courseId === undefined
              ? ""
              : courses.find((course: Course) => course.id === courseId)?.title ?? "",
      [courses]
  );

  /**
   * Load from backend (source of truth)
   */
  const loadSessions = useCallback(async (): Promise<EventInput[]> => {
      if (!token) return [];

      const courseId = Number(selectedCourseId);

      try {
          let data: CalendarSession[];

          if (courseId === 0) {
              data = await getAllSessions(token);
          } else {
              data = await getCourseSessions(token, courseId);
          }

          return data.map((session: CalendarSession) => ({
              id: String(session.id),
              title: getCourseTitle(session.courseId) || session.title || "",
              start: session.startsAt,
              end: session.endsAt ?? undefined,
              extendedProps: {
                  location: session.location,
                  courseId: session.courseId,
              },
          }));
      } catch (error) {
          console.error("Failed to load sessions:", error);
          return [];
      }
  }, [token, selectedCourseId, getCourseTitle]);


  useEffect(() => {
      let cancelled = false;
      const refreshEvents = async () => {
          const nextEvents = await loadSessions();

          if (!cancelled) {
              setEvents(nextEvents);
          }
      };
      void refreshEvents();
      return () => {
          cancelled = true;
      };
  }, [loadSessions]);

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

    const location = prompt("Please enter session location:");
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
      if (!token) return;

      const event = clickInfo.event;
      const session = await getSession(token, Number(event.id));

      setClickedSession(session.data);
      setClickedEventId(Number(event.id));
      setEditForm({
          location: session.data.location,
          content: session.data.content ?? "",
          homework: session.data.homework ?? ""
      });
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
      setEvents(await loadSessions());
    }
  }

  const handleEventDrop = async (info: EventDropArg) => {
    if (!token) return;

    const event = info.event;

    try {
      await updateSession(token, Number(event.id), {
        startsAt: event.start?.toISOString(),
        endsAt: event.end?.toISOString(),
      });
    } catch (err) {
      console.error(err);
      alert("Failed to move session");
      info.revert(); // IMPORTANT: rollback UI change
    }
  }

  const handleEventResize = async (info: EventResizeDoneArg) => {
    if (!token) return;

    const event = info.event;

    try {
      await updateSession(token, Number(event.id), {
        startsAt: event.start?.toISOString(),
        endsAt: event.end?.toISOString(),
      });
    } catch (err) {
      console.error(err);
      alert("Failed to resize session");
      info.revert();
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
    <div className="min-h-0 flex-1 flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-xl font-bold">Sessions</h1>

        <div className="flex gap-2">
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
          <button
            onClick={handleOpenAddModal}
            className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-400"
          >
            Add session
          </button>
        </div>
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
          eventDrop={handleEventDrop}
          eventResize={handleEventResize}
          eventContent={eventContent}
        />
        {selectedCourseId && (<CrudModal
            open={!!add}
            onClose={() => setAdd(false)}
            onSave={() =>
                handleAddSession()
            }
        >
            <p className="flex justify-between items-center mb-2">
                <strong>Location</strong>
                <input
                    value={addForm.location || ""}
                    onChange={(e) =>
                        setAddForm(prev => ({
                            ...prev!,
                            location: e.target.value
                        }))
                    }
                    className="border border-gray-200 rounded p-1 w-64"
                />
            </p>
            <p className="flex justify-between items-center mb-2">
                <strong>Starts at</strong>

                <input
                    type="datetime-local"
                    value={addForm.startsAt || ""}
                    onChange={(e) =>
                        setAddForm(prev => ({
                            ...prev!,
                            startsAt: e.target.value
                        }))
                    }
                    className="border border-gray-200 rounded p-1 w-64"
                />
            </p>
        </CrudModal>)}
        <CrudModal
            open={!!clickedSession}
            onClose={() => setClickedSession(null)}
            onSave={() =>
                handleUpdateSession(clickedSession!.id)
            }
        >
            <h2 className="text-lg font-bold mb-4">
                {`${getCourseTitle(clickedSession?.courseId)}`}
            </h2>
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
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-400"
              >
                  Delete session
              </button>
            </div>
        </CrudModal>
      </div>
    </div>
  );
}