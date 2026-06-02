import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({ meta: [{ title: "Settings · Grey Analytics" }] }),
  component: SettingsPage,
});

const INTEGRATIONS = [
  { name: "Xero", desc: "Sync transactions every 6 hours", connected: true },
  { name: "QuickBooks", desc: "Sync transactions daily", connected: false },
  { name: "Sage", desc: "Sync transactions daily", connected: true },
  { name: "Bank Statement (PDF)", desc: "Upload manually", connected: true },
  { name: "WhatsApp Business", desc: "Receive alerts and send invoices", connected: true },
];

function SettingsPage() {
  const { user, logout, role } = useApp();
  const navigate = useNavigate();
  const [whatsapp, setWhatsapp] = useState(user?.whatsapp ?? "");
  const [name, setName] = useState(user?.name ?? "");
  const [biz, setBiz] = useState(user?.businessName ?? "");
  const [notify, setNotify] = useState(true);
  const [integrations, setIntegrations] = useState(INTEGRATIONS);

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Account, integrations, and alert preferences.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>How we identify you and your business.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid sm:grid-cols-2 gap-4" onSubmit={(e) => { e.preventDefault(); toast.success("Account updated"); }}>
            <div className="space-y-1.5"><Label htmlFor="name">Full name</Label><Input id="name" value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div className="space-y-1.5"><Label htmlFor="biz">Business name</Label><Input id="biz" value={biz} onChange={(e) => setBiz(e.target.value)} /></div>
            <div className="space-y-1.5"><Label htmlFor="email">Email</Label><Input id="email" type="email" defaultValue={user?.email} /></div>
            <div className="space-y-1.5"><Label htmlFor="wa">WhatsApp number</Label><Input id="wa" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="+27 ..." /></div>
            <div className="sm:col-span-2 flex justify-end"><Button type="submit">Save changes</Button></div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Integrations</CardTitle>
          <CardDescription>Connect your accounting tools so Grey Analytics can pull data automatically.</CardDescription>
        </CardHeader>
        {/* Edited by Copilot: Improved mobile responsiveness for integrations list
            Reason: Settings page integrations layout was too clustered on smaller
            devices (Galaxy Z Fold 344px width). Changed from horizontal flex layout
            to improved grid/block structure on mobile to better accommodate smaller
            screens and prevent horizontal overflow. */}
        <CardContent className="divide-y divide-border">
          {integrations.map((it, idx) => (
            <div key={it.name} className="flex flex-col sm:flex-row sm:items-center gap-3 py-3 first:pt-0 last:pb-0">
              <div className="size-10 rounded-lg bg-muted grid place-items-center font-semibold text-xs flex-shrink-0">{it.name.slice(0, 2)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <span className="font-medium text-sm">{it.name}</span>
                  {it.connected ? (
                    <Badge className="bg-success text-success-foreground hover:bg-success gap-1 text-[10px] w-fit"><CheckCircle2 className="size-3" />Connected</Badge>
                  ) : (
                    <Badge variant="outline" className="gap-1 text-[10px] w-fit"><AlertTriangle className="size-3" />Not connected</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{it.desc}</p>
                {role === "accountant" && it.connected && (
                  <p className="text-[10px] text-muted-foreground mt-1">Last sync: {new Date(Date.now() - idx * 3600000).toLocaleString("en-ZA")}</p>
                )}
              </div>
              <Button
                size="sm"
                variant={it.connected ? "outline" : "default"}
                className="w-full sm:w-auto"
                onClick={() => {
                  setIntegrations((arr) => arr.map((x) => x.name === it.name ? { ...x, connected: !x.connected } : x));
                  toast.success(it.connected ? `${it.name} disconnected` : `${it.name} connected`);
                }}
              >
                {it.connected ? "Disconnect" : "Connect"}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Choose how Grey Analytics alerts you.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <Label htmlFor="wa-alerts">WhatsApp alerts for leaks over R2,000</Label>
              <p className="text-xs text-muted-foreground mt-1">Sent within 24 hours of detection.</p>
            </div>
            <Switch id="wa-alerts" checked={notify} onCheckedChange={setNotify} className="flex-shrink-0" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="text-destructive">Danger zone</CardTitle>
          {/* Edited by Copilot: Replaced em-dash (—) with space
              Reason: Remove all em-dashes rendered on UI for consistent text
              rendering across all device sizes and improved mobile responsiveness */}
          <CardDescription>Delete your account and all data (POPIA deleted within 30 days).</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" className="gap-2" onClick={() => {
            if (confirm("Delete your demo account?")) {
              toast.success("Account deleted (demo).");
              logout();
              navigate({ to: "/login" });
            }
          }}>
            <Trash2 className="size-4" />Delete my account
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
