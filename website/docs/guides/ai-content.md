---
sidebar_position: 7
title: AI content & advisor
description: Generate social posts, advisor briefings and reply drafts with OpenAI.
---

# AI content & advisor

Bottega Digitale uses OpenAI for three opt-in features:

1. **Social post generation** — turn a product photo into an Instagram caption + hashtags.
2. **Daily briefing** — a 60-second morning summary of the day ahead.
3. **WhatsApp reply drafts** — see the [WhatsApp guide](./whatsapp-automation#5-let-ai-draft-replies-optional).

All three are **optional** and **never autonomous**: AI drafts; the human approves. The merchant can toggle each feature individually in **Settings → AI**.

## 1. Configure OpenAI

```bash
OPENAI_API_KEY="sk-..."
OPENAI_MODEL_FAST="gpt-4o-mini"        # cheap drafts
OPENAI_MODEL_BRIEFING="gpt-4o"         # daily briefing only
```

Costs are tracked per merchant. The dashboard surfaces monthly spend at **Settings → AI → Utilizzo**.

## 2. Generate a social post

The merchant uploads a product photo from the dashboard:

```bash
curl -X POST http://localhost:3000/api/ai/social-post \
  -F image=@cornetto.jpg \
  -F productId=prd_cornetto \
  -F tone=cordiale \
  -F platform=instagram
```

Response:

```json
{
  "caption": "Cornetti appena sfornati, ancora caldi 🥐 Vieni a prenderne uno per colazione — siamo aperti dalle 7:00 in Via Roma 42. #forli #colazione #panificio",
  "hashtags": ["#forli", "#colazione", "#panificio", "#cornetti", "#fattoamano"],
  "altText": "Vassoio di cornetti dorati con zucchero a velo"
}
```

The merchant edits if needed and clicks **Pubblica** — which either posts directly (if Google Business Profile / Instagram Graph API is connected) or copies to clipboard.

## 3. Daily briefing

Every morning at 07:00 (merchant's timezone), `lib/daily-briefing.ts` generates a one-paragraph summary delivered to the merchant via WhatsApp or push:

> "Buongiorno Marco! Oggi hai 8 appuntamenti, il primo alle 09:00 (Luca, Taglio+Barba). Ieri 6 visite (+20% vs settimana scorsa), 3 nuovi clienti. Una cliente ha lasciato una recensione 5⭐. Promemoria: scadenza fatturazione mensile fra 3 giorni."

The prompt is constructed from real database data — see `lib/ai-advisor.ts → buildBriefingContext()`. It never hallucinates appointments because the underlying data is grounded.

## 4. Reply drafts

When an inbound WhatsApp message arrives that looks like a booking request, `lib/whatsapp-ai.ts` queries availability and drafts a reply:

> Bot: *"Ciao Luca! Per giovedì alle 10:30 con Marco è libero. Vuoi che confermi io?"*

The draft appears in the inbox with two buttons: **Invia così com'è** and **Modifica**. The AI never sends without a human click.

## Tone of voice

Each merchant configures a tone preset that the prompts respect:

| Preset | Style |
| --- | --- |
| `cordiale` (default) | Warm, you-form, light emoji use |
| `formale` | You-form ("Lei"), no emoji |
| `giovanile` | Tu-form, emoji, casual |
| `tradizionale` | Tu-form, no emoji, dialectal "voi" allowed |

## Guardrails

The codebase applies hard guardrails:

- **No prices invented.** Prices are always inserted by the application layer, never asked of the model.
- **No availability invented.** Slot times are looked up first, then rendered into the prompt.
- **No PII leakage between merchants.** Each merchant's data is the only context the model sees.
- **No autonomous send.** Even when "autosend" is enabled (currently dashboard-only), there is a 60-second cancel window.

## Cost controls

- Replies use the fast model (`gpt-4o-mini`) — typical cost < €0.001 per draft.
- Briefings use `gpt-4o` — typical cost ~€0.01 per merchant per day.
- A **monthly budget cap** can be set per merchant; once hit, AI features pause until next month.

## See also

- [WhatsApp automation](./whatsapp-automation) — where reply drafts surface
- [Configuration](../reference/configuration) — OpenAI environment variables
