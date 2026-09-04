import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import * as api from "@/services/api";
import { MOCK_DISCLAIMER } from "@/services/api";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Officer Sign-in — LegalMetriCheck" },
      {
        name: "description",
        content: "Sign in to the Legal Metrology packaged commodity compliance console.",
      },
      { property: "og:title", content: "Officer Sign-in — LegalMetriCheck" },
      {
        property: "og:description",
        content: "Sign in to the Legal Metrology packaged commodity compliance console.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("a.rao@legalmetrology.gov.in");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    await api.login(email, password);
    setBusy(false);
    toast.success("Signed in (demo session)");
    navigate({ to: "/" });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10 font-sans">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center gap-2">
          <div className="grid size-9 place-items-center rounded-md bg-primary text-xs font-bold tracking-wider text-primary-foreground">
            LM
          </div>
          <div className="leading-tight">
            <div className="font-display text-base font-bold">LegalMetriCheck</div>
            <div className="text-[11px] text-muted-foreground">Legal Metrology Enforcement</div>
          </div>
        </div>

        <div className="panel p-6">
          <h1 className="font-display text-xl font-bold">Officer sign-in</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Use your departmental credentials to open the compliance console.
          </p>

          <form className="mt-5 space-y-4" onSubmit={onSubmit}>
            <div className="space-y-1.5">
              <Label htmlFor="email">Official email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Any value works in this demo"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <p className="mt-4 border-t border-border pt-3 text-[11px] text-muted-foreground">
            {MOCK_DISCLAIMER} No credentials are verified or stored.
          </p>
        </div>
      </div>
    </div>
  );
}
