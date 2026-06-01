export type ApiEventType = "Culto" | "Ensaio" | "TocarFora";

export type ApiEventRecurrence = {
  id: string;
  name: string;
  dayOfWeek: number;
  time: string;
  startDate: string;
  endDate: string | null;
};

export type ApiEvent = {
  id: string;
  title: string;
  eventDate: string;
  location: string | null;
  type: ApiEventType;
  notes: string | null;
  recurrence: ApiEventRecurrence | null;
};

export type SaveEventRecurrenceBody = {
  name: string;
  dayOfWeek: number;
  time: string;
  startDate: string;
  endDate: string | null;
};

export type CreateEventBody = {
  title: string;
  eventDate: string;
  location: string | null;
  type: ApiEventType;
  notes: string | null;
  recurrence: SaveEventRecurrenceBody | null;
};

export type UpdateEventBody = CreateEventBody;

export type ApiSong = {
  id: string;
  title: string;
  artist: string;
  keySignature: string;
  bpm: number | null;
  category: string | null;
};

export type ApiRepertoireItem = {
  id: string;
  songId: string;
  songTitle: string;
  songArtist: string;
  defaultKey: string;
  order: number;
  songKey: string | null;
  notes: string | null;
};

export type SaveRepertoireItem = {
  songId: string;
  songKey: string | null;
  order: number;
  notes: string | null;
};

export type SaveRepertoireBody = {
  items: SaveRepertoireItem[];
};
