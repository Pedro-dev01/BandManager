import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createEvent, deleteEvent, fetchEvents, updateEvent } from "@/lib/api/events";
import { eventsKeys } from "@/lib/api/events-keys";
import type { BandEvent } from "@/lib/store";

export { eventsKeys };

export function useAgendaEvents() {
  const queryClient = useQueryClient();

  const eventsQuery = useQuery({
    queryKey: eventsKeys.all,
    queryFn: fetchEvents,
  });

  const createMutation = useMutation({
    mutationFn: (event: BandEvent) => createEvent(event),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventsKeys.all });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (event: BandEvent) => updateEvent(event),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventsKeys.all });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventsKeys.all });
    },
  });

  const isSaving =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

  async function saveEvent(event: BandEvent): Promise<BandEvent> {
    if (event.id) {
      return updateMutation.mutateAsync(event);
    }
    return createMutation.mutateAsync(event);
  }

  async function removeEvent(id: string): Promise<void> {
    await deleteMutation.mutateAsync(id);
  }

  return {
    events: eventsQuery.data ?? [],
    isLoading: eventsQuery.isLoading,
    isSaving,
    error:
      eventsQuery.error ??
      createMutation.error ??
      updateMutation.error ??
      deleteMutation.error,
    saveEvent,
    removeEvent,
  };
}
