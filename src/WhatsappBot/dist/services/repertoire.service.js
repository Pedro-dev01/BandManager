"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.repertoireService = exports.RepertoireService = void 0;
const repertoire_parser_1 = require("../parsers/repertoire.parser");
const logger_1 = require("../utils/logger");
const api_service_1 = require("./api.service");
class RepertoireService {
    async processMessage(text) {
        let parsed;
        try {
            parsed = (0, repertoire_parser_1.parseRepertoireMessage)(text);
            logger_1.logger.info("Mensagem parseada", parsed);
        }
        catch (error) {
            const reason = error instanceof repertoire_parser_1.RepertoireParseError
                ? error.message
                : "Formato da mensagem inválido.";
            logger_1.logger.warn("Falha ao interpretar mensagem", reason);
            return { success: false, replyText: buildErrorReply(reason) };
        }
        try {
            const response = await api_service_1.apiService.registerRepertoire({
                eventType: parsed.eventType,
                eventDate: parsed.eventDate,
                songs: parsed.songs,
            });
            return {
                success: true,
                replyText: buildSuccessReply(parsed, response.songsCount),
            };
        }
        catch (error) {
            const reason = error instanceof Error ? error.message : "Erro desconhecido na API.";
            logger_1.logger.error("Falha ao registrar repertório na API", reason);
            return { success: false, replyText: buildErrorReply(reason) };
        }
    }
}
exports.RepertoireService = RepertoireService;
function buildSuccessReply(parsed, songsCount) {
    const eventLabel = (0, repertoire_parser_1.getEventDisplayName)(parsed.eventType);
    const dateLabel = (0, repertoire_parser_1.formatDateBr)(parsed.eventDate);
    return [
        "✅ Repertório registrado com sucesso.",
        "",
        `Evento: ${eventLabel}`,
        `Data: ${dateLabel}`,
        "",
        `${songsCount} música${songsCount === 1 ? "" : "s"} adicionada${songsCount === 1 ? "" : "s"}.`,
    ].join("\n");
}
function buildErrorReply(reason) {
    return [
        "❌ Não foi possível registrar o repertório.",
        "",
        "Motivo:",
        reason,
    ].join("\n");
}
exports.repertoireService = new RepertoireService();
//# sourceMappingURL=repertoire.service.js.map