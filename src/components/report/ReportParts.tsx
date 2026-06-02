import { useState } from "react";
import { ChevronDown, ChevronUp, AlertTriangle, ShieldCheck, TrendingUp, BarChart3 } from "lucide-react";
import type { Leak, Report } from "@/lib/mock";
import { formatZAR } from "@/lib/mock";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend, PieChart, Pie, Cell } from "recharts";
import { cn } from "@/lib/utils";

const CAT_COLOR: Record<string, string> = {
  Finance: "var(--color-chart-1)",
  Ops: "var(--color-chart-2)",
  Compliance: "var(--color-chart-4)",
  Strategy: "var(--color-chart-5)",
};

export function ReadabilityBadge({ report }: { report: Report }) {
  return (
    <Badge className="bg-success text-success-foreground hover:bg-success gap-1.5">
      <ShieldCheck className="size-3.5" />
      {report.readability.label}
    </Badge>
  );
}

export function ExecutiveSummary({ report }: { report: Report }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <CardTitle className="text-xl">Executive Summary</CardTitle>
            <CardDescription>Plain-English overview for {report.businessName}</CardDescription>
          </div>
          <ReadabilityBadge report={report} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-base leading-relaxed">{report.executiveSummary}</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Stat label="Leaks found" value={report.leaks.length.toString()} icon={<AlertTriangle className="size-4 text-destructive" />} />
          <Stat label="Recoverable" value={formatZAR(report.roi.potentialSavings)} icon={<TrendingUp className="size-4 text-success" />} />
          <Stat label="Payback time" value={`${report.roi.recoveryMonths} months`} icon={<BarChart3 className="size-4 text-primary" />} />
        </div>
      </CardContent>
    </Card>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border p-3 bg-muted/30">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">{icon}{label}</div>
      <div className="text-lg font-semibold mt-1">{value}</div>
    </div>
  );
}

export function LeakCard({ leak, index }: { leak: Leak; index: number }) {
  const [open, setOpen] = useState(index === 0);
  const sev = leak.severity;
  return (
    <Card className="overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full text-left p-4 sm:p-5 flex items-start gap-3 hover:bg-muted/40 transition"
        aria-expanded={open}
      >
        <div className={cn(
          "size-10 rounded-full grid place-items-center text-sm font-bold shrink-0",
          sev === "high" ? "bg-destructive/10 text-destructive" : sev === "medium" ? "bg-warning/15 text-warning" : "bg-muted text-muted-foreground",
        )}>
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-semibold">{leak.type}</h4>
            <Badge variant="outline" className="text-[10px]" style={{ borderColor: CAT_COLOR[leak.category], color: CAT_COLOR[leak.category] }}>{leak.category}</Badge>
            {sev === "high" && <Badge variant="destructive" className="text-[10px]">High priority</Badge>}
          </div>
          <p className="text-sm text-muted-foreground mt-1">{leak.description}</p>
        </div>
        <div className="text-right shrink-0">
          <div className="text-lg font-bold text-destructive tabular-nums">{formatZAR(leak.amount)}</div>
          <div className="text-xs text-muted-foreground flex items-center justify-end gap-1">
            {open ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
            {open ? "Hide" : "Show"} details
          </div>
        </div>
      </button>
      {open && (
        <CardContent className="border-t border-border bg-muted/20 pt-4 grid sm:grid-cols-2 gap-5 animate-in fade-in slide-in-from-top-1">
          <div>
            <h5 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Evidence</h5>
            <ul className="space-y-1.5 text-sm">
              {leak.evidence.map((e) => <li key={e} className="flex gap-2"><span className="text-muted-foreground">•</span><span>{e}</span></li>)}
            </ul>
          </div>
          <div>
            <h5 className="text-xs font-semibold uppercase text-muted-foreground mb-2">How to fix it</h5>
            <ol className="space-y-1.5 text-sm">
              {leak.fix.map((f, i) => <li key={f} className="flex gap-2"><span className="text-primary font-semibold">{i + 1}.</span><span>{f}</span></li>)}
            </ol>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export function RoiEstimate({ report }: { report: Report }) {
  const pieData = Object.entries(
    report.leaks.reduce<Record<string, number>>((acc, l) => {
      acc[l.category] = (acc[l.category] ?? 0) + l.amount;
      return acc;
    }, {}),
  ).map(([name, value]) => ({ name, value }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>ROI estimate</CardTitle>
        <CardDescription>Money in vs money you can recover</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="trend">
          <TabsList>
            <TabsTrigger value="trend">Monthly trend</TabsTrigger>
            <TabsTrigger value="breakdown">By category</TabsTrigger>
          </TabsList>
          <TabsContent value="trend" className="mt-4">
            <div className="h-64">
              <ResponsiveContainer>
                <BarChart data={report.monthly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickFormatter={(v) => `R${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8 }}
                    formatter={(v: number) => formatZAR(v)}
                  />
                  <Legend />
                  <Bar dataKey="spend" name="Current spend" fill="var(--color-chart-1)" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="savings" name="Potential savings" fill="var(--color-chart-3)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          <TabsContent value="breakdown" className="mt-4">
            <div className="h-64">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={2}>
                    {pieData.map((d) => <Cell key={d.name} fill={CAT_COLOR[d.name] ?? "var(--color-chart-1)"} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => formatZAR(v)} contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
