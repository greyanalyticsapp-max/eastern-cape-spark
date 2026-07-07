// Client-side persistence: mirrors AppContext writes to Supabase
// (RLS enforces user_id on every row). Safe to call while unauthenticated —
// helpers no-op until a session exists.
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import type { Alert, Report, Upload } from "@/lib/mock";

async function currentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.user.id ?? null;
}

/* ------------------------------- Uploads -------------------------------- */
export async function saveUpload(u: Upload): Promise<void> {
  const userId = await currentUserId();
  if (!userId) return;
  await supabase.from("uploads").upsert({
    id: crypto.randomUUID(),
    user_id: userId,
    file_name: u.fileName,
    size: u.size,
    source: u.source,
    status: u.status,
    created_at: new Date(u.uploadedAt).toISOString(),
  }, { onConflict: "id" });
}

export async function loadUploads(): Promise<Upload[]> {
  const userId = await currentUserId();
  if (!userId) return [];
  const { data } = await supabase
    .from("uploads")
    .select("id, file_name, size, source, status, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(100);
  return (data ?? []).map((r) => ({
    id: r.id,
    fileName: r.file_name,
    size: r.size ?? "",
    source: (r.source ?? "PDF") as Upload["source"],
    status: (r.status ?? "ready") as Upload["status"],
    uploadedAt: new Date(r.created_at),
  }));
}

/* ------------------------------- Reports -------------------------------- */
export async function saveReport(r: Report): Promise<void> {
  const userId = await currentUserId();
  if (!userId) return;
  await supabase.from("reports").upsert({
    id: crypto.randomUUID(),
    user_id: userId,
    business_name: r.businessName,
    title: r.title,
    payload: JSON.parse(JSON.stringify(r)) as Json,
    created_at: new Date(r.generatedAt).toISOString(),
  }, { onConflict: "id" });
}

export async function loadReports(): Promise<Report[]> {
  const userId = await currentUserId();
  if (!userId) return [];
  const { data } = await supabase
    .from("reports")
    .select("payload, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);
  return (data ?? []).map((row) => {
    const r = row.payload as unknown as Report;
    return { ...r, generatedAt: new Date(row.created_at) };
  });
}

/* -------------------------------- Alerts -------------------------------- */
export async function saveAlerts(alerts: Alert[]): Promise<void> {
  const userId = await currentUserId();
  if (!userId || alerts.length === 0) return;
  await supabase.from("alerts").insert(
    alerts.map((a) => ({
      user_id: userId,
      leak_id: a.leakId,
      leak_type: a.leakType,
      amount: a.amount,
      message: a.message,
      severity: "medium",
      read: a.read,
      thread: JSON.parse(JSON.stringify(a.thread)) as Json,
      created_at: new Date(a.timestamp).toISOString(),
    })),
  );
}

export async function loadAlerts(): Promise<Alert[]> {
  const userId = await currentUserId();
  if (!userId) return [];
  const { data } = await supabase
    .from("alerts")
    .select("id, leak_id, leak_type, amount, message, read, thread, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(200);
  return (data ?? []).map((r) => ({
    id: r.id,
    leakId: r.leak_id ?? "",
    leakType: r.leak_type,
    amount: Number(r.amount),
    message: r.message,
    read: r.read,
    thread: (r.thread as unknown as Alert["thread"]) ?? [],
    timestamp: new Date(r.created_at),
  }));
}

export async function markAlertReadRemote(id: string): Promise<void> {
  const userId = await currentUserId();
  if (!userId) return;
  await supabase.from("alerts").update({ read: true }).eq("id", id).eq("user_id", userId);
}
