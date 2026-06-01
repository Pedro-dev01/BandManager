import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchEvents } from "@/lib/api/events";
import { eventsKeys } from "@/lib/api/events-keys";
import { fetchRepertoire, saveRepertoire } from "@/lib/api/repertoire";
import { fetchSongs } from "@/lib/api/songs";
import type { RepertoireItem } from "@/lib/store";

const EMPTY_EVENTS: Awaited<ReturnType<typeof fetchEvents>> = [];
const EMPTY_SONGS: Awaited<ReturnType<typeof fetchSongs>> = [];
const EMPTY_ITEMS: RepertoireItem[] = [];

export const repertoireKeys = {
  events: eventsKeys.all,
  songs: ["songs"] as const,
  repertoire: (eventId: string) => ["repertoire", eventId] as const,
};

export function useRepertoirePage(eventId: string | null) {
  const queryClient = useQueryClient();

  const eventsQuery = useQuery({
    queryKey: repertoireKeys.events,
    queryFn: fetchEvents,
  });

  const songsQuery = useQuery({
    queryKey: repertoireKeys.songs,
    queryFn: fetchSongs,
  });

  const repertoireQuery = useQuery({
    queryKey: repertoireKeys.repertoire(eventId ?? ""),
    queryFn: () => fetchRepertoire(eventId!),
    enabled: Boolean(eventId),
  });

  const saveMutation = useMutation({
    mutationFn: ({ eventId: id, items }: { eventId: string; items: RepertoireItem[] }) =>
      saveRepertoire(id, items),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(repertoireKeys.repertoire(variables.eventId), data);
    },
  });

  return {
    events: eventsQuery.data ?? EMPTY_EVENTS,
    songs: songsQuery.data ?? EMPTY_SONGS,
    items: repertoireQuery.data ?? EMPTY_ITEMS,
    repertoireData: repertoireQuery.data,
    isLoading: eventsQuery.isLoading || songsQuery.isLoading || repertoireQuery.isLoading,
    isSaving: saveMutation.isPending,
    error:
      (eventsQuery.error ??
        songsQuery.error ??
        repertoireQuery.error ??
        saveMutation.error) ??
      null,
    saveItems: (id: string, items: RepertoireItem[]) => saveMutation.mutateAsync({ eventId: id, items }),
    refetchRepertoire: repertoireQuery.refetch,
  };
}
