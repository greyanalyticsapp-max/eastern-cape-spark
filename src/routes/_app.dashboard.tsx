import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, ArrowRight, TrendingUp, FileText, AlertTriangle, Upload as UploadIcon } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadStatusCard, ReportListCard, LeakSummaryCard } from "@/components/dashboard/DashboardCards";
import { mockReport, formatZAR } from "@/lib/mock";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard · Grey Analytics" }] }),
  component: DashboardPage,
});

const AUDIT_STEPS = [
  "Connecting to Xero…",
  "Pulling 90 days of transactions…",
  "Finance agent analysing…",
  "Compliance agent checking VAT & UIF…",
  "Generating plain-English report…",
];

function DashboardPage() {
  const { user, reports, addReport, addAlertsFromReport, role } = useApp();
  const navigate = useNavigate();
  const [auditing, setAuditing] = useState(false);
  const [step, setStep] = useState(0);

  const latest = reports[0];
  const totalSavings = latest?.roi.potentialSavings ?? 0;

  const runAudit = () => {
    setAuditing(true);
    setStep(0);
    const t = setInterval(() => {
      setStep((s) => {
        if (s + 1 >= AUDIT_STEPS.length) {
          clearInterval(t);
          setTimeout(() => {
            const r = mockReport(user?.businessName);
            addReport(r);
            addAlertsFromReport(r);
            toast.success("New audit report ready", { description: `${r.leaks.length} leaks found · ${formatZAR(r.roi.potentialSavings)} recoverable.` });
            navigate({ to: "/report/$id", params: { id: r.id } });
          }, 500);
          return s + 1;
        }
        return s + 1;
      });
    }, 800);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Sawubona, {user?.name?.split(" ")[0]} 👋</h1>
          <p className="text-muted-foreground mt-1">Here's what Grey Analytics found for {user?.businessName}.</p>
        </div>
        <Button onClick={runAudit} disabled={auditing} size="lg" className="gap-2">
          {auditing ? <>
            <span className="size-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
            {AUDIT_STEPS[Math.min(step, AUDIT_STEPS.length - 1)]}
          </> : <><Sparkles className="size-4" />Run new audit</>}
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Kpi label="Recoverable cash" value={formatZAR(totalSavings)} icon={<TrendingUp className="size-4" />} accent="text-success" />
        <Kpi label="Leaks found" value={(latest?.leaks.length ?? 0).toString()} icon={<AlertTriangle className="size-4" />} accent="text-destructive" />
        <Kpi label="Reports" value={reports.length.toString()} icon={<FileText className="size-4" />} accent="text-primary" />
        <Kpi label="Last audit" value={latest ? new Date(latest.generatedAt).toLocaleDateString("en-ZA", { day: "2-digit", month: "short" }) : "—"} icon={<Sparkles className="size-4" />} accent="text-accent-foreground" />
      </div>

      {role === "accountant" && (
        <Card className="border-accent/40 bg-accent/10">
          <CardContent className="p-4 flex items-center gap-3 text-sm">
            <Sparkles className="size-4 text-accent-foreground" />
            <span><strong>Accountant view:</strong> integration logs, audit trails, and VAT reconciliation panels are visible in Settings.</span>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <UploadStatusCard />
          <ReportListCard />
        </div>
        <div className="space-y-4 sm:space-y-6">
          <LeakSummaryCard />
          <Card className="bg-primary text-primary-foreground">
            <CardHeader>
              <CardTitle className="text-primary-foreground">Need fresh data?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-primary-foreground/90">Upload a bank statement or Xero export and we'll run a new audit.</p>
              <Button asChild variant="secondary" className="w-full"><Link to="/upload"><UploadIcon className="size-4 mr-1.5" />Upload now<ArrowRight className="size-4 ml-1.5" /></Link></Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, value, icon, accent }: { label: string; value: string; icon: React.ReactNode; accent: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className={`flex items-center gap-1.5 text-xs text-muted-foreground ${accent}`}>{icon}<span className="text-muted-foreground">{label}</span></div>
        <div className="text-xl sm:text-2xl font-bold mt-2 tabular-nums">{value}</div>
      </CardContent>
    </Card>
  );
}
