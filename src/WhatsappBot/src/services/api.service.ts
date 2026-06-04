import axios, { isAxiosError } from "axios";
import https from "https";
import { env } from "../config/env";
import type {
  WhatsappRepertoireApiResponse,
  WhatsappRepertoirePayload,
} from "../types/repertoire-message";
import { logger } from "../utils/logger";

function isLocalApiUrl(url: string): boolean {
  return /localhost|127\.0\.0\.1/i.test(url);
}

export class ApiService {
  private readonly client = axios.create({
    baseURL: env.apiUrl,
    timeout: 30_000,
    headers: { "Content-Type": "application/json" },
    // Aceita certificado dev se API_URL for https local (ex.: https://localhost:7142)
    ...(isLocalApiUrl(env.apiUrl)
      ? { httpsAgent: new https.Agent({ rejectUnauthorized: false }) }
      : {}),
  });

  async registerRepertoire(
    payload: WhatsappRepertoirePayload,
  ): Promise<WhatsappRepertoireApiResponse> {
    logger.info("Enviando repertório para a API", payload);

    try {
      const { data } = await this.client.post<WhatsappRepertoireApiResponse>(
        "/api/whatsapp/repertoire",
        payload,
      );
      return data;
    } catch (error) {
      throw this.toApiError(error);
    }
  }

  private toApiError(error: unknown): Error {
    if (isAxiosError(error)) {
      const message =
        (error.response?.data as { message?: string } | undefined)?.message ??
        error.message;
      return new Error(message);
    }
    return error instanceof Error ? error : new Error(String(error));
  }
}

export const apiService = new ApiService();
