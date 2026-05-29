import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function AuthCallback() {
  const nav = useNavigate();
  const { setUser } = useAuth();
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const hash = window.location.hash || "";
    const m = hash.match(/session_id=([^&]+)/);
    if (!m) { nav("/login"); return; }
    const sessionId = m[1];

    (async () => {
      try {
        const { data } = await api.post("/auth/google/session", null, { headers: { "X-Session-ID": sessionId } });
        setUser(data);
        window.history.replaceState(null, "", "/dashboard");
        nav("/dashboard", { replace: true });
      } catch {
        nav("/login", { replace: true });
      }
    })();
  }, [nav, setUser]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="font-mono uppercase tracking-widest text-sm" data-testid="auth-callback">Signing you in…</div>
    </div>
  );
}
