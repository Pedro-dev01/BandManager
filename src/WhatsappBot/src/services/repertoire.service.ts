import {
  formatDateBr,
  getEventDisplayName,
  parseRepertoireMessage,
  RepertoireParseError,
} from "../parsers/repertoire.parser";
import type { RepertoireMessage } from "../types/repertoire-message";
import { logger } from "../utils/logger";
import { apiService } from "./api.service";

export interface RepertoireProcessResult {
  success: boolean;
  replyText: string;
}

export class RepertoireService {
  async processMessage(text: string): Promise<RepertoireProcessResult> {
    let parsed: RepertoireMessage;

    try {
      parsed = parseRepertoireMessage(text);
      logger.info("Mensagem parseada", parsed);
    } catch (error) {
      const reason =
        error instanceof RepertoireParseError
          ? error.message
          : "Formato da mensagem inválido.";
      logger.warn("Falha ao interpretar mensagem", reason);
      return { success: false, replyText: buildErrorReply(reason) };
    }

    try {
      const response = await apiService.registerRepertoire({
        eventType: parsed.eventType,
        eventDate: parsed.eventDate,
        songs: parsed.songs,
      });

      return {
        success: true,
        replyText: buildSuccessReply(parsed, response.songsCount),
      };
    } catch (error) {
      const reason =
        error instanceof Error ? error.message : "Erro desconhecido na API.";
      logger.error("Falha ao registrar repertório na API", reason);
      return { success: false, replyText: buildErrorReply(reason) };
    }
  }
}

function buildSuccessReply(parsed: RepertoireMessage, songsCount: number): string {
  const eventLabel = getEventDisplayName(parsed.eventType);
  const dateLabel = formatDateBr(parsed.eventDate);

  return [
    "✅ Repertório registrado com sucesso.",
    "",
    `Evento: ${eventLabel}`,
    `Data: ${dateLabel}`,
    "",
    `${songsCount} música${songsCount === 1 ? "" : "s"} adicionada${songsCount === 1 ? "" : "s"}.`,
  ].join("\n");
}

function buildErrorReply(reason: string): string {
  return [
    "❌ Não foi possível registrar o repertório.",
    "",
    "Motivo:",
    reason,
  ].join("\n");
}

export const repertoireService = new RepertoireService();
