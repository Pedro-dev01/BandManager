import type { RepertoireMessage, WhatsappEventType } from "../types/repertoire-message";

const HEADER_PATTERN = /^#REPERTORIO\s*$/i;
const EVENT_LINE_PATTERN =
  /^#(ENSAIO|CULTO|APRESENTACAO)\s*-\s*(\d{2})\/(\d{2})\/(\d{4})\s*$/i;
const SONG_LINE_PATTERN = /^\*\s+(.+)$/;

const EVENT_DISPLAY: Record<WhatsappEventType, string> = {
  ENSAIO: "Ensaio",
  CULTO: "Culto",
  APRESENTACAO: "Apresentação",
};

export function getEventDisplayName(eventType: WhatsappEventType): string {
  return EVENT_DISPLAY[eventType];
}

export function formatDateBr(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
}

export class RepertoireParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RepertoireParseError";
  }
}

export function parseRepertoireMessage(text: string): RepertoireMessage {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) {
    throw new RepertoireParseError("Mensagem vazia.");
  }

  if (!HEADER_PATTERN.test(lines[0])) {
    throw new RepertoireParseError('A mensagem deve começar com "#REPERTORIO".');
  }

  if (lines.length < 2) {
    throw new RepertoireParseError(
      'Informe a linha do evento, ex.: "#ENSAIO - 07/06/2026".',
    );
  }

  const eventMatch = EVENT_LINE_PATTERN.exec(lines[1]);
  if (!eventMatch) {
    throw new RepertoireParseError(
      'Linha do evento inválida. Use: "#ENSAIO - 07/06/2026" (tipos: ENSAIO, CULTO, APRESENTACAO).',
    );
  }

  const eventType = eventMatch[1].toUpperCase() as WhatsappEventType;
  const day = eventMatch[2];
  const month = eventMatch[3];
  const year = eventMatch[4];
  const eventDate = `${year}-${month}-${day}`;

  const songs: string[] = [];
  for (let i = 2; i < lines.length; i++) {
    const songMatch = SONG_LINE_PATTERN.exec(lines[i]);
    if (!songMatch) {
      throw new RepertoireParseError(
        `Linha inválida: "${lines[i]}". Use "* Nome da música" para cada música.`,
      );
    }
    songs.push(songMatch[1].trim());
  }

  if (songs.length === 0) {
    throw new RepertoireParseError("Informe ao menos uma música com o prefixo *.");
  }

  return { eventType, eventDate, songs };
}
