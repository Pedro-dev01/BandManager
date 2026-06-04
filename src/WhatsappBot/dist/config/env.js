"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(process.cwd(), ".env") });
function requireEnv(name) {
    const value = process.env[name]?.trim();
    if (!value) {
        throw new Error(`Variável de ambiente obrigatória não definida: ${name}`);
    }
    return value;
}
exports.env = {
    whatsappGroupId: requireEnv("WHATSAPP_GROUP_ID"),
    apiUrl: requireEnv("API_URL").replace(/\/$/, ""),
    port: parseInt(process.env.PORT ?? "3001", 10),
    /** Permite processar mensagens enviadas pela própria conta (útil para testes). */
    allowFromMe: process.env.ALLOW_FROM_ME === "true",
};
//# sourceMappingURL=env.js.map