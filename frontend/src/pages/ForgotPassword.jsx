import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { toast, Toaster } from "sonner";
import { Mail, ArrowLeft, Send, CheckCircle, KeyRound } from "lucide-react";

/* ── Field error ── */
function FieldError({ msg }) {
  if (!msg) return null;
  return (
    <p className="font-mono text-xs text-[#FF2E00] uppercase tracking-wide mt-1">
      {msg}
    </p>
  );
}

/* ── Step 1: enter email ── */
function EmailStep({ onSent }) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const validate = () => {
    if (!email.trim()) return "Email is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return "Enter a valid email address.";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setError("");
    setBusy(true);
    try {
      // Replace with your actual forgot-password API endpoint
      await api.post("/auth/forgot-password", { email });
      toast.success("Reset link sent! Check your inbox.");
      onSent(email);
    } catch (ex) {
      const msg =
        ex?.response?.data?.detail || "Could not send reset link. Try again.";
      toast.error(typeof msg === "string" ? msg : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {/* Email */}
      <div>
        <label className="font-mono text-xs uppercase tracking-widest text-neutral-600 block mb-1">
          Email address
        </label>
        <div className="relative">
          <Mail
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
          />
          <input
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(""); }}
            className={`brutal-input pl-9 ${error ? "brutal-input--error" : ""}`}
            data-testid="forgot-email-input"
          />
        </div>
        <FieldError msg={error} />
      </div>

      <button
        type="submit"
        disabled={busy}
        className="brutal-btn brutal-btn--primary w-full justify-center py-3 gap-2"
        data-testid="forgot-submit-btn"
      >
        {busy ? (
          <>
            <span className="bounce-dot" />
            <span className="bounce-dot" />
            <span className="bounce-dot" />
          </>
        ) : (
          <>
            <Send size={15} /> Send reset link
          </>
        )}
      </button>
    </form>
  );
}

/* ── Step 2: sent confirmation ── */
function SentStep({ email }) {
  return (
    <div className="text-center space-y-5 animate-scaleIn">
      <div className="w-16 h-16 border-2 border-black bg-[#00B86B] flex items-center justify-center mx-auto">
        <CheckCircle size={28} className="text-white" />
      </div>
      <div>
        <h2 className="font-display text-2xl font-extrabold tracking-tight">
          Check your inbox<span className="text-[#FF2E00]">.</span>
        </h2>
        <p className="mt-2 text-neutral-600 text-sm leading-relaxed">
          We sent a password reset link to{" "}
          <span className="font-bold">{email}</span>. It expires in 15 minutes.
        </p>
      </div>

      {/* Tips */}
      <div className="brutal-card brutal-card--flat p-4 text-left space-y-2 bg-[#F4F4F4]">
        {[
          "Check your spam / junk folder.",
          "Make sure you used the email linked to your account.",
          "Allow up to 2 minutes for delivery.",
        ].map((tip) => (
          <div key={tip} className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 bg-[#FF2E00] mt-2 shrink-0" />
            <span className="font-mono text-xs uppercase tracking-wide text-neutral-600">
              {tip}
            </span>
          </div>
        ))}
      </div>

      <Link
        to="/login"
        className="brutal-btn brutal-btn--primary w-full justify-center py-3 gap-2"
      >
        <ArrowLeft size={15} /> Back to login
      </Link>
    </div>
  );
}

/* ── Main ── */
export default function ForgotPassword() {
  const [sent, setSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");

  const handleSent = (email) => {
    setSentEmail(email);
    setSent(true);
  };

  return (
    <div className="min-h-[80vh] bg-grid flex items-center justify-center px-4 py-16">
      <Toaster richColors position="top-center" />

      <div className="w-full max-w-md animate-fadeInUp">
        {/* Header */}
        {!sent && (
          <div className="mb-8">
            <span className="section-tag">
              <KeyRound size={11} /> Account recovery
            </span>
            <h1 className="font-display text-5xl font-extrabold tracking-tight mt-4">
              Forgot password<span className="text-[#FF2E00]">.</span>
            </h1>
            <p className="mt-2 text-neutral-600">
              Enter your email and we'll send you a reset link.
            </p>
          </div>
        )}

        {/* Card */}
        <div className="brutal-card p-8">
          {sent ? (
            <SentStep email={sentEmail} />
          ) : (
            <>
              <EmailStep onSent={handleSent} />

              {/* Divider */}
              <div className="brutal-divider" />

              {/* Footer links */}
              <div className="flex items-center justify-between text-sm">
                <Link
                  to="/login"
                  className="brutal-btn brutal-btn--ghost brutal-btn--sm gap-1 text-neutral-600"
                >
                  <ArrowLeft size={13} /> Back to login
                </Link>
                <Link
                  to="/register"
                  className="font-semibold underline underline-offset-2 hover:text-[#FF2E00] transition-colors"
                >
                  Create account
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Bottom note */}
        {!sent && (
          <p className="mt-4 text-center font-mono text-xs uppercase tracking-widest text-neutral-400">
            Remembered it? &nbsp;
            <Link to="/login" className="text-[#0047FF] hover:underline">
              Log in
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}