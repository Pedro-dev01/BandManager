# BandManager WhatsAppBot

Microserviço Node.js que monitora um grupo do WhatsApp e importa repertórios para o BandManager quando alguém envia uma mensagem no formato `#REPERTORIO`.

## Pré-requisitos

- Node.js 20+
- API BandManager em execução (`http://localhost:5102` por padrão)
- Conta WhatsApp para parear via QR Code

## Instalação

```bash
cd src/WhatsappBot
npm install
cp .env.example .env
```

Edite o `.env`:

| Variável | Descrição |
|----------|-----------|
| `WHATSAPP_GROUP_ID` | JID do grupo (ex.: `120363...@g.us`) |
| `API_URL` | URL da API .NET (ex.: `http://localhost:5102`) |
| `PORT` | Reservado para uso futuro (health check) |
| `ALLOW_FROM_ME` | `true` para processar suas mensagens (teste sozinho) |

## Obter o ID do grupo

1. Use um placeholder em `WHATSAPP_GROUP_ID` (ex.: `000000000000000000@g.us`).
2. Defina `ALLOW_FROM_ME=true` no `.env`.
3. Rode o bot e envie **qualquer mensagem** no grupo de teste.
4. No terminal aparecerá: `Mensagem em grupo detectada — ID: 120363...@g.us`.
5. Copie esse ID para `WHATSAPP_GROUP_ID`, reinicie o bot.

## Execução

```bash
# Desenvolvimento (hot reload via tsx)
npm run dev

# Produção
npm run build
npm start
```

Na primeira execução, escaneie o QR Code exibido no terminal. A sessão fica salva em `auth/` (não versionada).

## Formato da mensagem

```
#REPERTORIO
#ENSAIO - 07/06/2026

* Música 1
* Música 2
* Música 3
```

Tipos aceitos: `ENSAIO`, `CULTO`, `APRESENTACAO` (mapeado para evento especial / TocarFora na API).

## API utilizada

`POST {API_URL}/api/whatsapp/repertoire`

```json
{
  "eventType": "ENSAIO",
  "eventDate": "2026-06-07",
  "songs": ["Música 1", "Música 2"]
}
```

- O evento deve existir na agenda com o mesmo tipo e data.
- Músicas inexistentes são criadas automaticamente no cadastro.

## Teste manual

1. Inicie a API: `dotnet run` em `src/Backend/BandMananger`.
2. Crie um evento **Ensaio** na data usada na mensagem (ou use a data de um evento já cadastrado).
3. Configure o `.env` e execute `npm run dev`.
4. Envie a mensagem de exemplo no grupo configurado.
5. O bot deve responder com confirmação ou erro em português.

## Estrutura

```
src/
├── config/env.ts
├── handlers/message.handler.ts
├── parsers/repertoire.parser.ts
├── services/
│   ├── api.service.ts
│   ├── repertoire.service.ts
│   └── whatsapp.service.ts
├── types/repertoire-message.ts
├── utils/logger.ts
└── index.ts
auth/          # sessão Baileys (gerada em runtime)
```
