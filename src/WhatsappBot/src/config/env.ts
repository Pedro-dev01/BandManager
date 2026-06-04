import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Variável de ambiente obrigatória não definida: ${name}`);
  }
  return value;
}

export const env = {
  whatsappGroupId: requireEnv("WHATSAPP_GROUP_ID"),
  apiUrl: requireEnv("API_URL").replace(/\/$/, ""),
  port: parseInt(process.env.PORT ?? "3001", 10),
  /** Permite processar mensagens enviadas pela própria conta (útil para testes). */
  allowFromMe: process.env.ALLOW_FROM_ME === "true",
};
