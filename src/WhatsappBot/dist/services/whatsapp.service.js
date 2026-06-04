"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.whatsappService = exports.WhatsappService = void 0;
const baileys_1 = __importStar(require("@whiskeysockets/baileys"));
const pino_1 = __importDefault(require("pino"));
const qrcode_terminal_1 = __importDefault(require("qrcode-terminal"));
const path_1 = __importDefault(require("path"));
const env_1 = require("../config/env");
const message_text_1 = require("../utils/message-text");
const logger_1 = require("../utils/logger");
class WhatsappService {
    socket = null;
    messageHandler = null;
    setMessageHandler(handler) {
        this.messageHandler = handler;
    }
    async connect() {
        const authDir = path_1.default.resolve(__dirname, "../../auth");
        const { state, saveCreds } = await (0, baileys_1.useMultiFileAuthState)(authDir);
        const { version } = await (0, baileys_1.fetchLatestBaileysVersion)();
        const baileysLogger = (0, pino_1.default)({ level: "silent" });
        this.socket = (0, baileys_1.default)({
            version,
            auth: state,
            printQRInTerminal: false,
            logger: baileysLogger,
        });
        this.socket.ev.on("creds.update", saveCreds);
        this.socket.ev.on("connection.update", (update) => {
            const { connection, lastDisconnect, qr } = update;
            if (qr) {
                logger_1.logger.info("QR Code gerado. Escaneie com o WhatsApp:");
                qrcode_terminal_1.default.generate(qr, { small: true });
            }
            if (connection === "close") {
                const statusCode = lastDisconnect?.error?.output?.statusCode;
                const shouldReconnect = statusCode !== baileys_1.DisconnectReason.loggedOut;
                logger_1.logger.warn(`Conexão encerrada (código ${statusCode ?? "desconhecido"}). Reconectar: ${shouldReconnect}`);
                if (shouldReconnect) {
                    void this.connect();
                }
                else {
                    logger_1.logger.error("Sessão encerrada. Remova a pasta auth/ e escaneie o QR novamente.");
                }
            }
            else if (connection === "open") {
                logger_1.logger.info("WhatsApp conectado com sucesso.");
            }
        });
        this.socket.ev.on("messages.upsert", async ({ messages, type }) => {
            if (type !== "notify")
                return;
            for (const message of messages) {
                const remoteJid = message.key.remoteJid;
                if (!remoteJid?.endsWith("@g.us"))
                    continue;
                const fromMe = Boolean(message.key.fromMe);
                logger_1.logger.info(`Mensagem em grupo detectada — ID: ${remoteJid}${fromMe ? " (enviada por você)" : ""}`);
                if (remoteJid !== env_1.env.whatsappGroupId) {
                    logger_1.logger.warn(`Grupo ignorado. Configure no .env: WHATSAPP_GROUP_ID=${remoteJid}`);
                    continue;
                }
                if (fromMe && !env_1.env.allowFromMe) {
                    logger_1.logger.warn("Mensagem sua ignorada. Defina ALLOW_FROM_ME=true no .env para testar sozinho.");
                    continue;
                }
                const text = (0, message_text_1.getMessageText)(message.message);
                if (!text.trim().startsWith("#REPERTORIO")) {
                    logger_1.logger.info(`Mensagem no grupo certo, mas não é #REPERTORIO (texto: ${text.slice(0, 40) || "(vazio)"}...)`);
                    continue;
                }
                logger_1.logger.info(`Processando #REPERTORIO no grupo ${remoteJid}`);
                if (this.messageHandler) {
                    await this.messageHandler({ groupId: remoteJid, text });
                }
            }
        });
    }
    async sendGroupMessage(groupId, text) {
        if (!this.socket) {
            throw new Error("WhatsApp não está conectado.");
        }
        await this.socket.sendMessage(groupId, { text });
        logger_1.logger.info(`Resposta enviada ao grupo ${groupId}`);
    }
}
exports.WhatsappService = WhatsappService;
exports.whatsappService = new WhatsappService();
//# sourceMappingURL=whatsapp.service.js.map