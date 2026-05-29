import { Link, useNavigate } from "react-router-dom";
import { Home, ArrowLeft, Compass, BookOpen } from "lucide-react";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[85vh] bg-grid flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-2xl animate-fadeInUp">

        {/* Big 404 */}
        <div className="brutal-card p-10 sm:p-16 text-center relative overflow-hidden">

          {/* Background accent block */}
          <div
            className="absolute top-0 right-0 w-40 h-40 bg-[#FFE785] border-l-2 border-b-2 border-black"
            aria-hidden
          />

          <div className="relative z-10">
            {/* Error code */}
            <div className="font-mono text-xs uppercase tracking-[0.3em] text-neutral-500 mb-2">
              Error code
            </div>
            <div
              className="font-display font-extrabold leading-none tracking-tight"
              style={{ fontSize: "clamp(5rem, 20vw, 10rem)" }}
            >
              4<span className="text-[#FF2E00]">0</span>4
            </div>

            {/* Divider */}
            <div className="brutal-divider my-6" />

            {/* Message */}
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">
              Page not found<span className="text-[#FF2E00]">.</span>
            </h1>
            <p className="mt-3 text-neutral-600 max-w-md mx-auto leading-relaxed">
              Looks like this page took a detour. It might have moved, been
              deleted, or never existed in the first place.
            </p>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 justify-center mt-8">
              <button
                onClick={() => navigate(-1)}
                className="brutal-btn gap-2"
              >
                <ArrowLeft size={15} /> Go back
              </button>
              <Link to="/" className="brutal-btn brutal-btn--primary gap-2">
                <Home size={15} /> Home
              </Link>
              <Link to="/courses" className="brutal-btn brutal-btn--red gap-2">
                <BookOpen size={15} /> Browse courses
              </Link>
            </div>

            {/* Quick links */}
            <div className="mt-10 pt-6 border-t-2 border-black">
              <div className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-4">
                Maybe you were looking for
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {[
                  { to: "/courses", label: "Courses" },
                  { to: "/explore", label: "Explore" },
                  { to: "/dashboard", label: "Dashboard" },
                  { to: "/register", label: "Register" },
                ].map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    className="brutal-btn brutal-btn--sm brutal-btn--yellow"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Help text */}
        <div className="mt-4 text-center font-mono text-xs uppercase tracking-widest text-neutral-400">
          If this keeps happening, contact support.
        </div>
      </div>
    </div>
  );
}