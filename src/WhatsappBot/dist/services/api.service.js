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
exports.apiService = exports.ApiService = void 0;
const axios_1 = __importStar(require("axios"));
const https_1 = __importDefault(require("https"));
const env_1 = require("../config/env");
const logger_1 = require("../utils/logger");
function isLocalApiUrl(url) {
    return /localhost|127\.0\.0\.1/i.test(url);
}
class ApiService {
    client = axios_1.default.create({
        baseURL: env_1.env.apiUrl,
        timeout: 30_000,
        headers: { "Content-Type": "application/json" },
        // Aceita certificado dev se API_URL for https local (ex.: https://localhost:7142)
        ...(isLocalApiUrl(env_1.env.apiUrl)
            ? { httpsAgent: new https_1.default.Agent({ rejectUnauthorized: false }) }
            : {}),
    });
    async registerRepertoire(payload) {
        logger_1.logger.info("Enviando repertório para a API", payload);
        try {
            const { data } = await this.client.post("/api/whatsapp/repertoire", payload);
            return data;
        }
        catch (error) {
            throw this.toApiError(error);
        }
    }
    toApiError(error) {
        if ((0, axios_1.isAxiosError)(error)) {
            const message = error.response?.data?.message ??
                error.message;
            return new Error(message);
        }
        return error instanceof Error ? error : new Error(String(error));
    }
}
exports.ApiService = ApiService;
exports.apiService = new ApiService();
//# sourceMappingURL=api.service.js.map