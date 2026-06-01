import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  Music2,
  Calendar,
  ListMusic,
  ClipboardCheck,
  Sparkles,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";

const items = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Agenda", url: "/agenda", icon: Calendar },
  { title: "Repertórios", url: "/repertorios", icon: ListMusic },
  { title: "Músicas", url: "/musicas", icon: Music2 },
  { title: "Membros", url: "/membros", icon: Users },
  { title: "Presença", url: "/presenca", icon: ClipboardCheck },
];

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (url: string) => (url === "/" ? pathname === "/" : pathname.startsWith(url));

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-2 px-2 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-gold shadow-glow">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span className="font-display text-base font-semibold tracking-tight">Louvor</span>
            <span className="text-[11px] text-muted-foreground">Gestão da Banda</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                    <Link to={item.url} className="flex items-center gap-3">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-2 py-2 group-data-[collapsible=icon]:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-xs font-semibold">
            AD
          </div>
          <div className="flex flex-col text-xs">
            <span className="font-medium">Admin</span>
            <span className="text-muted-foreground">Ministério</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
