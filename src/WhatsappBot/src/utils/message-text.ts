import { extractMessageContent, type proto } from "@whiskeysockets/baileys";

export function getMessageText(message: proto.IMessage | null | undefined): string {
  if (!message) return "";

  const content = extractMessageContent(message);
  if (!content) return "";

  return (
    content.conversation ??
    content.extendedTextMessage?.text ??
    content.imageMessage?.caption ??
    content.videoMessage?.caption ??
    content.documentMessage?.caption ??
    ""
  );
}
