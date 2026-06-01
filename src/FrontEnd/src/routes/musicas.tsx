import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Search, ExternalLink, Pencil, Trash2, Music2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { useDB, uid, type Song } from "@/lib/store";
import { PageHeader } from "@/components/page-header";

export const Route = createFileRoute("/musicas")({
  head: () => ({ meta: [{ title: "Músicas — Louvor" }] }),
  component: MusicasPage,
});

const empty: Song = { id: "", name: "", artist: "", key: "C", bpm: 0, category: "Adoração" };

function MusicasPage() {
  const { db, update } = useDB();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Song>(empty);

  const filtered = useMemo(
    () =>
      db.songs.filter(
        (s) =>
          s.name.toLowerCase().includes(q.toLowerCase()) ||
          s.artist.toLowerCase().includes(q.toLowerCase()),
      ),
    [db.songs, q],
  );

  function save() {
    if (!editing.name.trim()) return;
    const exists = db.songs.some((s) => s.id === editing.id);
    const next = exists
      ? db.songs.map((s) => (s.id === editing.id ? editing : s))
      : [...db.songs, { ...editing, id: uid() }];
    update({ songs: next });
    setOpen(false);
  }

  function remove(id: string) {
    update({ songs: db.songs.filter((s) => s.id !== id) });
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <PageHeader
        title="Músicas"
        description="Acervo do ministério com tom, BPM, cifras e playbacks."
        actions={
          <>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar..." className="pl-9 w-56" />
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => setEditing({ ...empty })}
                  className="bg-gradient-gold text-primary-foreground shadow-glow hover:opacity-90"
                >
                  <Plus className="mr-1 h-4 w-4" /> Nova música
                </Button>
              </DialogTrigger>
              <SongDialog editing={editing} setEditing={setEditing} onSave={save} />
            </Dialog>
          </>
        }
      />

      <Card className="border-border/60 bg-card/70 shadow-card backdrop-blur">
        <CardContent className="p-0">
          <div className="divide-y divide-border/60">
            {filtered.map((s) => (
              <div key={s.id} className="group flex items-center gap-4 p-4 transition hover:bg-secondary/40">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/60 text-primary">
                  <Music2 className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate font-medium">{s.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{s.artist}</p>
                </div>
                <div className="hidden sm:flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="border-primary/30 text-primary font-mono">{s.key}</Badge>
                  {!!s.bpm && <Badge variant="outline">{s.bpm} BPM</Badge>}
                  <Badge variant="secondary">{s.category}</Badge>
                </div>
                <div className="flex items-center gap-1">
                  {s.chordsUrl && (
                    <Button asChild size="sm" variant="ghost">
                      <a href={s.chordsUrl} target="_blank" rel="noreferrer"><ExternalLink className="h-3 w-3" /></a>
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => { setEditing(s); setOpen(true); }}>
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => remove(s.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="p-6 text-center text-sm text-muted-foreground">Nenhuma música encontrada.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SongDialog({
  editing,
  setEditing,
  onSave,
}: {
  editing: Song;
  setEditing: (s: Song) => void;
  onSave: () => void;
}) {
  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>{editing.id ? "Editar música" : "Nova música"}</DialogTitle>
      </DialogHeader>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nome" className="sm:col-span-2">
          <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
        </Field>
        <Field label="Artista">
          <Input value={editing.artist} onChange={(e) => setEditing({ ...editing, artist: e.target.value })} />
        </Field>
        <Field label="Categoria">
          <Input value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} />
        </Field>
        <Field label="Tom">
          <Input value={editing.key} onChange={(e) => setEditing({ ...editing, key: e.target.value })} />
        </Field>
        <Field label="BPM">
          <Input type="number" value={editing.bpm ?? 0} onChange={(e) => setEditing({ ...editing, bpm: Number(e.target.value) })} />
        </Field>
        <Field label="Link da cifra" className="sm:col-span-2">
          <Input value={editing.chordsUrl ?? ""} onChange={(e) => setEditing({ ...editing, chordsUrl: e.target.value })} placeholder="https://..." />
        </Field>
        <Field label="Link do playback" className="sm:col-span-2">
          <Input value={editing.playbackUrl ?? ""} onChange={(e) => setEditing({ ...editing, playbackUrl: e.target.value })} placeholder="Spotify / YouTube" />
        </Field>
        <Field label="Observações" className="sm:col-span-2">
          <Textarea value={editing.notes ?? ""} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} />
        </Field>
      </div>
      <DialogFooter>
        <Button onClick={onSave} className="bg-gradient-gold text-primary-foreground shadow-glow hover:opacity-90">
          Salvar
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className ?? ""}`}>
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
