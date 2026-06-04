import makeWASocket, {
  DisconnectReason,
  type WASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
} from "@whiskeysockets/baileys";
import pino from "pino";
import qrcode from "qrcode-terminal";
import path from "path";
import { env } from "../config/env";
import { getMessageText } from "../utils/message-text";
import { logger } from "../utils/logger";

export type MessageHandler = (params: {
  groupId: string;
  text: string;
}) => Promise<void>;

export class WhatsappService {
  private socket: WASocket | null = null;
  private messageHandler: MessageHandler | null = null;

  setMessageHandler(handler: MessageHandler): void {
    this.messageHandler = handler;
  }

  async connect(): Promise<void> {
    const authDir = path.resolve(__dirname, "../../auth");
    const { state, saveCreds } = await useMultiFileAuthState(authDir);
    const { version } = await fetchLatestBaileysVersion();
    const baileysLogger = pino({ level: "silent" });

    this.socket = makeWASocket({
      version,
      auth: state,
      printQRInTerminal: false,
      logger: baileysLogger,
    });

    this.socket.ev.on("creds.update", saveCreds);

    this.socket.ev.on("connection.update", (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        logger.info("QR Code gerado. Escaneie com o WhatsApp:");
        qrcode.generate(qr, { small: true });
      }

      if (connection === "close") {
        const statusCode = (
          lastDisconnect?.error as { output?: { statusCode?: number } } | undefined
        )?.output?.statusCode;
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

        logger.warn(
          `Conexão encerrada (código ${statusCode ?? "desconhecido"}). Reconectar: ${shouldReconnect}`,
        );

        if (shouldReconnect) {
          void this.connect();
        } else {
          logger.error("Sessão encerrada. Remova a pasta auth/ e escaneie o QR novamente.");
        }
      } else if (connection === "open") {
        logger.info("WhatsApp conectado com sucesso.");
      }
    });

    this.socket.ev.on("messages.upsert", async ({ messages, type }) => {
      if (type !== "notify") return;

      for (const message of messages) {
        const remoteJid = message.key.remoteJid;
        if (!remoteJid?.endsWith("@g.us")) continue;

        const fromMe = Boolean(message.key.fromMe);
        logger.info(
          `Mensagem em grupo detectada — ID: ${remoteJid}${fromMe ? " (enviada por você)" : ""}`,
        );

        if (remoteJid !== env.whatsappGroupId) {
          logger.warn(
            `Grupo ignorado. Configure no .env: WHATSAPP_GROUP_ID=${remoteJid}`,
          );
          continue;
        }

        if (fromMe && !env.allowFromMe) {
          logger.warn(
            "Mensagem sua ignorada. Defina ALLOW_FROM_ME=true no .env para testar sozinho.",
          );
          continue;
        }

        const text = getMessageText(message.message);

        if (!text.trim().startsWith("#REPERTORIO")) {
          logger.info(
            `Mensagem no grupo certo, mas não é #REPERTORIO (texto: ${text.slice(0, 40) || "(vazio)"}...)`,
          );
          continue;
        }

        logger.info(`Processando #REPERTORIO no grupo ${remoteJid}`);

        if (this.messageHandler) {
          await this.messageHandler({ groupId: remoteJid, text });
        }
      }
    });
  }

  async sendGroupMessage(groupId: string, text: string): Promise<void> {
    if (!this.socket) {
      throw new Error("WhatsApp não está conectado.");
    }

    await this.socket.sendMessage(groupId, { text });
    logger.info(`Resposta enviada ao grupo ${groupId}`);
  }
}

export const whatsappService = new WhatsappService();
