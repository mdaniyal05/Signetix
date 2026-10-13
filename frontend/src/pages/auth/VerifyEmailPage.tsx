import { useEffect, useRef, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, MailCheck } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/auth/AuthContext";
import { otpApi } from "@/api/otp";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Hide most of an email: a***@example.com
function maskEmail(email?: string): string {
  if (!email) return "your email";
  const [name, domain] = email.split("@");
  if (!domain) return email;
  return `${name[0]}${"*".repeat(Math.max(name.length - 1, 1))}@${domain}`;
}

export function VerifyEmailPage() {
  const { session, patchSession } = useAuth();
  const navigate = useNavigate();
  const phone = session?.phoneNumber ?? "";

  const [code, setCode] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const autoSent = useRef(false);

  const sendCode = async () => {
    setSending(true);
    try {
      await otpApi.request(phone);
      toast.success(`Code sent to ${maskEmail(session?.email)}`);
    } catch (error) {
      toast.error("Could not send code", {
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setSending(false);
    }
  };

  // Already verified → nothing to do here.
  useEffect(() => {
    if (session?.isVerified) navigate("/", { replace: true });
  }, [session?.isVerified, navigate]);

  // Auto-send the first code on arrival.
  useEffect(() => {
    if (autoSent.current || !phone) return;
    autoSent.current = true;
    void sendCode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phone]);

  const handleVerify = async (event: FormEvent) => {
    event.preventDefault();
    if (code.trim().length < 6) return;
    setVerifying(true);
    try {
      await otpApi.verify(phone, code.trim());
      patchSession({ isVerified: true });
      toast.success("Email verified");
      navigate("/", { replace: true });
    } catch (error) {
      toast.error("Invalid or expired code", {
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <img
            src="/logo.png"
            alt="Signetix"
            className="mx-auto mb-2 h-20 w-auto object-contain dark:brightness-0 dark:invert"
          />
          <CardTitle className="text-2xl">Verify your email</CardTitle>
          <CardDescription>
            Enter the 6-digit code we sent to {maskEmail(session?.email)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleVerify}>
            <div className="space-y-2">
              <Label htmlFor="code">Verification code</Label>
              <Input
                id="code"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="123456"
                value={code}
                onChange={(event) =>
                  setCode(event.target.value.replace(/\D/g, ""))
                }
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={verifying || code.trim().length < 6}
            >
              {verifying ? <Loader2 className="animate-spin" /> : <MailCheck />}
              Verify
            </Button>
          </form>
          <div className="mt-4 flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={sendCode}
              disabled={sending}
              className="font-medium text-foreground underline disabled:opacity-50"
            >
              {sending ? "Sending…" : "Resend code"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="text-muted-foreground hover:text-foreground"
            >
              Skip for now
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
