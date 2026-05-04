/**
 * @module event-bus
 * Automation engine connecting business events to configurable action pipelines.
 *
 * When a business event fires (e.g., `booking.created`), the engine looks up
 * matching `AutomationFlow` records and executes their action chains sequentially.
 * Actions include WhatsApp messaging, loyalty point awards, CRM updates,
 * social post generation, and insight logging.
 *
 * @example
 * ```ts
 * // Emit an event — all matching flows execute automatically
 * const results = await emitEvent({
 *   type: "booking.created",
 *   businessId: "biz_123",
 *   data: { customerName: "Marco", customerPhone: "+39 333 1234567" },
 *   timestamp: new Date(),
 * });
 *
 * // Seed default automation flows for a new business
 * await seedDefaultFlows(businessId);
 * ```
 */

// Automation Engine — Event Bus & Flow Execution
// Connects booking→loyalty→WhatsApp→CRM into configurable trigger→action pipelines

import { prisma } from "@/lib/prisma";

// ─── Event Types ────────────────────────────────────────────────

export type EventType =
  | "booking.created"
  | "booking.completed"
  | "booking.cancelled"
  | "customer.created"
  | "review.received"
  | "loyalty.threshold_reached"
  | "queue.turn_approaching";

export interface BusinessEvent {
  type: EventType;
  businessId: string;
  data: Record<string, unknown>;
  timestamp: Date;
}

// ─── Action Types ───────────────────────────────────────────────

export type ActionType =
  | "whatsapp.send_message"
  | "whatsapp.send_template"
  | "loyalty.award_points"
  | "crm.update_customer"
  | "social.generate_post"
  | "insight.log";

export interface ActionConfig {
  type: ActionType;
  params: Record<string, unknown>;
}

export interface ActionResult {
  action: ActionType;
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
}

// ─── Action Handlers ────────────────────────────────────────────

const actionHandlers: Record<ActionType, (businessId: string, params: Record<string, unknown>, eventData: Record<string, unknown>) => Promise<ActionResult>> = {
  "whatsapp.send_message": async (businessId, params, eventData) => {
    const phone = (params.phone as string) || (eventData.customerPhone as string);
    const message = (params.message as string) || "Messaggio automatico da Bottega Digitale";
    if (!phone) {
      return { action: "whatsapp.send_message", success: false, message: "Numero di telefono mancante" };
    }
    // Log the WhatsApp message (actual sending delegated to WhatsApp service)
    await prisma.whatsappMessage.create({
      data: {
        businessId,
        direction: "outbound",
        phone,
        body: message,
        status: process.env.WHATSAPP_TOKEN ? "sent" : "queued",
        templateId: null,
      },
    });
    return { action: "whatsapp.send_message", success: true, message: `Messaggio inviato a ${phone}` };
  },

  "whatsapp.send_template": async (businessId, params, eventData) => {
    const phone = (params.phone as string) || (eventData.customerPhone as string);
    const templateId = (params.templateId as string) || "booking_confirmation";
    if (!phone) {
      return { action: "whatsapp.send_template", success: false, message: "Numero di telefono mancante" };
    }
    await prisma.whatsappMessage.create({
      data: {
        businessId,
        direction: "outbound",
        phone,
        body: `[Template: ${templateId}]`,
        status: process.env.WHATSAPP_TOKEN ? "sent" : "queued",
        templateId,
      },
    });
    return { action: "whatsapp.send_template", success: true, message: `Template '${templateId}' inviato a ${phone}` };
  },

  "loyalty.award_points": async (businessId, params, eventData) => {
    const customerId = eventData.customerId as string;
    const points = (params.points as number) || 10;
    if (!customerId) {
      return { action: "loyalty.award_points", success: false, message: "Cliente non identificato" };
    }
    const card = await prisma.loyaltyCard.upsert({
      where: { businessId_customerId: { businessId, customerId } },
      update: { points: { increment: points }, totalEarned: { increment: points } },
      create: { businessId, customerId, points, totalEarned: points },
    });
    return {
      action: "loyalty.award_points",
      success: true,
      message: `+${points} punti fedeltà assegnati (totale: ${card.points})`,
      data: { cardId: card.id, newBalance: card.points },
    };
  },

  "crm.update_customer": async (_businessId, params, eventData) => {
    const customerId = eventData.customerId as string;
    if (!customerId) {
      return { action: "crm.update_customer", success: false, message: "Cliente non identificato" };
    }
    const updates: Record<string, unknown> = {};
    if (params.incrementVisits) updates.totalVisits = { increment: 1 };
    if (params.updateLastVisit) updates.lastVisit = new Date();
    await prisma.customer.update({ where: { id: customerId }, data: updates });
    return { action: "crm.update_customer", success: true, message: "Profilo cliente aggiornato" };
  },

  "social.generate_post": async (businessId, _params, eventData) => {
    await prisma.socialPost.create({
      data: {
        businessId,
        caption: `Grazie al nostro cliente! ${(eventData.customerName as string) || ""} 🎉`,
        hashtags: "#bottegadigitale,#clientefelice",
        platform: "instagram",
        status: "draft",
      },
    });
    return { action: "social.generate_post", success: true, message: "Bozza post social creata" };
  },

  "insight.log": async (_businessId, params, _eventData) => {
    return {
      action: "insight.log",
      success: true,
      message: `Evento registrato: ${(params.note as string) || "azione automatica"}`,
    };
  },
};

// ─── Pre-built Flow Templates ───────────────────────────────────

export const FLOW_TEMPLATES = [
  {
    name: "Conferma prenotazione + punti fedeltà",
    description: "Quando una prenotazione viene creata, invia conferma WhatsApp e assegna punti fedeltà",
    triggerEvent: "booking.created" as EventType,
    actions: [
      { type: "whatsapp.send_template" as ActionType, params: { templateId: "booking_confirmation" } },
      { type: "loyalty.award_points" as ActionType, params: { points: 10 } },
    ],
  },
  {
    name: "Post-visita: recensione + aggiornamento CRM",
    description: "Dopo il completamento, richiedi recensione via WhatsApp e aggiorna il profilo cliente",
    triggerEvent: "booking.completed" as EventType,
    actions: [
      { type: "whatsapp.send_template" as ActionType, params: { templateId: "review_request" } },
      { type: "crm.update_customer" as ActionType, params: { incrementVisits: true, updateLastVisit: true } },
    ],
  },
  {
    name: "Benvenuto nuovo cliente",
    description: "Quando un nuovo cliente viene creato, invia messaggio di benvenuto e assegna punti bonus",
    triggerEvent: "customer.created" as EventType,
    actions: [
      { type: "whatsapp.send_message" as ActionType, params: { message: "Benvenuto! 🎉 Grazie per aver scelto la nostra bottega. Ti abbiamo assegnato dei punti fedeltà di benvenuto!" } },
      { type: "loyalty.award_points" as ActionType, params: { points: 20 } },
    ],
  },
  {
    name: "Risposta automatica recensione",
    description: "Quando arriva una nuova recensione, genera un post social di ringraziamento",
    triggerEvent: "review.received" as EventType,
    actions: [
      { type: "social.generate_post" as ActionType, params: {} },
      { type: "insight.log" as ActionType, params: { note: "Nuova recensione ricevuta" } },
    ],
  },
  {
    name: "Premio fedeltà raggiunto",
    description: "Quando il cliente raggiunge la soglia punti, notifica via WhatsApp",
    triggerEvent: "loyalty.threshold_reached" as EventType,
    actions: [
      { type: "whatsapp.send_message" as ActionType, params: { message: "🎁 Complimenti! Hai raggiunto il premio fedeltà! Riscattalo alla tua prossima visita." } },
    ],
  },
];

// ─── Event Emission & Flow Execution ────────────────────────────

export async function emitEvent(event: BusinessEvent): Promise<FlowExecutionResult[]> {
  const flows = await prisma.automationFlow.findMany({
    where: {
      businessId: event.businessId,
      triggerEvent: event.type,
      enabled: true,
    },
  });

  const results: FlowExecutionResult[] = [];
  for (const flow of flows) {
    const result = await executeFlow(flow.id, event);
    results.push(result);
  }
  return results;
}

interface FlowExecutionResult {
  flowId: string;
  flowName: string;
  status: "completed" | "failed";
  actionResults: ActionResult[];
  error?: string;
}

async function executeFlow(flowId: string, event: BusinessEvent): Promise<FlowExecutionResult> {
  const flow = await prisma.automationFlow.findUnique({ where: { id: flowId } });
  if (!flow) {
    return { flowId, flowName: "Unknown", status: "failed", actionResults: [], error: "Flusso non trovato" };
  }

  const execution = await prisma.flowExecution.create({
    data: {
      flowId,
      triggerData: JSON.stringify(event.data),
      status: "running",
    },
  });

  const actionConfigs: ActionConfig[] = JSON.parse(flow.actions);
  const actionResults: ActionResult[] = [];
  let hasError = false;

  for (const actionConfig of actionConfigs) {
    try {
      const handler = actionHandlers[actionConfig.type];
      if (!handler) {
        actionResults.push({ action: actionConfig.type, success: false, message: `Handler non trovato: ${actionConfig.type}` });
        continue;
      }
      const result = await handler(event.businessId, actionConfig.params, event.data);
      actionResults.push(result);
    } catch (err) {
      hasError = true;
      actionResults.push({
        action: actionConfig.type,
        success: false,
        message: err instanceof Error ? err.message : "Errore sconosciuto",
      });
    }
  }

  await prisma.flowExecution.update({
    where: { id: execution.id },
    data: {
      status: hasError ? "failed" : "completed",
      results: JSON.stringify(actionResults),
      completedAt: new Date(),
    },
  });

  return {
    flowId,
    flowName: flow.name,
    status: hasError ? "failed" : "completed",
    actionResults,
  };
}

// ─── Helper: Seed default flows for a business ──────────────────

export async function seedDefaultFlows(businessId: string): Promise<void> {
  for (const template of FLOW_TEMPLATES) {
    const existing = await prisma.automationFlow.findFirst({
      where: { businessId, name: template.name },
    });
    if (!existing) {
      await prisma.automationFlow.create({
        data: {
          businessId,
          name: template.name,
          description: template.description,
          triggerEvent: template.triggerEvent,
          actions: JSON.stringify(template.actions),
          enabled: false, // disabled by default, user activates
        },
      });
    }
  }
}
