import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Plus,
  X,
  Check,
  Pencil,
  MapPin,
  Repeat,
  Clock,
  AlignLeft,
  Tag,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useAgendaEvents } from "@/hooks/use-agenda-events";
import type { BandEvent, EventType, Recurrence } from "@/lib/store";

export const Route = createFileRoute("/agenda")({
  head: () => ({ meta: [{ title: "Agenda — Louvor" }] }),
  component: AgendaPage,
});

const empty: BandEvent = {
  id: "",
  name: "",
  date: new Date().toISOString().slice(0, 10),
  time: "19:00",
  location: "",
  type: "Culto",
  recurrence: "none",
  notes: "",
};

const recurrenceLabels: Record<Recurrence, string> = {
  none: "Nunca",
  daily: "Todo dia",
  weekdays: "Dias úteis (Seg-Sex)",
  weekly: "Toda semana",
  monthly: "Todo mês",
  yearly: "Todo ano",
};

const typeAccent: Record<EventType, string> = {
  Culto: "bg-primary",
  Ensaio: "bg-chart-2",
  "Evento especial": "bg-chart-3",
};

const weekdayShort = ["D", "S", "T", "Q", "Q", "S", "S"];
const monthNamesPt = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",
];

function toISO(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function startOfWeek(d: Date) {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  r.setDate(r.getDate() - r.getDay());
  return r;
}

function AgendaPage() {
  const { events, isLoading, isSaving, saveEvent, removeEvent } = useAgendaEvents();
  const [selected, setSelected] = useState(() => toISO(new Date()));
  const [weekStart, setWeekStart] = useState<Date | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<BandEvent>(empty);
  const listRef = useRef<HTMLDivElement>(null);

  // Avoid SSR hydration mismatch on Date
  useEffect(() => {
    const today = new Date();
    setWeekStart(startOfWeek(today));
    setSelected(toISO(today));
  }, []);

  const weekDays = useMemo(() => {
    if (!weekStart) return [];
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [weekStart]);

  const monthLabel = useMemo(() => {
    if (!weekStart) return "";
    const mid = new Date(weekStart);
    mid.setDate(mid.getDate() + 3);
    return monthNamesPt[mid.getMonth()];
  }, [weekStart]);

  const grouped = useMemo(() => {
    const sorted = [...events].sort(
      (a, b) => (a.date + a.time).localeCompare(b.date + b.time),
    );
    const map = new Map<string, BandEvent[]>();
    sorted.forEach((e) => {
      if (!map.has(e.date)) map.set(e.date, []);
      map.get(e.date)!.push(e);
    });
    return Array.from(map.entries());
  }, [events]);

  function openNew() {
    setEditing({ ...empty, date: selected });
    setFormOpen(true);
  }
  function openEdit(e: BandEvent) {
    setEditing(e);
    setFormOpen(true);
  }
  async function save() {
    if (!editing.name.trim()) return;
    try {
      await saveEvent(editing);
      setFormOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao salvar evento");
    }
  }
  async function remove(id: string) {
    try {
      await removeEvent(id);
      setFormOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao excluir evento");
    }
  }

  function shiftWeek(delta: number) {
    if (!weekStart) return;
    const n = new Date(weekStart);
    n.setDate(n.getDate() + delta * 7);
    setWeekStart(n);
  }

  const todayISO = weekStart ? toISO(new Date()) : "";

  return (
    <div className="-mx-4 -mt-4 flex h-[calc(100vh-2rem)] flex-col bg-background sm:mx-0 sm:mt-0 sm:h-auto sm:min-h-[80vh] sm:rounded-2xl sm:border sm:border-border/60">
      {/* Top header: month + week strip */}
      <div className="sticky top-0 z-20 border-b border-border/60 bg-background/95 px-4 pb-3 pt-3 backdrop-blur">
        <div className="mb-3 flex items-center justify-between">
          <h1 className="font-display text-2xl font-semibold capitalize">{monthLabel || "Agenda"}</h1>
          <div className="flex gap-1">
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => shiftWeek(-1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => shiftWeek(1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {weekdayShort.map((d, i) => (
            <div key={i} className="text-center text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {d}
            </div>
          ))}
          {weekDays.map((d) => {
            const iso = toISO(d);
            const isSelected = iso === selected;
            const isToday = iso === todayISO;
            const hasEvents = events.some((e) => e.date === iso);
            return (
              <button
                key={iso}
                onClick={() => setSelected(iso)}
                className="flex flex-col items-center justify-center pt-1"
              >
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition ${
                    isSelected
                      ? "bg-gradient-gold text-primary-foreground shadow-glow"
                      : isToday
                      ? "bg-primary/15 text-primary"
                      : "text-foreground"
                  }`}
                >
                  {d.getDate()}
                </span>
                <span
                  className={`mt-1 h-1 w-1 rounded-full ${
                    hasEvents ? "bg-primary" : "bg-transparent"
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Agenda list grouped by date */}
      <div ref={listRef} className="flex-1 overflow-y-auto px-4 pb-32 pt-4">
        {isLoading && (
          <p className="mt-12 text-center text-sm text-muted-foreground">Carregando eventos…</p>
        )}
        {!isLoading && grouped.length === 0 && (
          <p className="mt-12 text-center text-sm text-muted-foreground">
            Nenhum evento ainda. Toque em + para criar.
          </p>
        )}
        {grouped.map(([date, evts]) => (
          <DaySection
            key={date}
            date={date}
            events={evts}
            todayISO={todayISO}
            onOpen={openEdit}
          />
        ))}
      </div>

      {/* Floating + button */}
      <button
        onClick={openNew}
        aria-label="Novo evento"
        className="fixed bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-gold text-primary-foreground shadow-glow transition active:scale-95 sm:absolute"
      >
        <Plus className="h-6 w-6" />
      </button>

      {/* Full-screen new/edit event */}
      {formOpen && (
        <EventForm
          value={editing}
          onChange={setEditing}
          onClose={() => setFormOpen(false)}
          onSave={save}
          isSaving={isSaving}
          onDelete={editing.id ? () => remove(editing.id) : undefined}
        />
      )}
    </div>
  );
}

function DaySection({
  date,
  events,
  todayISO,
  onOpen,
}: {
  date: string;
  events: BandEvent[];
  todayISO: string;
  onOpen: (e: BandEvent) => void;
}) {
  const d = new Date(date + "T00:00:00");
  const dayLabel = `${d.getDate()} de ${monthNamesPt[d.getMonth()].toLowerCase()}`;
  const weekLabel = d.toLocaleDateString("pt-BR", { weekday: "long" });
  const relative =
    date === todayISO
      ? "Hoje"
      : date === shiftIso(todayISO, 1)
      ? "Amanhã"
      : weekLabel;

  return (
    <div className="mb-6">
      <div className="mb-3 flex items-baseline gap-2">
        <h2 className="font-display text-lg font-semibold">{dayLabel}</h2>
        <span className="text-sm capitalize text-muted-foreground">{relative}</span>
      </div>
      <div className="flex flex-col gap-3">
        {events.map((e) => (
          <button
            key={e.id}
            onClick={() => onOpen(e)}
            className="flex gap-3 rounded-xl bg-secondary/30 p-3 text-left transition hover:bg-secondary/50"
          >
            <div className="flex w-14 shrink-0 flex-col">
              <span className="font-semibold">{e.time}</span>
              <span className="text-xs text-muted-foreground">{e.type}</span>
            </div>
            <div className={`w-1 shrink-0 rounded-full ${typeAccent[e.type]}`} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{e.name}</p>
              {e.location && (
                <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3 shrink-0" /> {e.location}
                </p>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function shiftIso(iso: string, days: number) {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + days);
  return toISO(d);
}

function EventForm({
  value,
  onChange,
  onClose,
  onSave,
  isSaving,
  onDelete,
}: {
  value: BandEvent;
  onChange: (v: BandEvent) => void;
  onClose: () => void;
  onSave: () => void;
  isSaving?: boolean;
  onDelete?: () => void;
}) {
  const [recurOpen, setRecurOpen] = useState(false);
  const currentRecur: Recurrence = value.recurrence ?? "none";
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background sm:items-center sm:justify-center sm:bg-black/60 sm:p-6">
      <div className="flex h-full w-full flex-col bg-background sm:h-auto sm:max-h-[85vh] sm:max-w-2xl sm:overflow-hidden sm:rounded-2xl sm:border sm:border-border/60 sm:shadow-2xl">
      <div className="flex items-center justify-between border-b border-border/60 px-3 py-3">
        <button onClick={onClose} aria-label="Fechar" className="rounded-full p-2 hover:bg-secondary/60">
          <X className="h-5 w-5" />
        </button>
        <h2 className="font-display text-base font-semibold">
          {value.id ? "Editar evento" : "Novo evento"}
        </h2>
        <button
          onClick={onSave}
          disabled={isSaving}
          aria-label="Salvar"
          className="rounded-full p-2 text-primary hover:bg-primary/15 disabled:opacity-50"
        >
          <Check className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Title row */}
        <Row icon={<Pencil className="h-5 w-5 text-primary" />}>
          <Input
            autoFocus
            value={value.name}
            onChange={(e) => onChange({ ...value, name: e.target.value })}
            placeholder="Adicionar título"
            className="border-0 border-b border-primary/60 bg-transparent px-0 text-base shadow-none focus-visible:ring-0"
          />
        </Row>

        {/* Type */}
        <Row icon={<Tag className="h-5 w-5 text-muted-foreground" />}>
          <Select
            value={value.type}
            onValueChange={(v) => onChange({ ...value, type: v as EventType })}
          >
            <SelectTrigger className="h-auto border-0 bg-transparent px-0 py-2 text-base shadow-none focus:ring-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Culto">Culto</SelectItem>
              <SelectItem value="Ensaio">Ensaio</SelectItem>
              <SelectItem value="Evento especial">Evento especial</SelectItem>
            </SelectContent>
          </Select>
        </Row>

        {/* All day (decorative) */}
        <Row icon={<Clock className="h-5 w-5 text-muted-foreground" />}>
          <div className="flex flex-1 items-center justify-between py-2">
            <span className="text-base">Dia inteiro</span>
            <Switch checked={false} disabled />
          </div>
        </Row>

        {/* Date */}
        <Row>
          <div className="flex flex-1 items-center justify-between py-2">
            <Input
              type="date"
              value={value.date}
              onChange={(e) => onChange({ ...value, date: e.target.value })}
              className="border-0 bg-transparent px-0 text-base shadow-none focus-visible:ring-0"
            />
            <Input
              type="time"
              value={value.time}
              onChange={(e) => onChange({ ...value, time: e.target.value })}
              className="ml-2 w-28 border-0 bg-transparent px-0 text-right text-base shadow-none focus-visible:ring-0"
            />
          </div>
        </Row>

        {/* Repeat */}
        <Row icon={<Repeat className="h-5 w-5 text-muted-foreground" />}>
          <button
            type="button"
            onClick={() => setRecurOpen(true)}
            className="flex w-full items-center justify-between py-2 text-left"
          >
            <span className="text-base">Repetir</span>
            <span className="text-sm text-muted-foreground">
              {recurrenceLabels[currentRecur]}
            </span>
          </button>
        </Row>


        {/* Location */}
        <Row icon={<MapPin className="h-5 w-5 text-muted-foreground" />}>
          <Input
            value={value.location}
            onChange={(e) => onChange({ ...value, location: e.target.value })}
            placeholder="Local"
            className="border-0 bg-transparent px-0 text-base shadow-none focus-visible:ring-0"
          />
        </Row>

        {/* Description */}
        <Row icon={<AlignLeft className="h-5 w-5 text-muted-foreground" />}>
          <Textarea
            value={value.notes ?? ""}
            onChange={(e) => onChange({ ...value, notes: e.target.value })}
            placeholder="Observações"
            className="min-h-[80px] resize-none border-0 bg-transparent px-0 text-base shadow-none focus-visible:ring-0"
          />
        </Row>

        {onDelete && (
          <div className="p-4">
            <Button
              variant="ghost"
              className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={onDelete}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Excluir evento
            </Button>
          </div>
        )}
      </div>

      {recurOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-6"
          onClick={() => setRecurOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm overflow-hidden rounded-2xl border border-border/60 bg-card shadow-xl"
          >
            {(Object.keys(recurrenceLabels) as Recurrence[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  onChange({ ...value, recurrence: key });
                  setRecurOpen(false);
                }}
                className={`flex w-full items-center justify-between px-5 py-4 text-left text-base transition hover:bg-secondary/50 ${
                  key === currentRecur ? "text-primary" : "text-foreground"
                }`}
              >
                <span>{recurrenceLabels[key]}</span>
                {key === currentRecur && <Check className="h-4 w-4" />}
              </button>
            ))}
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

function Row({ icon, children }: { icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 border-b border-border/40 px-4 py-2">
      <div className="flex h-11 w-6 shrink-0 items-center justify-center">{icon}</div>
      <div className="flex-1">{children}</div>
    </div>
  );
}
