import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Music2, GripVertical, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useDB, type Repertoire, type RepertoireItem } from "@/lib/store";
import { PageHeader } from "@/components/page-header";

export const Route = createFileRoute("/repertorios")({
  head: () => ({ meta: [{ title: "Repertórios — Louvor" }] }),
  component: RepertoriosPage,
});

function RepertoriosPage() {
  const { db, update } = useDB();
  const [selectedEvent, setSelectedEvent] = useState<string>(db.events[0]?.id ?? "");
  const [songToAdd, setSongToAdd] = useState<string>("");

  const repertoire = useMemo<Repertoire>(
    () =>
      db.repertoires.find((r) => r.eventId === selectedEvent) ?? {
        eventId: selectedEvent,
        items: [],
      },
    [db.repertoires, selectedEvent],
  );

  function updateRep(items: RepertoireItem[]) {
    const exists = db.repertoires.some((r) => r.eventId === selectedEvent);
    const next = exists
      ? db.repertoires.map((r) => (r.eventId === selectedEvent ? { ...r, items } : r))
      : [...db.repertoires, { eventId: selectedEvent, items }];
    update({ repertoires: next });
  }

  function addSong() {
    if (!songToAdd) return;
    const song = db.songs.find((s) => s.id === songToAdd);
    if (!song) return;
    updateRep([...repertoire.items, { songId: song.id, key: song.key }]);
    setSongToAdd("");
  }

  function removeItem(idx: number) {
    updateRep(repertoire.items.filter((_, i) => i !== idx));
  }

  function move(idx: number, dir: -1 | 1) {
    const items = [...repertoire.items];
    const target = idx + dir;
    if (target < 0 || target >= items.length) return;
    [items[idx], items[target]] = [items[target], items[idx]];
    updateRep(items);
  }

  const event = db.events.find((e) => e.id === selectedEvent);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <PageHeader
        title="Repertórios"
        description="Monte a ordem das músicas para cada evento, com tom e líder."
      />

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <Card className="border-border/60 bg-card/70 shadow-card backdrop-blur">
          <CardHeader><CardTitle className="text-sm">Eventos</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-1 p-2">
            {db.events.map((e) => (
              <button
                key={e.id}
                onClick={() => setSelectedEvent(e.id)}
                className={`rounded-lg px-3 py-2 text-left text-sm transition ${
                  selectedEvent === e.id
                    ? "bg-gradient-gold text-primary-foreground shadow-glow"
                    : "hover:bg-secondary/60"
                }`}
              >
                <div className="font-medium truncate">{e.name}</div>
                <div className={`text-xs ${selectedEvent === e.id ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                  {new Date(e.date + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })} • {e.time}
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/70 shadow-card backdrop-blur">
          <CardHeader>
            <CardTitle className="font-display text-lg">
              {event ? event.name : "Selecione um evento"}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {event && (
              <>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Select value={songToAdd} onValueChange={setSongToAdd}>
                    <SelectTrigger className="flex-1"><SelectValue placeholder="Escolher música..." /></SelectTrigger>
                    <SelectContent>
                      {db.songs
                        .filter((s) => !repertoire.items.some((i) => i.songId === s.id))
                        .map((s) => (
                          <SelectItem key={s.id} value={s.id}>{s.name} — {s.artist}</SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={addSong} className="bg-gradient-gold text-primary-foreground shadow-glow hover:opacity-90">
                    <Plus className="mr-1 h-4 w-4" /> Adicionar
                  </Button>
                </div>

                <div className="flex flex-col gap-2">
                  {repertoire.items.length === 0 && (
                    <p className="rounded-lg border border-dashed border-border/60 p-6 text-center text-sm text-muted-foreground">
                      Nenhuma música no repertório. Adicione a primeira acima.
                    </p>
                  )}
                  {repertoire.items.map((item, idx) => {
                    const song = db.songs.find((s) => s.id === item.songId);
                    return (
                      <div key={`${item.songId}-${idx}`} className="flex items-center gap-3 rounded-xl border border-border/60 bg-secondary/40 p-3">
                        <div className="flex flex-col">
                          <button onClick={() => move(idx, -1)} className="text-muted-foreground hover:text-foreground">▲</button>
                          <GripVertical className="h-3 w-3 text-muted-foreground" />
                          <button onClick={() => move(idx, 1)} className="text-muted-foreground hover:text-foreground">▼</button>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/60 text-primary">
                          <Music2 className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="truncate font-medium">{idx + 1}. {song?.name}</p>
                          <p className="truncate text-xs text-muted-foreground">{song?.artist}</p>
                        </div>
                        <Input
                          value={item.key}
                          onChange={(e) => {
                            const items = [...repertoire.items];
                            items[idx] = { ...item, key: e.target.value };
                            updateRep(items);
                          }}
                          className="w-16 text-center font-mono"
                        />
                        <Select
                          value={item.leaderId ?? ""}
                          onValueChange={(v) => {
                            const items = [...repertoire.items];
                            items[idx] = { ...item, leaderId: v };
                            updateRep(items);
                          }}
                        >
                          <SelectTrigger className="w-40"><SelectValue placeholder="Líder" /></SelectTrigger>
                          <SelectContent>
                            {db.members.filter((m) => m.active).map((m) => (
                              <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button size="icon" variant="ghost" onClick={() => removeItem(idx)} className="text-destructive">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>

                {repertoire.items.length > 0 && (
                  <div className="flex gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline">{repertoire.items.length} música(s)</Badge>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
