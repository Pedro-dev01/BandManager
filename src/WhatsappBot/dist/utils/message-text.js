"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMessageText = getMessageText;
const baileys_1 = require("@whiskeysockets/baileys");
function getMessageText(message) {
    if (!message)
        return "";
    const content = (0, baileys_1.extractMessageContent)(message);
    if (!content)
        return "";
    return (content.conversation ??
        content.extendedTextMessage?.text ??
        content.imageMessage?.caption ??
        content.videoMessage?.caption ??
        content.documentMessage?.caption ??
        "");
}
//# sourceMappingURL=message-text.js.map