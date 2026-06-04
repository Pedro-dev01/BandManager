"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const env_1 = require("./config/env");
const message_handler_1 = require("./handlers/message.handler");
const whatsapp_service_1 = require("./services/whatsapp.service");
const logger_1 = require("./utils/logger");
async function main() {
    logger_1.logger.info("Iniciando BandManager WhatsAppBot...");
    logger_1.logger.info(`API: ${env_1.env.apiUrl}`);
    logger_1.logger.info(`Grupo monitorado: ${env_1.env.whatsappGroupId}`);
    if (env_1.env.allowFromMe) {
        logger_1.logger.info("ALLOW_FROM_ME ativo — mensagens suas no grupo serão processadas");
    }
    else {
        logger_1.logger.warn("ALLOW_FROM_ME desativado — só processa mensagens de outros participantes");
    }
    (0, message_handler_1.registerMessageHandler)();
    await whatsapp_service_1.whatsappService.connect();
}
main().catch((error) => {
    logger_1.logger.error("Falha fatal ao iniciar o bot", error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map