import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Check, Clock, X, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useDB, type AttendanceStatus } from "@/lib/store";
import { PageHeader } from "@/components/page-header";

export const Route = createFileRoute("/presenca")({
  head: () => ({ meta: [{ title: "Presença — Louvor" }] }),
  component: PresencaPage,
});

const statusConfig: Record<AttendanceStatus, { label: string; icon: typeof Check; color: string }> = {
  presente: { label: "Presente", icon: Check, color: "bg-success/15 text-success border-success/30" },
  atraso: { label: "Atraso", icon: Clock, color: "bg-warning/15 text-warning border-warning/30" },
  falta: { label: "Falta", icon: X, color: "bg-destructive/15 text-destructive border-destructive/30" },
  justificada: { label: "Justificada", icon: AlertCircle, color: "bg-chart-2/15 text-chart-2 border-chart-2/30" },
};

function PresencaPage() {
  const { db, update } = useDB();
  const [eventId, setEventId] = useState<string>(db.events[0]?.id ?? "");

  function setStatus(memberId: string, status: AttendanceStatus | null) {
    const filtered = db.attendance.filter((a) => !(a.eventId === eventId && a.memberId === memberId));
    const next = status ? [...filtered, { eventId, memberId, status }] : filtered;
    update({ attendance: next });
  }

  function getStatus(memberId: string): AttendanceStatus | undefined {
    return db.attendance.find((a) => a.eventId === eventId && a.memberId === memberId)?.status;
  }

  const ranking = useMemo(() => {
    const stats: Record<string, { present: number; total: number }> = {};
    db.members.forEach((m) => (stats[m.id] = { present: 0, total: 0 }));
    db.attendance.forEach((a) => {
      if (!stats[a.memberId]) return;
      stats[a.memberId].total += 1;
      if (a.status === "presente") stats[a.memberId].present += 1;
    });
    return db.members
      .map((m) => ({
        member: m,
        ...stats[m.id],
        rate: stats[m.id].total ? Math.round((stats[m.id].present / stats[m.id].total) * 100) : 0,
      }))
      .sort((a, b) => b.rate - a.rate);
  }, [db.members, db.attendance]);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <PageHeader
        title="Presença"
        description="Registre presença, atrasos e faltas. Acompanhe a frequência da equipe."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card className="border-border/60 bg-card/70 shadow-card backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-display text-lg">Marcar presença</CardTitle>
            <Select value={eventId} onValueChange={setEventId}>
              <SelectTrigger className="w-64"><SelectValue placeholder="Evento" /></SelectTrigger>
              <SelectContent>
                {db.events.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.name} — {new Date(e.date + "T00:00:00").toLocaleDateString("pt-BR")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {db.members.filter((m) => m.active).map((m) => {
              const current = getStatus(m.id);
              return (
                <div key={m.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-border/60 bg-secondary/40 p-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-gold text-xs font-semibold text-primary-foreground">
                    {m.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium">{m.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{m.instrument}</p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {(Object.keys(statusConfig) as AttendanceStatus[]).map((s) => {
                      const cfg = statusConfig[s];
                      const Icon = cfg.icon;
                      const active = current === s;
                      return (
                        <Button
                          key={s}
                          size="sm"
                          variant="ghost"
                          onClick={() => setStatus(m.id, active ? null : s)}
                          className={`h-8 border ${active ? cfg.color : "border-transparent text-muted-foreground hover:border-border"}`}
                        >
                          <Icon className="mr-1 h-3 w-3" /> {cfg.label}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/70 shadow-card backdrop-blur">
          <CardHeader><CardTitle className="font-display text-lg">Ranking de presença</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-3">
            {ranking.map(({ member, rate, present, total }, idx) => (
              <div key={member.id} className="flex items-center gap-3">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold ${
                  idx === 0 ? "bg-gradient-gold text-primary-foreground" : "bg-accent text-primary"
                }`}>{idx + 1}</div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium">{member.name}</p>
                  <div className="mt-1 h-1.5 w-full rounded-full bg-secondary">
                    <div className="h-1.5 rounded-full bg-gradient-gold" style={{ width: `${rate}%` }} />
                  </div>
                </div>
                <Badge variant="outline" className="font-mono">{rate}%</Badge>
              </div>
            ))}
            {ranking.every((r) => r.total === 0) && (
              <p className="text-center text-sm text-muted-foreground">Sem registros ainda.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
