"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerMessageHandler = registerMessageHandler;
const repertoire_service_1 = require("../services/repertoire.service");
const whatsapp_service_1 = require("../services/whatsapp.service");
const logger_1 = require("../utils/logger");
function registerMessageHandler() {
    whatsapp_service_1.whatsappService.setMessageHandler(async ({ groupId, text }) => {
        try {
            const result = await repertoire_service_1.repertoireService.processMessage(text);
            await whatsapp_service_1.whatsappService.sendGroupMessage(groupId, result.replyText);
        }
        catch (error) {
            const reason = error instanceof Error ? error.message : "Erro interno do bot.";
            logger_1.logger.error("Erro ao processar mensagem", reason);
            await whatsapp_service_1.whatsappService.sendGroupMessage(groupId, [
                "❌ Não foi possível registrar o repertório.",
                "",
                "Motivo:",
                reason,
            ].join("\n"));
        }
    });
}
//# sourceMappingURL=message.handler.js.map