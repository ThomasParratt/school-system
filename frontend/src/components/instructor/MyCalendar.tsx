import { useState, useEffect, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { EventContentArg, EventInput, EventClickArg } from "@fullcalendar/core";
import type { Course, Session } from "../../types";
import { getSession, updateSession } from "../../services/sessionService";
import CrudModal from "../admin/CrudModal";

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

export default function MyCalendar({ token, courses, sessions, refreshSessions }: CalendarProps) {
  const [events, setEvents] = useState<EventInput[]>([]);
  const [clickedSession, setClickedSession] = useState<Session | null>(null)
  const [editForm, setEditForm] = useState<Partial<Session>>({});

  useEffect(() => {
      if (clickedSession) {
          setEditForm({
              location: clickedSession.location,
              content: clickedSession.content ?? "",
              homework: clickedSession.homework ?? ""
          });
      }
  }, [clickedSession]);

  const getCourseTitle = (courseId?: number) =>
    courseId === undefined
      ? ""
      : courses.find((course: Course) => course.id === courseId)?.title ?? "";

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

  const loadSessions = useCallback(async () => {
    if (!token) return;

    setEvents(
      sessions.map((s: CalendarSession) => ({
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
  }, [token, courses]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

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

  const handleEventClick = async (clickInfo: EventClickArg) => {
    const event = clickInfo.event;
    const session = await getSession(token, Number(event.id));
    setClickedSession(session.data);
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col">
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
          selectable={true}
          selectMirror={true}
          events={events}
          eventClick={handleEventClick}
          eventContent={eventContent}
        />
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
        </CrudModal>
      </div>
    </div>
  );
}