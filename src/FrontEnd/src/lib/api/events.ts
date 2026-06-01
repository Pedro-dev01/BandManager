import type { BandEvent, EventType, Recurrence } from "@/lib/store";
import { apiFetch } from "./config";
import type {
  ApiEvent,
  ApiEventType,
  CreateEventBody,
  UpdateEventBody,
} from "./types";

const RECURRENCE_KEYS: Recurrence[] = [
  "none",
  "daily",
  "weekdays",
  "weekly",
  "monthly",
  "yearly",
];

function mapEventType(type: ApiEventType): EventType {
  switch (type) {
    case "Culto":
      return "Culto";
    case "Ensaio":
      return "Ensaio";
    case "TocarFora":
      return "Evento especial";
    default:
      return "Culto";
  }
}

function mapEventTypeToApi(type: EventType): ApiEventType {
  switch (type) {
    case "Ensaio":
      return "Ensaio";
    case "Evento especial":
      return "TocarFora";
    default:
      return "Culto";
  }
}

function parseRecurrence(name: string | undefined): Recurrence {
  if (name && RECURRENCE_KEYS.includes(name as Recurrence)) {
    return name as Recurrence;
  }
  return "none";
}

function combineEventDate(date: string, time: string): string {
  const [h, m] = time.split(":");
  return `${date}T${h.padStart(2, "0")}:${(m ?? "00").padStart(2, "0")}:00`;
}

function mapRecurrenceToApi(event: BandEvent) {
  if (!event.recurrence || event.recurrence === "none") return null;

  const base = new Date(`${event.date}T12:00:00`);
  const [h, m] = event.time.split(":");

  return {
    name: event.recurrence,
    dayOfWeek: base.getDay(),
    time: `${h.padStart(2, "0")}:${(m ?? "00").padStart(2, "0")}:00`,
    startDate: `${event.date}T00:00:00`,
    endDate: null,
  };
}

export function mapApiEventToBandEvent(event: ApiEvent): BandEvent {
  const date = new Date(event.eventDate);
  const isoDate = date.toISOString().slice(0, 10);
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const time =
    hours === "00" && minutes === "00" ? "19:00" : `${hours}:${minutes}`;

  return {
    id: event.id,
    name: event.title,
    date: isoDate,
    time,
    location: event.location ?? "",
    type: mapEventType(event.type),
    recurrence: parseRecurrence(event.recurrence?.name),
    notes: event.notes ?? undefined,
  };
}

function mapBandEventToBody(event: BandEvent): CreateEventBody {
  return {
    title: event.name.trim(),
    eventDate: combineEventDate(event.date, event.time),
    location: event.location.trim() || null,
    type: mapEventTypeToApi(event.type),
    notes: event.notes?.trim() || null,
    recurrence: mapRecurrenceToApi(event),
  };
}

export async function fetchEvents(): Promise<BandEvent[]> {
  const events = await apiFetch<ApiEvent[]>("/api/events");
  return events.map(mapApiEventToBandEvent);
}

export async function createEvent(event: BandEvent): Promise<BandEvent> {
  const body = mapBandEventToBody(event);
  const created = await apiFetch<ApiEvent>("/api/events", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return mapApiEventToBandEvent(created);
}

export async function updateEvent(event: BandEvent): Promise<BandEvent> {
  const body: UpdateEventBody = mapBandEventToBody(event);
  const updated = await apiFetch<ApiEvent>(`/api/events/${event.id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
  return mapApiEventToBandEvent(updated);
}

export async function deleteEvent(id: string): Promise<void> {
  await apiFetch<void>(`/api/events/${id}`, { method: "DELETE" });
}
