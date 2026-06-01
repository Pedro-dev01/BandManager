import type { RepertoireItem } from "@/lib/store";
import { apiFetch } from "./config";
import type { ApiRepertoireItem, SaveRepertoireBody } from "./types";

export function mapApiRepertoireToItems(items: ApiRepertoireItem[]): RepertoireItem[] {
  return items
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((item) => ({
      songId: item.songId,
      key: item.songKey ?? item.defaultKey,
      notes: item.notes ?? undefined,
    }));
}

export function mapItemsToSaveBody(items: RepertoireItem[]): SaveRepertoireBody {
  return {
    items: items.map((item, index) => ({
      songId: item.songId,
      songKey: item.key || null,
      order: index + 1,
      notes: item.notes ?? null,
    })),
  };
}

export async function fetchRepertoire(eventId: string): Promise<RepertoireItem[]> {
  const items = await apiFetch<ApiRepertoireItem[]>(`/api/events/${eventId}/repertoire`);
  return mapApiRepertoireToItems(items);
}

export async function saveRepertoire(
  eventId: string,
  items: RepertoireItem[],
): Promise<RepertoireItem[]> {
  const body = mapItemsToSaveBody(items);
  const saved = await apiFetch<ApiRepertoireItem[]>(`/api/events/${eventId}/repertoire`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
  return mapApiRepertoireToItems(saved);
}
