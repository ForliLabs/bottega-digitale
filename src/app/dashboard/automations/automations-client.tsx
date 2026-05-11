"use client";

import { useMemo, useState } from "react";
import { InlineMessage } from "@/components/ui/feedback";
import { useToast } from "@/components/ui/toast-provider";

interface FlowExecutionItem {
  id: string;
  status: string;
  startedAt: string;
}

interface AutomationFlowItem {
  id: string;
  name: string;
  description: string | null;
  triggerEvent: string;
  actions: string;
  enabled: boolean;
  executions: FlowExecutionItem[];
}

interface AutomationTemplateItem {
  name: string;
  description: string;
  triggerEvent: string;
  actions: Array<{ type: string; params: Record<string, unknown> }>;
}

const EVENT_LABELS: Record<string, string> = {
  "booking.created": "Prenotazione creata",
  "booking.completed": "Prenotazione completata",
  "booking.cancelled": "Prenotazione cancellata",
  "customer.created": "Nuovo cliente",
  "review.received": "Recensione ricevuta",
  "loyalty.threshold_reached": "Soglia fedeltà raggiunta",
  "queue.turn_approaching": "Turno in arrivo",
};

const ACTION_LABELS: Record<string, string> = {
  "whatsapp.send_message": "Invia WhatsApp",
  "whatsapp.send_template": "Invia template WhatsApp",
  "loyalty.award_points": "Assegna punti fedeltà",
  "crm.update_customer": "Aggiorna CRM",
  "social.generate_post": "Genera post social",
  "insight.log": "Registra evento",
};

function parseActions(actions: string) {
  try {
    return JSON.parse(actions) as Array<{ type: string; params: Record<string, unknown> }>;
  } catch {
    return [];
  }
}

function getDefaultDraft(template?: AutomationTemplateItem) {
  return {
    id: "",
    name: template?.name || "",
    description: template?.description || "",
    triggerEvent: template?.triggerEvent || "booking.created",
    actions: template?.actions || [],
  };
}

export function AutomationsClient({
  initialFlows,
  templates,
}: {
  initialFlows: AutomationFlowItem[];
  templates: AutomationTemplateItem[];
}) {
  const { notify } = useToast();
  const [flows, setFlows] = useState(initialFlows);
  const [draft, setDraft] = useState(getDefaultDraft());
  const [editorMode, setEditorMode] = useState<"create" | "edit" | null>(null);
  const [selectedTemplateName, setSelectedTemplateName] = useState(templates[0]?.name || "");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const templateMap = useMemo(
    () => new Map(templates.map((template) => [template.name, template])),
    [templates],
  );

  function openCreate(templateName?: string) {
    const template = templateName ? templateMap.get(templateName) : templates[0];
    setSelectedTemplateName(template?.name || "");
    setDraft(getDefaultDraft(template));
    setEditorMode("create");
    setError("");
  }

  function openEdit(flow: AutomationFlowItem) {
    const matchedTemplate = templates.find((template) => JSON.stringify(template.actions) === JSON.stringify(parseActions(flow.actions)));
    setSelectedTemplateName(matchedTemplate?.name || "");
    setDraft({
      id: flow.id,
      name: flow.name,
      description: flow.description || "",
      triggerEvent: flow.triggerEvent,
      actions: parseActions(flow.actions),
    });
    setEditorMode("edit");
    setError("");
  }

  function handleTemplateChange(templateName: string) {
    setSelectedTemplateName(templateName);
    const template = templateMap.get(templateName);
    if (!template) return;
    setDraft((current) => ({
      ...current,
      name: editorMode === "create" || !current.name ? template.name : current.name,
      description: editorMode === "create" || !current.description ? template.description : current.description,
      triggerEvent: template.triggerEvent,
      actions: template.actions,
    }));
  }

  async function persistDraft() {
    if (!draft.name.trim()) {
      setError("Inserisci un nome per il flusso.");
      return;
    }
    setLoadingId(editorMode === "edit" ? draft.id : "create");
    setError("");
    try {
      const endpoint = "/api/automations";
      const method = editorMode === "edit" ? "PATCH" : "POST";
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: draft.id,
          name: draft.name.trim(),
          description: draft.description.trim() || null,
          triggerEvent: draft.triggerEvent,
          actions: draft.actions,
          enabled: true,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.error || "Impossibile salvare il flusso.");
      }

      const savedFlow = {
        ...data,
        executions: data.executions || [],
      } as AutomationFlowItem;

      setFlows((current) => {
        if (editorMode === "edit") {
          return current.map((flow) => (flow.id === savedFlow.id ? { ...flow, ...savedFlow } : flow));
        }
        return [savedFlow, ...current];
      });
      setEditorMode(null);
      setDraft(getDefaultDraft());
      notify({ tone: "success", title: editorMode === "edit" ? "Flusso aggiornato" : "Nuovo flusso creato" });
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Impossibile salvare il flusso.");
    } finally {
      setLoadingId(null);
    }
  }

  async function toggleFlow(flow: AutomationFlowItem) {
    setLoadingId(flow.id);
    setError("");
    try {
      const response = await fetch("/api/automations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: flow.id, enabled: !flow.enabled }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.error || "Impossibile aggiornare lo stato.");
      }
      setFlows((current) => current.map((item) => item.id === flow.id ? { ...item, enabled: !flow.enabled } : item));
    } catch (toggleError) {
      setError(toggleError instanceof Error ? toggleError.message : "Impossibile aggiornare lo stato.");
    } finally {
      setLoadingId(null);
    }
  }

  async function deleteFlow(flowId: string) {
    setLoadingId(flowId);
    setError("");
    try {
      const response = await fetch(`/api/automations?id=${flowId}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.error || "Impossibile eliminare il flusso.");
      }
      setFlows((current) => current.filter((flow) => flow.id !== flowId));
      notify({ tone: "success", title: "Flusso eliminato" });
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Impossibile eliminare il flusso.");
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-purple-200 bg-gradient-to-br from-purple-50 via-white to-indigo-50 p-8 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-purple-700">Automazioni</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">Flussi automatici</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Accendi, modifica o crea nuovi flussi per orchestrare notifiche, loyalty e CRM senza uscire dalla dashboard.</p>
          </div>
          <button
            type="button"
            onClick={() => openCreate()}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Crea flusso
          </button>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {templates.map((template) => (
          <button
            key={template.name}
            type="button"
            onClick={() => openCreate(template.name)}
            className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm hover:border-purple-300 hover:bg-purple-50"
          >
            <p className="text-sm font-semibold text-slate-900">{template.name}</p>
            <p className="mt-2 text-sm text-slate-500">{template.description}</p>
            <p className="mt-3 text-xs font-medium uppercase tracking-[0.16em] text-purple-700">{EVENT_LABELS[template.triggerEvent] || template.triggerEvent}</p>
          </button>
        ))}
      </section>

      {editorMode ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">{editorMode === "edit" ? "Modifica flusso" : "Nuovo flusso"}</h2>
              <p className="mt-1 text-sm text-slate-500">Scegli un template operativo e personalizza nome, trigger e descrizione.</p>
            </div>
            <button type="button" onClick={() => setEditorMode(null)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Chiudi</button>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700">
              Template operativo
              <select value={selectedTemplateName} onChange={(event) => handleTemplateChange(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm">
                {templates.map((template) => (
                  <option key={template.name} value={template.name}>{template.name}</option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Trigger
              <select value={draft.triggerEvent} onChange={(event) => setDraft((current) => ({ ...current, triggerEvent: event.target.value }))} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm">
                {Object.entries(EVENT_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium text-slate-700 lg:col-span-2">
              Nome flusso
              <input value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm" />
            </label>
            <label className="block text-sm font-medium text-slate-700 lg:col-span-2">
              Descrizione
              <textarea value={draft.description} onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))} rows={3} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm" />
            </label>
          </div>

          <div className="mt-6 rounded-2xl bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">Azioni incluse</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {draft.actions.map((action) => (
                <span key={`${draft.name}-${action.type}`} className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700">
                  {ACTION_LABELS[action.type] || action.type}
                </span>
              ))}
            </div>
          </div>

          {error ? <div className="mt-4"><InlineMessage tone="error" title={error} /></div> : null}

          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" onClick={() => void persistDraft()} disabled={loadingId === draft.id || loadingId === "create"} className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50">
              {loadingId === draft.id || loadingId === "create" ? "Salvataggio..." : editorMode === "edit" ? "Salva modifiche" : "Crea flusso"}
            </button>
            <button type="button" onClick={() => setEditorMode(null)} className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">Annulla</button>
          </div>
        </section>
      ) : null}

      {error && !editorMode ? <InlineMessage tone="error" title={error} /> : null}

      <div className="grid gap-6">
        {flows.map((flow) => {
          const actions = parseActions(flow.actions);
          return (
            <div key={flow.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-lg font-semibold text-slate-900">{flow.name}</h3>
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${flow.enabled ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{flow.enabled ? "Attivo" : "Disattivato"}</span>
                  </div>
                  {flow.description ? <p className="mt-2 text-sm text-slate-500">{flow.description}</p> : null}
                  <p className="mt-3 text-xs font-medium uppercase tracking-[0.16em] text-purple-700">{EVENT_LABELS[flow.triggerEvent] || flow.triggerEvent}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => void toggleFlow(flow)} disabled={loadingId === flow.id} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50">{flow.enabled ? "Disattiva" : "Attiva"}</button>
                  <button type="button" onClick={() => openEdit(flow)} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Modifica</button>
                  <button type="button" onClick={() => void deleteFlow(flow.id)} disabled={loadingId === flow.id} className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 disabled:opacity-50">Elimina</button>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
                {actions.map((action) => (
                  <span key={`${flow.id}-${action.type}`} className="rounded-lg bg-amber-50 px-3 py-1.5 font-medium text-amber-700">{ACTION_LABELS[action.type] || action.type}</span>
                ))}
              </div>

              {flow.executions.length > 0 ? (
                <div className="mt-5 border-t border-slate-100 pt-4">
                  <p className="text-xs font-medium text-slate-500">Ultime esecuzioni</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {flow.executions.map((execution) => (
                      <span key={execution.id} className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs ${execution.status === "completed" ? "bg-emerald-50 text-emerald-700" : execution.status === "failed" ? "bg-red-50 text-red-700" : "bg-yellow-50 text-yellow-700"}`}>
                        {new Date(execution.startedAt).toLocaleString("it-IT", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
