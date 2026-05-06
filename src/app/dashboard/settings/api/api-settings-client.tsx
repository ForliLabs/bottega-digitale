"use client";

import { useMemo, useState } from "react";
import { useToast } from "@/components/ui/toast-provider";
import { EmptyState, InlineMessage } from "@/components/ui/feedback";

interface ApiKeyItem {
  id: string;
  name: string;
  keyPrefix: string;
  scopes: string;
  rateLimit?: number;
  active: boolean;
  createdAt?: string | Date;
}

interface WebhookEndpointItem {
  id: string;
  url: string;
  events: string;
  secret: string;
  active: boolean;
  failCount: number;
}

interface WebhookEventItem {
  type: string;
  description: string;
}

export function ApiSettingsClient({
  initialApiKeys,
  initialWebhookEndpoints,
  availableEvents,
}: {
  initialApiKeys: ApiKeyItem[];
  initialWebhookEndpoints: WebhookEndpointItem[];
  availableEvents: WebhookEventItem[];
}) {
  const { notify } = useToast();
  const [apiKeys, setApiKeys] = useState(initialApiKeys);
  const [webhookEndpoints, setWebhookEndpoints] = useState(initialWebhookEndpoints);
  const [apiKeyName, setApiKeyName] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookEvents, setWebhookEvents] = useState<string>("*");
  const [creatingKey, setCreatingKey] = useState(false);
  const [creatingWebhook, setCreatingWebhook] = useState(false);
  const [latestSecret, setLatestSecret] = useState<string | null>(null);
  const [latestApiKey, setLatestApiKey] = useState<string | null>(null);

  const eventOptions = useMemo(() => availableEvents.map((event) => event.type).join(","), [availableEvents]);

  async function createKey() {
    if (!apiKeyName.trim()) {
      notify({ tone: "error", title: "Nome richiesto", description: "Inserisci un nome per la chiave API." });
      return;
    }

    setCreatingKey(true);
    try {
      const response = await fetch("/api/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: apiKeyName.trim(), scopes: "read,write,webhooks" }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Impossibile creare la chiave API");
      }

      setApiKeys((current) => [
        {
          id: data.id,
          name: apiKeyName.trim(),
          keyPrefix: data.prefix,
          scopes: "read,write,webhooks",
          active: true,
          createdAt: new Date().toISOString(),
        },
        ...current,
      ]);
      setApiKeyName("");
      setLatestApiKey(data.key);
      notify({ tone: "success", title: "Chiave creata", description: "Copia ora la chiave completa: verrà mostrata una sola volta." });
    } catch (error) {
      notify({ tone: "error", title: "Errore creazione chiave", description: error instanceof Error ? error.message : "Riprova." });
    } finally {
      setCreatingKey(false);
    }
  }

  async function revokeKey(id: string) {
    const response = await fetch(`/api/api-keys?id=${id}`, { method: "DELETE" });
    if (response.ok) {
      setApiKeys((current) => current.map((key) => (key.id === id ? { ...key, active: false } : key)));
      notify({ tone: "success", title: "Chiave revocata" });
      return;
    }

    const data = await response.json();
    notify({ tone: "error", title: "Errore revoca", description: data.error || "Riprova." });
  }

  async function createWebhook() {
    if (!webhookUrl.trim()) {
      notify({ tone: "error", title: "URL richiesto", description: "Inserisci un endpoint HTTPS valido." });
      return;
    }

    setCreatingWebhook(true);
    try {
      const response = await fetch("/api/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: webhookUrl.trim(), events: webhookEvents.trim() || "*" }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Impossibile creare il webhook");
      }

      setWebhookEndpoints((current) => [data, ...current]);
      setWebhookUrl("");
      setLatestSecret(data.secret);
      notify({ tone: "success", title: "Webhook creato", description: "Salva subito il secret di firma prima di lasciare questa schermata." });
    } catch (error) {
      notify({ tone: "error", title: "Errore creazione webhook", description: error instanceof Error ? error.message : "Riprova." });
    } finally {
      setCreatingWebhook(false);
    }
  }

  async function copyValue(value: string, label: string) {
    await navigator.clipboard.writeText(value);
    notify({ tone: "success", title: `${label} copiato` });
  }

  return (
    <div className="space-y-8">
      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Crea una chiave API</h3>
              <p className="mt-1 text-sm text-slate-500">Genera una chiave per CRM esterni, sito e automazioni.</p>
            </div>
          </div>
          <div className="mt-4 space-y-3">
            <label className="block text-sm font-medium text-slate-700">
              Nome interno
              <input
                value={apiKeyName}
                onChange={(event) => setApiKeyName(event.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
                placeholder="Gestionale studio / Sito / BI"
              />
            </label>
            <button onClick={createKey} disabled={creatingKey} className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50">
              {creatingKey ? "Creazione..." : "Crea chiave API"}
            </button>
          </div>
          {latestApiKey ? (
            <div className="mt-4 space-y-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <InlineMessage tone="success" title="Nuova chiave pronta" description="Copia la chiave completa: non verrà più mostrata." />
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <code className="flex-1 overflow-auto rounded-xl bg-white px-3 py-2 text-xs text-slate-700">{latestApiKey}</code>
                <button onClick={() => copyValue(latestApiKey, "Chiave API")} className="rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm font-semibold text-emerald-700">
                  Copia
                </button>
              </div>
            </div>
          ) : null}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Registra un webhook</h3>
          <p className="mt-1 text-sm text-slate-500">Ricevi eventi in tempo reale sul tuo backend.</p>
          <div className="mt-4 space-y-3">
            <label className="block text-sm font-medium text-slate-700">
              URL endpoint
              <input
                value={webhookUrl}
                onChange={(event) => setWebhookUrl(event.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
                placeholder="https://example.com/webhooks/bottega"
                inputMode="url"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Eventi
              <input
                value={webhookEvents}
                onChange={(event) => setWebhookEvents(event.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
                placeholder="booking.created,customer.created"
              />
            </label>
            <p className="text-xs text-slate-500">Usa * per tutti gli eventi o una lista separata da virgole: {eventOptions}</p>
            <button onClick={createWebhook} disabled={creatingWebhook} className="rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50">
              {creatingWebhook ? "Salvataggio..." : "Aggiungi webhook"}
            </button>
          </div>
          {latestSecret ? (
            <div className="mt-4 space-y-2 rounded-2xl border border-indigo-200 bg-indigo-50 p-4">
              <InlineMessage title="Secret webhook generato" description="Salvalo nel tuo backend per verificare la firma HMAC." />
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <code className="flex-1 overflow-auto rounded-xl bg-white px-3 py-2 text-xs text-slate-700">{latestSecret}</code>
                <button onClick={() => copyValue(latestSecret, "Secret webhook")} className="rounded-xl border border-indigo-200 bg-white px-3 py-2 text-sm font-semibold text-indigo-700">
                  Copia
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700">Chiavi API</h3>
          <span className="text-xs text-slate-400">{apiKeys.length} chiavi</span>
        </div>
        {apiKeys.length === 0 ? (
          <EmptyState icon="🔑" title="Nessuna chiave API" description="Crea la prima chiave per iniziare a integrare sistemi esterni e automazioni." />
        ) : (
          <div className="space-y-3">
            {apiKeys.map((key) => (
              <div key={key.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-slate-900">{key.name}</p>
                  <p className="mt-1 font-mono text-xs text-slate-500">{key.keyPrefix}</p>
                  <p className="mt-1 text-xs text-slate-400">Permessi: {key.scopes}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${key.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                    {key.active ? "Attiva" : "Revocata"}
                  </span>
                  {key.active ? (
                    <button onClick={() => revokeKey(key.id)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                      Revoca
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700">Webhook endpoints</h3>
          <span className="text-xs text-slate-400">{webhookEndpoints.length} endpoint</span>
        </div>
        {webhookEndpoints.length === 0 ? (
          <EmptyState icon="🔗" title="Nessun webhook configurato" description="Aggiungi un endpoint per ricevere eventi in tempo reale con firma HMAC." />
        ) : (
          <div className="space-y-3">
            {webhookEndpoints.map((endpoint) => (
              <div key={endpoint.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-mono text-sm text-slate-900">{endpoint.url}</p>
                    <p className="mt-1 text-xs text-slate-500">Eventi: {endpoint.events === "*" ? "Tutti" : endpoint.events}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${endpoint.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                      {endpoint.active ? "Attivo" : "Disabilitato"}
                    </span>
                    {endpoint.failCount > 0 ? <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">{endpoint.failCount} errori</span> : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
