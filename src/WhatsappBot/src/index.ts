import { env } from "./config/env";
import { registerMessageHandler } from "./handlers/message.handler";
import { whatsappService } from "./services/whatsapp.service";
import { logger } from "./utils/logger";

async function main(): Promise<void> {
  logger.info("Iniciando BandManager WhatsAppBot...");
  logger.info(`API: ${env.apiUrl}`);
  logger.info(`Grupo monitorado: ${env.whatsappGroupId}`);
  if (env.allowFromMe) {
    logger.info("ALLOW_FROM_ME ativo — mensagens suas no grupo serão processadas");
  } else {
    logger.warn(
      "ALLOW_FROM_ME desativado — só processa mensagens de outros participantes",
    );
  }

  registerMessageHandler();
  await whatsappService.connect();
}

main().catch((error) => {
  logger.error("Falha fatal ao iniciar o bot", error);
  process.exit(1);
});
