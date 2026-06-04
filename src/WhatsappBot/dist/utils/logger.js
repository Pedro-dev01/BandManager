"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
function formatMessage(level, message) {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
}
exports.logger = {
    info(message, meta) {
        console.log(formatMessage("info", message), meta ?? "");
    },
    warn(message, meta) {
        console.warn(formatMessage("warn", message), meta ?? "");
    },
    error(message, meta) {
        console.error(formatMessage("error", message), meta ?? "");
    },
    debug(message, meta) {
        if (process.env.DEBUG) {
            console.debug(formatMessage("debug", message), meta ?? "");
        }
    },
};
//# sourceMappingURL=logger.js.map