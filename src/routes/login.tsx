import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ShieldCheck, Lock, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useApp } from "@/context/AppContext";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in · Grey Analytics" }] }),
  component: LoginPage,
});

function LoginPage() {
  const { login, user } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  useEffect(() => { if (user) navigate({ to: "/dashboard" }); }, [user, navigate]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      login(email || "demo@greyanalytics.co.za");
      navigate({ to: "/dashboard" });
    }, 900);
  };

  return (
    <div className="min-h-dvh grid lg:grid-cols-2 bg-background">
      {/* Left – brand panel */}
      <div className="hidden lg:flex flex-col justify-between p-10 bg-sidebar text-sidebar-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-30" style={{ background: "radial-gradient(800px 400px at 80% 10%, var(--color-sidebar-primary), transparent 60%)" }} aria-hidden />
        <div className="relative">
          <div className="flex items-center gap-2.5">
            <div className="size-10 rounded-lg bg-sidebar-primary text-sidebar-primary-foreground grid place-items-center font-bold text-lg">G</div>
            <div className="font-semibold text-lg">Grey Analytics</div>
          </div>
        </div>
        <div className="relative space-y-6 max-w-md">
          {/* Edited by Copilot: Replaced em-dash (—) with space
              Reason: Remove all em-dashes rendered on UI and replace with simple spaces
              for consistent text formatting and improved mobile responsiveness */}
          <h1 className="text-3xl xl:text-4xl font-bold leading-tight">Find money leaks in your business in plain English.</h1>
          <p className="text-sidebar-foreground/80">Four AI agents check your Xero, Sage, QuickBooks and bank statements. We tell you what to fix and how much you'll save.</p>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-3"><Sparkles className="size-4 text-sidebar-primary" /> 5-page audit report in under 48 hours</li>
            <li className="flex items-center gap-3"><Sparkles className="size-4 text-sidebar-primary" /> WhatsApp alerts for any leak over R2,000</li>
            <li className="flex items-center gap-3"><Sparkles className="size-4 text-sidebar-primary" /> Built for Eastern Cape SMMEs</li>
          </ul>
        </div>
        <div className="relative flex items-center gap-4 text-xs text-sidebar-foreground/70">
          <span className="flex items-center gap-1.5"><ShieldCheck className="size-3.5" /> POPIA Compliant</span>
          <span className="flex items-center gap-1.5"><Lock className="size-3.5" /> AES-256 · TLS 1.3</span>
        </div>
      </div>

      {/* Right – form */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <Card className="w-full max-w-md border-border shadow-sm">
          <CardContent className="p-6 sm:p-8">
            <div className="lg:hidden flex items-center gap-2 mb-6">
              <div className="size-9 rounded-lg bg-primary text-primary-foreground grid place-items-center font-bold">G</div>
              <div className="font-semibold">Grey Analytics</div>
            </div>
            <h2 className="text-2xl font-semibold">{mode === "signin" ? "Welcome back" : "Create your account"}</h2>
            <p className="text-sm text-muted-foreground mt-1">{mode === "signin" ? "Sign in to see your latest audit." : "Start finding leaks in minutes."}</p>

            <form onSubmit={submit} className="mt-6 space-y-4">
              {mode === "signup" && (
                <div className="space-y-1.5">
                  <Label htmlFor="biz">Business name</Label>
                  <Input id="biz" placeholder="e.g. Bay Auto Repairs" required />
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@business.co.za" autoComplete="email" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete={mode === "signin" ? "current-password" : "new-password"} required />
              </div>
              <Button type="submit" className="w-full gap-2" disabled={loading}>
                {loading ? <><span className="size-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />Signing you in…</> : <>{mode === "signin" ? "Sign in" : "Create account"} <ArrowRight className="size-4" /></>}
              </Button>
            </form>

            {/* Edited by Copilot: Removed demo mode text
                Reason: Remove any text suggesting demo or mock UI from the interface
                to maintain production-ready presentation */}

            <div className="mt-6 text-center text-sm">
              {mode === "signin" ? "New here? " : "Already have an account? "}
              <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="text-primary font-medium hover:underline">
                {mode === "signin" ? "Create an account" : "Sign in"}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
