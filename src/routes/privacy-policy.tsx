import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ShieldCheck, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/privacy-policy")({
  head: () => ({ meta: [{ title: "Privacy Policy · Grey Analytics" }] }),
  component: PrivacyPolicyPage,
});

function PrivacyPolicyPage() {
  return (
    <div className="min-h-dvh bg-background text-foreground flex flex-col justify-between">
      <div className="max-w-4xl mx-auto w-full px-6 py-12 space-y-8 animate-in fade-in duration-300">
        <div>
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-6">
            <ArrowLeft className="size-4" /> Back to Welcome
          </Link>
          <div className="flex items-center gap-2 text-success text-sm font-semibold mb-2">
            <ShieldCheck className="size-4" /> POPIA Compliant Data Handling
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            Effective Date: {new Date().toLocaleDateString("en-ZA", { month: "long", year: "numeric" })}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">1. Introduction & POPIA Compliance</CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-relaxed text-muted-foreground space-y-3">
            <p>
              Grey Analytics ("we", "our", or "us") is dedicated to safeguarding the financial and personal data of South African Small, Medium, and Micro Enterprises (SMMEs). This Privacy Policy outlines our standards for collecting, processing, and protecting your data in strict compliance with the Protection of Personal Information Act (POPIA) No. 4 of 2013.
            </p>
            <p>
              By accessing our platform or uploading business documentation, you consent to the secure extraction and specialized analytical assessment practices detailed herein.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">2. Information We Collect</CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-relaxed text-muted-foreground space-y-3">
            <p><strong className="text-foreground">Account Information:</strong> Business name, designated representative name, email address, role, and contact phone numbers (specifically WhatsApp numbers for automated leak notifications).</p>
            <p><strong className="text-foreground">Financial Documentation:</strong> Bank statements, accounting exports (Xero, Sage, QuickBooks), payroll spreadsheets, and invoice imagery uploaded for analysis.</p>
            <p><strong className="text-foreground">Extracted Telemetry:</strong> Anonymized line items, transaction amounts, debtor days, and tax compliance indicators extracted via our Siphon Cypher pipeline.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">3. Bank-Grade Security & Encryption</CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-relaxed text-muted-foreground space-y-3">
            <p>
              We enforce rigorous technical safeguards across all infrastructure tiers. All uploaded files and extracted texts are encrypted using industry-standard <strong className="text-foreground">AES-256 at rest</strong> inside secured South African data clusters and transmitted strictly via <strong className="text-foreground">TLS 1.3 in transit</strong>.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">4. Data Retention & Offboarding Deletion</CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-relaxed text-muted-foreground space-y-3">
            <p>
              Financial records and analysis telemetry are maintained only for the duration required to generate your audit assessments and maintain your alert historical trails.
            </p>
            <p>
              In strict adherence to POPIA minimization mandates, <strong className="text-foreground">all uploaded files, extracted raw texts, and generated reports are permanently purged within 30 days of account offboarding or termination</strong>.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">5. Third-Party Specialist Processors</CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-relaxed text-muted-foreground space-y-3">
            <p>
              To deliver our Transmit Assessment capabilities, extracted raw text (never authentication credentials or raw banking keys) is transmitted to enterprise AI inference providers (such as Groq Cloud infrastructure). When text exceeds token thresholds, secure pre-summarization compression is applied while maintaining exact financial entity precision.
            </p>
            <p>
              Automated notifications are dispatched through authorized connectors including Twilio (WhatsApp Business API) and Resend (Email).
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">6. Contact & Data Protection Officer</CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-relaxed text-muted-foreground space-y-3">
            <p>
              For inquiries regarding POPIA access requests, data corrections, or permanent account deletion, please reach out to our legal compliance desk at <span className="text-foreground font-mono">privacy@greyanalytics.co.za</span>.
            </p>
          </CardContent>
        </Card>
      </div>

      <footer className="border-t border-border px-6 py-4 text-xs text-muted-foreground bg-card mt-12">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5"><ShieldCheck className="size-3.5 text-success" /> POPIA Compliant</span>
            <span className="flex items-center gap-1.5"><Lock className="size-3.5 text-success" /> AES-256 Encrypted</span>
            <Link to="/terms-of-service" className="hover:underline">Terms of Service</Link>
          </div>
          <span>© {new Date().getFullYear()} Grey Analytics</span>
        </div>
      </footer>
    </div>
  );
}