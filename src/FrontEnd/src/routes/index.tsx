import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { Calendar, Music2, Users, TrendingUp, Clock, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDB } from "@/lib/store";
import { PageHeader } from "@/components/page-header";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Louvor" },
      { name: "description", content: "Visão geral do ministério de louvor: próximos eventos, escala e frequência." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { db } = useDB();

  const upcoming = useMemo(
    () =>
      [...db.events]
        .filter((e) => new Date(e.date) >= new Date(new Date().toDateString()))
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, 4),
    [db.events],
  );

  const activeMembers = db.members.filter((m) => m.active).length;
  const totalAttendances = db.attendance.filter((a) => a.status === "presente").length;
  const attendanceRate = db.attendance.length
    ? Math.round((totalAttendances / db.attendance.length) * 100)
    : 0;

  const topSongs = useMemo(() => {
    const counts: Record<string, number> = {};
    db.repertoires.forEach((r) => r.items.forEach((i) => (counts[i.songId] = (counts[i.songId] ?? 0) + 1)));
    return Object.entries(counts)
      .map(([id, c]) => ({ song: db.songs.find((s) => s.id === id), count: c }))
      .filter((x) => x.song)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [db.repertoires, db.songs]);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8">
      <PageHeader
        title="Bem-vindo de volta 👋"
        description="Visão geral do ministério, próximos eventos e indicadores."
        actions={
          <Button asChild className="bg-gradient-gold text-primary-foreground shadow-glow hover:opacity-90">
            <Link to="/agenda">Novo evento</Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Próximos eventos" value={upcoming.length} icon={Calendar} accent="text-primary" />
        <StatCard label="Membros ativos" value={activeMembers} icon={Users} accent="text-chart-2" />
        <StatCard label="Músicas no acervo" value={db.songs.length} icon={Music2} accent="text-chart-3" />
        <StatCard label="Taxa de presença" value={`${attendanceRate}%`} icon={TrendingUp} accent="text-chart-4" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-border/60 bg-card/70 shadow-card backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-display text-lg">Próximos eventos</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link to="/agenda">Ver agenda</Link>
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {upcoming.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhum evento futuro programado.</p>
            )}
            {upcoming.map((e) => (
              <div
                key={e.id}
                className="group flex items-center gap-4 rounded-xl border border-border/60 bg-secondary/40 p-4 transition hover:border-primary/40 hover:bg-secondary/70"
              >
                <DateBadge date={e.date} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-medium">{e.name}</p>
                    <Badge variant="outline" className="border-primary/30 text-primary">{e.type}</Badge>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {e.time}</span>
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {e.location}</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/70 shadow-card backdrop-blur">
          <CardHeader>
            <CardTitle className="font-display text-lg">Mais tocadas</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {topSongs.length === 0 && (
              <p className="text-sm text-muted-foreground">Crie um repertório para ver o ranking.</p>
            )}
            {topSongs.map(({ song, count }, idx) => (
              <div key={song!.id} className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-sm font-semibold text-primary">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium">{song!.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{song!.artist}</p>
                </div>
                <span className="text-xs text-muted-foreground">{count}×</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
}) {
  return (
    <Card className="relative overflow-hidden border-border/60 bg-card/70 shadow-card backdrop-blur">
      <CardContent className="flex items-center gap-4 p-5">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-accent/60 ${accent}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="font-display text-2xl font-semibold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function DateBadge({ date }: { date: string }) {
  const d = new Date(date + "T00:00:00");
  const day = d.getDate().toString().padStart(2, "0");
  const month = d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
  return (
    <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl border border-primary/20 bg-gradient-to-b from-primary/15 to-transparent">
      <span className="font-display text-lg font-bold text-primary">{day}</span>
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{month}</span>
    </div>
  );
}
