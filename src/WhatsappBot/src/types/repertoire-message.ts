export type WhatsappEventType = "ENSAIO" | "CULTO" | "APRESENTACAO";

export interface RepertoireMessage {
  eventType: WhatsappEventType;
  eventDate: string;
  songs: string[];
}

export interface WhatsappRepertoirePayload {
  eventType: WhatsappEventType;
  eventDate: string;
  songs: string[];
}

export interface WhatsappRepertoireApiResponse {
  success: boolean;
  message: string;
  eventTitle?: string | null;
  songsCount: number;
}
