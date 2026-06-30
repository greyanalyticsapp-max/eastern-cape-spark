import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Copy, FileText, Check } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/extracted/$id")({
  head: () => ({ meta: [{ title: "Extracted Raw Data · Grey Analytics" }] }),
  component: ExtractedDataPage,
});

function ExtractedDataPage() {
  const { id } = Route.useParams();
  const { reports, getReport, extractedTexts } = useApp();
  const report = id === "latest" ? reports[0] : getReport(id);
  const reportId = report?.id ?? id;
  const text = extractedTexts[reportId] ?? "";
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Extracted raw data copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link to="/upload" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
            <ArrowLeft className="size-3.5" /> Back to Upload
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mt-1 flex items-center gap-2.5">
            <FileText className="size-7 text-primary" /> Extracted Source Data
          </h1>
          <p className="text-muted-foreground text-sm">
            {report?.businessName ?? "Business"} · Raw text captured via Siphon Cypher OCR and parsing engine.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Button variant="outline" size="sm" onClick={handleCopy} disabled={!text}>
            {copied ? <Check className="size-4 mr-1.5 text-success" /> : <Copy className="size-4 mr-1.5" />}
            {copied ? "Copied" : "Copy Raw Text"}
          </Button>
          <Button size="sm" asChild>
            <Link to="/analysis/$id" params={{ id: reportId }}>
              Proceed to Transmit Assessment
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="border-b border-border bg-muted/20">
          <div className="flex items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base font-semibold font-mono">Telemetry Buffer ({text.length.toLocaleString()} characters)</CardTitle>
              <CardDescription>Verified input ready for 4-agent structured financial analysis.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {text.trim() ? (
            <pre className="p-6 text-xs sm:text-sm font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-[70vh] text-foreground/90 select-text">
              {text}
            </pre>
          ) : (
            <div className="py-20 text-center text-muted-foreground space-y-3">
              <FileText className="size-10 mx-auto text-muted-foreground/40" />
              <p>No extracted text available for this upload session.</p>
              <Button variant="outline" size="sm" asChild>
                <Link to="/upload">Upload documents</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}