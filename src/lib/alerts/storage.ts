// Alert history — persisted in localStorage so the AlertsPage can show real
// delivery history across sessions without a backend table.

import type { SentAlert } from "./types";

const KEY = "ga.sentAlerts.v1";

function safeRead(): SentAlert[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SentAlert[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function safeWrite(list: SentAlert[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list.slice(0, 200)));
  } catch {
    /* quota or serialisation issue — ignore for demo */
  }
}

export function loadSentAlerts(): SentAlert[] {
  return safeRead().sort((a, b) => b.sentAt - a.sentAt);
}

export function appendSentAlerts(items: SentAlert[]): SentAlert[] {
  const all = [...items, ...safeRead()];
  safeWrite(all);
  return loadSentAlerts();
}

export function updateSentAlert(id: string, patch: Partial<SentAlert>): SentAlert[] {
  const all = safeRead().map((a) => (a.id === id ? { ...a, ...patch } : a));
  safeWrite(all);
  return loadSentAlerts();
}

export function clearSentAlerts(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}
