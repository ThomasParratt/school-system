import { useState, useEffect, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  addCourseSession,
  getCourseSessions,
  //deleteCourseSession,
} from "../services/courseService";
import { deleteSession } from "../services/sessionService";

export default function Calendar({ token }) {
  const [events, setEvents] = useState([]);

  /**
   * Load from backend (source of truth)
   */
  const loadSessions = useCallback(async () => {
    if (!token) return;

    try {
      const data = await getCourseSessions(token, 3);

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

    try {
      const created = await addCourseSession(token, 3, {
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
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
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