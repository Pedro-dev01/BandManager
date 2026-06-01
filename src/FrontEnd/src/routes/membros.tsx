import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Search, Phone, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useDB, uid, type Member } from "@/lib/store";
import { PageHeader } from "@/components/page-header";

export const Route = createFileRoute("/membros")({
  head: () => ({ meta: [{ title: "Membros — Louvor" }] }),
  component: MembrosPage,
});

const empty: Member = {
  id: "",
  name: "",
  instrument: "",
  role: "",
  voice: "—",
  active: true,
  joinedAt: new Date().toISOString().slice(0, 10),
  phone: "",
  notes: "",
};

function MembrosPage() {
  const { db, update } = useDB();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Member>(empty);

  const filtered = useMemo(
    () =>
      db.members.filter(
        (m) =>
          m.name.toLowerCase().includes(q.toLowerCase()) ||
          m.instrument.toLowerCase().includes(q.toLowerCase()),
      ),
    [db.members, q],
  );

  function save() {
    if (!editing.name.trim()) return;
    const exists = db.members.some((m) => m.id === editing.id);
    const next = exists
      ? db.members.map((m) => (m.id === editing.id ? editing : m))
      : [...db.members, { ...editing, id: uid() }];
    update({ members: next });
    setOpen(false);
  }

  function remove(id: string) {
    update({ members: db.members.filter((m) => m.id !== id) });
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <PageHeader
        title="Membros"
        description="Gerencie integrantes, instrumentos e disponibilidade."
        actions={
          <>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar..."
                className="pl-9 w-56"
              />
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => setEditing({ ...empty })}
                  className="bg-gradient-gold text-primary-foreground shadow-glow hover:opacity-90"
                >
                  <Plus className="mr-1 h-4 w-4" /> Novo membro
                </Button>
              </DialogTrigger>
              <MemberDialog editing={editing} setEditing={setEditing} onSave={save} />
            </Dialog>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((m) => (
          <Card key={m.id} className="group border-border/60 bg-card/70 shadow-card backdrop-blur transition hover:border-primary/40">
            <CardContent className="flex flex-col gap-4 p-5">
              <div className="flex items-start gap-3">
                <Avatar className="h-12 w-12 border border-primary/30">
                  <AvatarFallback className="bg-gradient-gold text-primary-foreground font-semibold">
                    {m.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="truncate font-medium">{m.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{m.role}</p>
                </div>
                <Badge variant={m.active ? "default" : "secondary"} className={m.active ? "bg-success/20 text-success" : ""}>
                  {m.active ? "Ativo" : "Inativo"}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="border-primary/30 text-primary">{m.instrument}</Badge>
                {m.voice && m.voice !== "—" && <Badge variant="outline">{m.voice}</Badge>}
              </div>

              {m.phone && (
                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Phone className="h-3 w-3" /> {m.phone}
                </p>
              )}

              <div className="flex gap-2 border-t border-border/60 pt-3">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setEditing(m);
                    setOpen(true);
                  }}
                >
                  <Pencil className="mr-1 h-3 w-3" /> Editar
                </Button>
                <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => remove(m.id)}>
                  <Trash2 className="mr-1 h-3 w-3" /> Excluir
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-sm text-muted-foreground">Nenhum membro encontrado.</p>
      )}
    </div>
  );
}

function MemberDialog({
  editing,
  setEditing,
  onSave,
}: {
  editing: Member;
  setEditing: (m: Member) => void;
  onSave: () => void;
}) {
  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>{editing.id ? "Editar membro" : "Novo membro"}</DialogTitle>
      </DialogHeader>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nome" className="sm:col-span-2">
          <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
        </Field>
        <Field label="Instrumento">
          <Input value={editing.instrument} onChange={(e) => setEditing({ ...editing, instrument: e.target.value })} />
        </Field>
        <Field label="Função">
          <Input value={editing.role} onChange={(e) => setEditing({ ...editing, role: e.target.value })} />
        </Field>
        <Field label="Voz">
          <Input value={editing.voice} onChange={(e) => setEditing({ ...editing, voice: e.target.value as Member["voice"] })} />
        </Field>
        <Field label="Telefone">
          <Input value={editing.phone ?? ""} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} />
        </Field>
        <Field label="Data de entrada">
          <Input type="date" value={editing.joinedAt} onChange={(e) => setEditing({ ...editing, joinedAt: e.target.value })} />
        </Field>
        <Field label="Status" className="sm:col-span-2">
          <div className="flex items-center gap-3 pt-1">
            <Switch checked={editing.active} onCheckedChange={(v) => setEditing({ ...editing, active: v })} />
            <span className="text-sm text-muted-foreground">{editing.active ? "Ativo" : "Inativo"}</span>
          </div>
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
