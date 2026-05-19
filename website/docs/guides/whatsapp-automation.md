---
sidebar_position: 2
title: WhatsApp automation
description: Send templates, route inbound messages, and let AI draft replies.
---

# WhatsApp automation

WhatsApp is the customer channel for Italian SMEs. Bottega Digitale uses the **WhatsApp Cloud API** (Meta) directly — no third-party BSP — and supports message templates, inbound webhooks, and an opt-in AI assistant.

## 1. Connect your WhatsApp Business Account

1. Create a Meta Business app at [developers.facebook.com](https://developers.facebook.com).
2. Add the **WhatsApp** product. Note your *Phone Number ID* and *Permanent Access Token*.
3. Add the keys to `.env`:

   ```bash
   WHATSAPP_TOKEN="EAAJ..."
   WHATSAPP_PHONE_NUMBER_ID="123456789012345"
   WHATSAPP_VERIFY_TOKEN="any-random-string"
   WHATSAPP_BUSINESS_ACCOUNT_ID="9876..."
   ```

4. Point Meta's webhook at:

   ```
   POST https://<your-domain>/api/whatsapp/webhook
   ```

   Use `WHATSAPP_VERIFY_TOKEN` as the verify token in the Meta console.

The `/api/whatsapp/webhook` handler validates Meta's `X-Hub-Signature-256` header against your token. Inbound messages are persisted to `WhatsAppMessage` and emitted as `whatsapp.message.received` on the event bus.

## 2. Get templates approved by Meta

Meta requires templates to be **approved** before they can be sent to customers who haven't messaged you in the last 24 hours. Bottega Digitale ships with a starter set you can copy:

| Template name | Use | Languages |
| --- | --- | --- |
| `bd_confirmation_it` | Booking confirmation | it, en |
| `bd_reminder_it` | T-24h reminder | it, en |
| `bd_cancellation_it` | Cancellation notice | it, en |
| `bd_review_request_it` | Post-visit review nudge | it, en |
| `bd_otp_it` | OTP login code | it, en |

Submit each template via the Meta Business Manager UI or via the API:

```bash
curl -X POST http://localhost:3000/api/whatsapp/templates \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "bd_confirmation_it",
    "language": "it",
    "category": "UTILITY",
    "components": [
      {"type": "BODY", "text": "Ciao {{1}}, la tua prenotazione del {{2}} alle {{3}} è confermata. Codice: {{4}}"}
    ]
  }'
```

## 3. Send a template

Once approved, send a template to a customer:

```ts
import {sendTemplate} from '@/lib/whatsapp';

await sendTemplate({
  businessId,
  to: '+39333...',
  template: 'bd_confirmation_it',
  language: 'it',
  variables: [customer.name, formatDate(booking.startsAt), formatTime(booking.startsAt), booking.confirmationCode],
});
```

This writes a `WhatsAppMessage` row with `status: QUEUED`, posts to Meta, and updates the row to `SENT` or `FAILED`.

## 4. Build automation rules

Automation rules connect events to actions in a no-code way. The merchant configures them from **Settings → Automations**. Internally they are stored as JSON in the `Automation` model and evaluated by `lib/event-router.ts`.

Example: "When a booking is completed, send a review request after 2 hours."

```json
{
  "name": "Review nudge",
  "trigger": "booking.completed",
  "delaySeconds": 7200,
  "actions": [
    {
      "type": "whatsapp.template",
      "template": "bd_review_request_it",
      "variables": ["{{customer.name}}", "{{business.name}}"]
    }
  ]
}
```

The delay is implemented by enqueueing a job; see [Event bus](../concepts/event-bus#durability-retries-and-dead-letters).

## 5. Let AI draft replies (optional)

If `OPENAI_API_KEY` is configured, the AI router (`lib/whatsapp-ai.ts`) generates **draft** replies for inbound messages and surfaces them in the dashboard inbox. The merchant approves or edits before sending — the AI never sends autonomously.

Enable from **Settings → AI** → toggle *Bozze automatiche WhatsApp*.

The prompt is built from:
- the customer's last 10 messages,
- the merchant's services and prices,
- the merchant's "tone of voice" preset (default: *cordiale, locale*),
- today's availability for any service mentioned by the customer.

## Webhook signature verification

Every webhook is verified:

```ts
// src/app/api/whatsapp/webhook/route.ts
const signature = req.headers.get('x-hub-signature-256');
if (!verifySignature(body, signature, env.WHATSAPP_TOKEN)) {
  return new Response('Invalid signature', {status: 401});
}
```

Never disable this check in production.

## Without keys: dev mode

With no `WHATSAPP_TOKEN`, the same calls succeed but route to `lib/notifications.ts → logToStdout()`. You will see messages like:

```text
[whatsapp:dev] → +39333... template=bd_confirmation_it vars=["Luca","12/04","10:30","BD-7H42"]
```

This is intentional: you can build and test automation locally without Meta credentials.

## See also

- [Online booking](./online-booking) — what triggers messages
- [Webhooks reference](../reference/webhooks) — outbound webhooks for your own integrations
