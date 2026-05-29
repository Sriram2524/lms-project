import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast, Toaster } from "sonner";
import { Eye, EyeOff, LogIn, Globe } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!email.trim()) e.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Enter a valid email.";
    if (!password) e.password = "Password is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setBusy(true);
    const r = await login(email, password);
    setBusy(false);
    if (r.ok) {
      toast.success("Welcome back!");
      nav("/dashboard");
    } else {
      toast.error(r.error || "Login failed");
    }
  };

  const googleLogin = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + "/dashboard";
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  return (
    <div className="min-h-[80vh] bg-grid flex items-center justify-center px-4 py-16">
      <Toaster richColors position="top-center" />

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8">
          <span className="section-tag">Welcome back</span>
          <h1 className="font-display text-5xl font-extrabold tracking-tight mt-4">
            Log in<span className="text-[#FF2E00]">.</span>
          </h1>
          <p className="mt-2 text-neutral-600">Slip back into your learning streak.</p>
        </div>

        {/* Card */}
        <div className="brutal-card p-8 space-y-5">

          {/* Google */}
          <button
            onClick={googleLogin}
            className="brutal-btn w-full justify-center gap-2 py-3"
            data-testid="login-google-btn"
          >
            <Globe size={16} />
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-[2px] bg-black" />
            <span className="font-mono text-xs uppercase tracking-widest text-neutral-500">or</span>
            <div className="flex-1 h-[2px] bg-black" />
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} noValidate className="space-y-4">

            {/* Email */}
            <div>
              <label className="font-mono text-xs uppercase tracking-widest block mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: "" })); }}
                className={`brutal-input ${errors.email ? "border-[#FF2E00] focus:box-shadow-none" : ""}`}
                placeholder="you@example.com"
                data-testid="login-email"
                autoComplete="email"
              />
              {errors.email && (
                <p className="mt-1 font-mono text-xs text-[#FF2E00] uppercase tracking-wide">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-mono text-xs uppercase tracking-widest">Password</label>
                <Link to="/forgot-password" className="font-mono text-xs text-neutral-400 uppercase tracking-widest hover:text-[#FF2E00] transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: "" })); }}
                  className={`brutal-input pr-11 ${errors.password ? "border-[#FF2E00]" : ""}`}
                  placeholder="••••••••"
                  data-testid="login-password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black transition-colors"
                  tabIndex={-1}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 font-mono text-xs text-[#FF2E00] uppercase tracking-wide">{errors.password}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={busy}
              className="brutal-btn brutal-btn--primary w-full justify-center py-3 mt-2 relative"
              data-testid="login-submit"
            >
              {busy ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Logging in…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn size={16} /> Log in
                </span>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="mt-5 text-sm text-center">
          No account?{" "}
          <Link to="/register" className="font-bold underline underline-offset-2 hover:text-[#FF2E00] transition-colors">
            Sign up free
          </Link>
        </p>
      </div>
    </div>
  );
}