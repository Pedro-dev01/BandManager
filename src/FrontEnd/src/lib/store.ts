import { useEffect, useState, useCallback } from "react";

export type Member = {
  id: string;
  name: string;
  photo?: string;
  phone?: string;
  instrument: string;
  role: string;
  voice?: "Soprano" | "Contralto" | "Tenor" | "Barítono" | "Baixo" | "—";
  active: boolean;
  joinedAt: string;
  notes?: string;
};

export type Song = {
  id: string;
  name: string;
  artist: string;
  key: string;
  bpm?: number;
  category: string;
  chordsUrl?: string;
  playbackUrl?: string;
  notes?: string;
};

export type EventType = "Culto" | "Ensaio" | "Evento especial";
export type Recurrence =
  | "none"
  | "daily"
  | "weekdays"
  | "weekly"
  | "monthly"
  | "yearly";
export type BandEvent = {
  id: string;
  name: string;
  date: string; // ISO date
  time: string; // HH:mm
  location: string;
  type: EventType;
  recurrence?: Recurrence;
  notes?: string;
};

export type RepertoireItem = {
  songId: string;
  key: string;
  leaderId?: string;
  notes?: string;
};
export type Repertoire = {
  eventId: string;
  items: RepertoireItem[];
};

export type AttendanceStatus = "presente" | "atraso" | "falta" | "justificada";
export type Attendance = {
  eventId: string;
  memberId: string;
  status: AttendanceStatus;
};

type DB = {
  members: Member[];
  songs: Song[];
  events: BandEvent[];
  repertoires: Repertoire[];
  attendance: Attendance[];
};

const KEY = "louvor.db.v1";

const seed: DB = {
  members: [
    { id: "m1", name: "Lucas Almeida", instrument: "Violão", role: "Ministro", voice: "Tenor", active: true, joinedAt: "2023-01-10", phone: "(11) 99999-1111" },
    { id: "m2", name: "Marina Costa", instrument: "Vocal", role: "Backing", voice: "Soprano", active: true, joinedAt: "2023-03-22", phone: "(11) 99999-2222" },
    { id: "m3", name: "Pedro Souza", instrument: "Bateria", role: "Instrumentista", voice: "—", active: true, joinedAt: "2022-08-05" },
    { id: "m4", name: "Ana Ribeiro", instrument: "Teclado", role: "Instrumentista", voice: "Contralto", active: true, joinedAt: "2024-02-14" },
    { id: "m5", name: "João Mendes", instrument: "Baixo", role: "Instrumentista", voice: "Barítono", active: false, joinedAt: "2021-11-30" },
  ],
  songs: [
    { id: "s1", name: "Lugar Secreto", artist: "Gabriela Rocha", key: "G", bpm: 72, category: "Adoração" },
    { id: "s2", name: "Oceanos", artist: "Hillsong", key: "D", bpm: 70, category: "Adoração" },
    { id: "s3", name: "Reckless Love", artist: "Cory Asbury", key: "E", bpm: 78, category: "Adoração" },
    { id: "s4", name: "Som do Céu", artist: "Casa Worship", key: "C", bpm: 124, category: "Celebração" },
    { id: "s5", name: "Tua Graça Me Basta", artist: "Davi Sacer", key: "A", bpm: 76, category: "Adoração" },
  ],
  events: [
    { id: "e1", name: "Culto Dominical", date: nextDateISO(0, 0), time: "19:00", location: "Templo Principal", type: "Culto" },
    { id: "e2", name: "Ensaio Geral", date: nextDateISO(0, -2), time: "20:00", location: "Sala de Música", type: "Ensaio" },
    { id: "e3", name: "Vigília de Oração", date: nextDateISO(0, 5), time: "22:00", location: "Templo Principal", type: "Evento especial" },
  ],
  repertoires: [
    { eventId: "e1", items: [
      { songId: "s1", key: "G", leaderId: "m1" },
      { songId: "s2", key: "D", leaderId: "m2" },
      { songId: "s5", key: "A", leaderId: "m1" },
    ]},
  ],
  attendance: [
    { eventId: "e2", memberId: "m1", status: "presente" },
    { eventId: "e2", memberId: "m2", status: "presente" },
    { eventId: "e2", memberId: "m3", status: "atraso" },
    { eventId: "e2", memberId: "m4", status: "falta" },
  ],
};

function nextDateISO(weeksAhead: number, daysOffset: number) {
  const d = new Date();
  d.setDate(d.getDate() + weeksAhead * 7 + daysOffset);
  return d.toISOString().slice(0, 10);
}

function read(): DB {
  if (typeof window === "undefined") return seed;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      localStorage.setItem(KEY, JSON.stringify(seed));
      return seed;
    }
    return JSON.parse(raw) as DB;
  } catch {
    return seed;
  }
}

function write(db: DB) {
  localStorage.setItem(KEY, JSON.stringify(db));
  window.dispatchEvent(new Event("louvor:update"));
}

export function useDB() {
  const [db, setDb] = useState<DB>(seed);
  useEffect(() => {
    setDb(read());
    const handler = () => setDb(read());
    window.addEventListener("louvor:update", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("louvor:update", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  const update = useCallback((patch: Partial<DB>) => {
    const next = { ...read(), ...patch };
    write(next);
    setDb(next);
  }, []);

  return { db, update };
}

export function uid() {
  return Math.random().toString(36).slice(2, 10);
}
