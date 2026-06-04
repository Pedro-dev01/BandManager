import { repertoireService } from "../services/repertoire.service";
import { whatsappService } from "../services/whatsapp.service";
import { logger } from "../utils/logger";

export function registerMessageHandler(): void {
  whatsappService.setMessageHandler(async ({ groupId, text }) => {
    try {
      const result = await repertoireService.processMessage(text);
      await whatsappService.sendGroupMessage(groupId, result.replyText);
    } catch (error) {
      const reason =
        error instanceof Error ? error.message : "Erro interno do bot.";
      logger.error("Erro ao processar mensagem", reason);
      await whatsappService.sendGroupMessage(
        groupId,
        [
          "❌ Não foi possível registrar o repertório.",
          "",
          "Motivo:",
          reason,
        ].join("\n"),
      );
    }
  });
}
