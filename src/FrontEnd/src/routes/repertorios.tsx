import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Music2, GripVertical, X, Loader2 } from "lucide-react";
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
import { useDB, type RepertoireItem } from "@/lib/store";
import { PageHeader } from "@/components/page-header";
import { useRepertoirePage } from "@/hooks/use-repertoire-page";
import { toast } from "sonner";

export const Route = createFileRoute("/repertorios")({
  head: () => ({ meta: [{ title: "Repertórios — Louvor" }] }),
  component: RepertoriosPage,
});

function RepertoriosPage() {
  const { db } = useDB();
  const [selectedEvent, setSelectedEvent] = useState("");
  const [songToAdd, setSongToAdd] = useState("");
  const [localItems, setLocalItems] = useState<RepertoireItem[]>([]);
  const [leaderDraft, setLeaderDraft] = useState<Record<number, string | undefined>>({});

  const {
    events,
    songs,
    items,
    repertoireData,
    isLoading,
    isSaving,
    error,
    saveItems,
  } = useRepertoirePage(selectedEvent || null);

  useEffect(() => {
    if (!selectedEvent && events[0]?.id) setSelectedEvent(events[0].id);
  }, [events, selectedEvent]);

  useEffect(() => {
    setLocalItems(items);
    setLeaderDraft({});
  }, [selectedEvent, repertoireData, items]);

  useEffect(() => {
    if (error instanceof Error) toast.error(error.message);
  }, [error]);

  const activeEventId = selectedEvent || events[0]?.id || "";
  const event = events.find((e) => e.id === activeEventId);

  async function persist(next: RepertoireItem[]) {
    if (!activeEventId) return;
    try {
      const saved = await saveItems(activeEventId, next);
      setLocalItems(saved);
      setLeaderDraft({});
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao salvar repertório");
    }
  }

  function addSong() {
    if (!songToAdd) return;
    const song = songs.find((s) => s.id === songToAdd);
    if (!song) return;
    void persist([...localItems, { songId: song.id, key: song.key }]);
    setSongToAdd("");
  }

  function removeItem(idx: number) {
    void persist(localItems.filter((_, i) => i !== idx));
  }

  function move(idx: number, dir: -1 | 1) {
    const next = [...localItems];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    void persist(next);
  }

  function commitKey(idx: number, key: string) {
    const next = [...localItems];
    next[idx] = { ...next[idx], key };
    void persist(next);
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <PageHeader
        title="Repertórios"
        description="Monte a ordem das músicas para cada evento, com tom e líder."
      />

      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Carregando dados da API…
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <Card className="border-border/60 bg-card/70 shadow-card backdrop-blur">
          <CardHeader><CardTitle className="text-sm">Eventos</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-1 p-2">
            {events.length === 0 && !isLoading && (
              <p className="px-3 py-2 text-sm text-muted-foreground">
                Nenhum evento no banco. Inicie a API com o seed de desenvolvimento.
              </p>
            )}
            {events.map((e) => (
              <button
                key={e.id}
                type="button"
                onClick={() => setSelectedEvent(e.id)}
                className={`rounded-lg px-3 py-2 text-left text-sm transition ${
                  activeEventId === e.id
                    ? "bg-gradient-gold text-primary-foreground shadow-glow"
                    : "hover:bg-secondary/60"
                }`}
              >
                <div className="font-medium truncate">{e.name}</div>
                <div className={`text-xs ${activeEventId === e.id ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
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
                  <Select value={songToAdd || undefined} onValueChange={setSongToAdd}>
                    <SelectTrigger className="flex-1"><SelectValue placeholder="Escolher música..." /></SelectTrigger>
                    <SelectContent>
                      {songs
                        .filter((s) => !localItems.some((i) => i.songId === s.id))
                        .map((s) => (
                          <SelectItem key={s.id} value={s.id}>{s.name} — {s.artist}</SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={addSong}
                    disabled={isSaving}
                    className="bg-gradient-gold text-primary-foreground shadow-glow hover:opacity-90"
                  >
                    <Plus className="mr-1 h-4 w-4" /> Adicionar
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground">
                  Líder é exibido apenas nesta sessão (ainda não persistido na API).
                </p>

                <div className="flex flex-col gap-2">
                  {localItems.length === 0 && !isLoading && (
                    <p className="rounded-lg border border-dashed border-border/60 p-6 text-center text-sm text-muted-foreground">
                      Nenhuma música no repertório. Adicione a primeira acima.
                    </p>
                  )}
                  {localItems.map((item, idx) => {
                    const song = songs.find((s) => s.id === item.songId);
                    const leaderId = leaderDraft[idx] ?? item.leaderId ?? "";
                    return (
                      <div key={`${item.songId}-${idx}`} className="flex items-center gap-3 rounded-xl border border-border/60 bg-secondary/40 p-3">
                        <div className="flex flex-col">
                          <button type="button" onClick={() => move(idx, -1)} className="text-muted-foreground hover:text-foreground">▲</button>
                          <GripVertical className="h-3 w-3 text-muted-foreground" />
                          <button type="button" onClick={() => move(idx, 1)} className="text-muted-foreground hover:text-foreground">▼</button>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/60 text-primary">
                          <Music2 className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="truncate font-medium">{idx + 1}. {song?.name}</p>
                          <p className="truncate text-xs text-muted-foreground">{song?.artist}</p>
                        </div>
                        <Input
                          defaultValue={item.key}
                          key={`${item.songId}-${item.key}-${idx}`}
                          onBlur={(e) => {
                            if (e.target.value !== item.key) commitKey(idx, e.target.value);
                          }}
                          className="w-16 text-center font-mono"
                        />
                        <Select
                          value={leaderId || undefined}
                          onValueChange={(v) =>
                            setLeaderDraft((prev) => ({ ...prev, [idx]: v }))
                          }
                        >
                          <SelectTrigger className="w-40"><SelectValue placeholder="Líder" /></SelectTrigger>
                          <SelectContent>
                            {db.members.filter((m) => m.active).map((m) => (
                              <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => removeItem(idx)}
                          disabled={isSaving}
                          className="text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>

                {localItems.length > 0 && (
                  <div className="flex gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline">{localItems.length} música(s)</Badge>
                    {isSaving && (
                      <span className="flex items-center gap-1">
                        <Loader2 className="h-3 w-3 animate-spin" /> Salvando…
                      </span>
                    )}
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
