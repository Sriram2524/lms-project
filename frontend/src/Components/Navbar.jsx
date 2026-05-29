import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  GraduationCap, LogOut, Sparkles, Menu, X,
  BookOpen, Compass, LayoutDashboard, BarChart2, Bell,
} from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  // Shadow on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { to: "/courses",  label: "Courses",  icon: <BookOpen size={15} /> },
    { to: "/explore",  label: "Explore",  icon: <Compass size={15} /> },
    ...(user
      ? [
          { to: "/dashboard",     label: "Dashboard",     icon: <LayoutDashboard size={15} /> },
          { to: "/analytics",     label: "Analytics",     icon: <BarChart2 size={15} /> },
          { to: "/notifications", label: "Notifications", icon: <Bell size={15} /> },
        ]
      : []),
  ];

  const handleLogout = async () => {
    await logout();
    nav("/");
  };

  return (
    <header
      className={`border-b-2 border-black bg-white sticky top-0 z-40 transition-shadow duration-200 ${
        scrolled ? "shadow-[0_4px_0_0_#0A0A0A]" : ""
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0" data-testid="nav-logo">
          <div className="w-9 h-9 bg-black text-white flex items-center justify-center border-2 border-black">
            <GraduationCap size={18} />
          </div>
          <div className="font-display font-extrabold text-2xl leading-none">
            Brainrot Academy<span className="text-[#FF2E00]">.</span>
          </div>
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              data-testid={`nav-${l.label.toLowerCase()}`}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 font-semibold uppercase tracking-wider text-sm border-2 transition-all duration-150
                ${isActive
                  ? "border-black bg-black text-white"
                  : "border-transparent text-black hover:border-black hover:bg-[#FFE785]"
                }`
              }
            >
              {l.icon}
              {l.label}
            </NavLink>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {!user && (
            <>
              <Link to="/login" className="brutal-btn text-sm py-2 px-3" data-testid="nav-login-btn">
                Log in
              </Link>
              <Link
                to="/register"
                className="brutal-btn brutal-btn--red text-sm py-2 px-3 hidden sm:inline-flex"
                data-testid="nav-signup-btn"
              >
                <Sparkles size={14} /> Start free
              </Link>
            </>
          )}

          {user && (
            <>
              {/* User badge */}
              <div className="hidden sm:flex items-center gap-0 border-2 border-black overflow-hidden">
                <div className="px-2 py-1 bg-[#FFE785] border-r-2 border-black">
                  <span className="font-mono text-xs uppercase tracking-widest" data-testid="nav-user-role">
                    {user.role}
                  </span>
                </div>
                <div className="px-3 py-1">
                  <span className="font-bold text-sm">{user.name}</span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="brutal-btn text-sm py-2 px-3"
                data-testid="nav-logout-btn"
              >
                <LogOut size={14} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          )}

          {/* Mobile hamburger */}
          <button
            className="md:hidden brutal-btn p-2"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t-2 border-black bg-white animate-slideInDown">
          <nav className="flex flex-col">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                data-testid={`nav-${l.label.toLowerCase()}`}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-5 py-3 font-semibold uppercase tracking-wider text-sm border-b-2 border-black
                  ${isActive ? "bg-black text-white" : "hover:bg-[#FFE785]"}`
                }
              >
                {l.icon} {l.label}
              </NavLink>
            ))}

            {user && (
              <div className="px-5 py-3 flex items-center justify-between border-b-2 border-black bg-[#F4F4F4]">
                <div>
                  <div className="font-mono text-xs uppercase tracking-widest text-neutral-500">{user.role}</div>
                  <div className="font-bold text-sm">{user.name}</div>
                </div>
                <button onClick={handleLogout} className="brutal-btn text-xs py-1.5 px-3" data-testid="nav-logout-btn">
                  <LogOut size={13} /> Logout
                </button>
              </div>
            )}

            {!user && (
              <div className="px-5 py-3 flex gap-2">
                <Link to="/login"    className="brutal-btn text-sm flex-1 justify-center" data-testid="nav-login-btn">Log in</Link>
                <Link to="/register" className="brutal-btn brutal-btn--red text-sm flex-1 justify-center" data-testid="nav-signup-btn">
                  <Sparkles size={13} /> Start free
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}