import { useState, useEffect, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { EventContentArg, EventInput, EventClickArg } from "@fullcalendar/core";
import type { Course, Session } from "../../types";
import { getSession } from "../../services/sessionService";

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

export default function MyCalendar({ token, courses, sessions }: CalendarProps) {
  const [events, setEvents] = useState<EventInput[]>([]);
  const [clickedSession, setClickedSession] = useState<Session | null>(null)

  const getCourseTitle = (courseId: number) =>
    courses.find((course: Course) => course.id === courseId)?.title ?? "";

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
          editable={true}
          selectable={true}
          selectMirror={true}
          events={events}
          //eventClick={handleEventClick}
          eventContent={eventContent}
        />
        {clickedSession && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setSelectedSession(null)}>
            <div className="bg-white p-6 rounded shadow-lg w-[420px] relative" onClick={(e) => e.stopPropagation()}>
            
              <button
                  onClick={() => setClickedSession(null)}
                  className="absolute top-2 right-3 text-gray-500 hover:text-black"
              >
                  ✕
              </button>

              <h2 className="text-lg font-bold mb-4">
                  {getCourseTitle(clickedSession.courseId)}
              </h2>
              <div className="flex justify-between items-center mb-2">
                  <strong>Location</strong>
                  <div>{clickedSession.location}</div>
              </div>
              <div className="flex justify-between items-center mb-2">
                  <strong>Content</strong>
                  <div>{clickedSession.content}</div>
              </div>
              <div className="flex justify-between items-center mb-2">
                  <strong>Homework</strong>
                  <div>{clickedSession.homework}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}