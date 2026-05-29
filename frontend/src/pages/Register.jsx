import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast, Toaster } from "sonner";
import { Eye, EyeOff, UserPlus, Globe, GraduationCap, BookOpen } from "lucide-react";

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "student" });
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (k) => (e) => {
    setForm((p) => ({ ...p, [k]: e.target.value }));
    setErrors((p) => ({ ...p, [k]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Full name is required.";
    else if (form.name.trim().length < 2) e.name = "Name must be at least 2 characters.";
    if (!form.email.trim()) e.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email address.";
    if (!form.password) e.password = "Password is required.";
    else if (form.password.length < 8)
      e.password = "Password must be at least 8 characters.";
    else if (!/[A-Z]/.test(form.password) || !/[a-z]/.test(form.password) || !/[0-9]/.test(form.password))
      e.password = "Password must contain uppercase, lowercase, and a number.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setBusy(true);
    const r = await register(form);
    setBusy(false);
    if (r.ok) {
      toast.success("Account created! Welcome 🎉");
      nav("/dashboard");
    } else {
      toast.error(r.error || "Sign up failed");
    }
  };

  const googleLogin = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + "/dashboard";
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  const strengthScore = () => {
    const p = form.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 6) s++;
    if (p.length >= 10) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  };

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong", "Very strong"];
  const strengthColor = ["", "#FF2E00", "#FFB700", "#FFE785", "#00B86B", "#0047FF"];
  const score = strengthScore();

  return (
    <div className="min-h-[80vh] bg-grid flex items-center justify-center px-4 py-16">
      <Toaster richColors position="top-center" />

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8">
          <span className="section-tag">New here?</span>
          <h1 className="font-display text-5xl font-extrabold tracking-tight mt-4">
            Create account<span className="text-[#FF2E00]">.</span>
          </h1>
          <p className="mt-2 text-neutral-600">Join thousands of learners levelling up daily.</p>
        </div>

        {/* Card */}
        <div className="brutal-card p-8 space-y-5">

          {/* Google */}
          <button
            onClick={googleLogin}
            className="brutal-btn w-full justify-center gap-2 py-3"
            data-testid="register-google-btn"
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

            {/* Full name */}
            <div>
              <label className="font-mono text-xs uppercase tracking-widest block mb-1">Full name</label>
              <input
                required
                value={form.name}
                onChange={set("name")}
                className={`brutal-input ${errors.name ? "border-[#FF2E00]" : ""}`}
                placeholder="Priya Sharma"
                data-testid="register-name"
                autoComplete="name"
              />
              {errors.name && (
                <p className="mt-1 font-mono text-xs text-[#FF2E00] uppercase tracking-wide">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="font-mono text-xs uppercase tracking-widest block mb-1">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={set("email")}
                className={`brutal-input ${errors.email ? "border-[#FF2E00]" : ""}`}
                placeholder="you@example.com"
                data-testid="register-email"
                autoComplete="email"
              />
              {errors.email && (
                <p className="mt-1 font-mono text-xs text-[#FF2E00] uppercase tracking-wide">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="font-mono text-xs uppercase tracking-widest block mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={set("password")}
                  className={`brutal-input pr-11 ${errors.password ? "border-[#FF2E00]" : ""}`}
                  placeholder="Min 6 characters"
                  data-testid="register-password"
                  autoComplete="new-password"
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

              {/* Strength bar */}
              {form.password && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="flex-1 h-1.5 border border-black transition-all duration-300"
                        style={{ background: i <= score ? strengthColor[score] : "#F4F4F4" }}
                      />
                    ))}
                  </div>
                  <p className="font-mono text-xs uppercase tracking-widest" style={{ color: strengthColor[score] }}>
                    {strengthLabel[score]}
                  </p>
                </div>
              )}

              {errors.password && (
                <p className="mt-1 font-mono text-xs text-[#FF2E00] uppercase tracking-wide">{errors.password}</p>
              )}
            </div>

            {/* Role selector */}
            <div>
              <label className="font-mono text-xs uppercase tracking-widest block mb-2">I am a</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: "student", label: "Student", icon: <BookOpen size={15} />, desc: "I want to learn" },
                  { value: "instructor", label: "Instructor", icon: <GraduationCap size={15} />, desc: "I want to teach" },
                ].map((r) => (
                  <button
                    type="button"
                    key={r.value}
                    onClick={() => setForm((p) => ({ ...p, role: r.value }))}
                    data-testid={`register-role-${r.value}`}
                    className={`brutal-btn flex-col items-start gap-1 py-3 px-4 h-auto transition-all ${
                      form.role === r.value ? "brutal-btn--primary" : ""
                    }`}
                  >
                    <span className="flex items-center gap-1.5 font-bold">{r.icon} {r.label}</span>
                    <span className={`font-mono text-xs tracking-wide normal-case ${form.role === r.value ? "text-neutral-300" : "text-neutral-500"}`}>
                      {r.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={busy}
              className="brutal-btn brutal-btn--red w-full justify-center py-3 mt-2"
              data-testid="register-submit"
            >
              {busy ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating account…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <UserPlus size={16} /> Create account
                </span>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="mt-5 text-sm text-center">
          Already have an account?{" "}
          <Link to="/login" className="font-bold underline underline-offset-2 hover:text-[#FF2E00] transition-colors">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}