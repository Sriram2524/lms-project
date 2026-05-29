import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import { Link } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend,
} from "recharts";
import { BookOpen, Trophy, Flame, Users, ArrowRight, Plus, RefreshCw, TrendingUp, Star } from "lucide-react";
import InstructorCourseManager from "./InstructorCourseManager";

const COLORS = ["#FF2E00", "#0047FF", "#00B86B", "#FFE785", "#FFB7E1"];

/* ---------- Skeleton ---------- */
function Skeleton({ className = "" }) {
  return (
    <div className={`animate-pulse bg-neutral-200 ${className}`} />
  );
}

function StatSkeleton() {
  return (
    <div className="brutal-card p-5 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="w-10 h-10" />
        <Skeleton className="w-20 h-3" />
      </div>
      <Skeleton className="w-16 h-8 mt-3" />
    </div>
  );
}

/* ---------- Stat Tile ---------- */
function StatTile({ icon, label, value, accent, sub }) {
  return (
    <div className="brutal-card p-5 group" style={{ boxShadow: `6px 6px 0px 0px ${accent}` }}>
      <div className="flex items-center justify-between">
        <div
          className="w-10 h-10 border-2 border-black flex items-center justify-center transition-colors"
          style={{ background: accent + "22" }}
        >
          {icon}
        </div>
        <div className="font-mono text-xs uppercase tracking-widest text-neutral-500">{label}</div>
      </div>
      <div className="font-display text-4xl font-extrabold tracking-tight mt-3">{value ?? "—"}</div>
      {sub && <div className="font-mono text-xs text-neutral-400 mt-1 uppercase tracking-widest">{sub}</div>}
    </div>
  );
}

/* ---------- Quick Actions ---------- */
function QuickActions({ isInst }) {
  const actions = isInst
    ? [
        { label: "New Course", icon: <Plus size={15} />, to: "/dashboard", accent: "brutal-btn--red" },
        { label: "View Courses", icon: <BookOpen size={15} />, to: "/courses", accent: "" },
        { label: "Explore", icon: <Star size={15} />, to: "/explore", accent: "" },
      ]
    : [
        { label: "Browse Courses", icon: <BookOpen size={15} />, to: "/courses", accent: "brutal-btn--red" },
        { label: "Explore Feed", icon: <Star size={15} />, to: "/explore", accent: "" },
        { label: "My Progress", icon: <TrendingUp size={15} />, to: "/dashboard", accent: "" },
      ];

  return (
    <div className="flex flex-wrap gap-2 mt-4">
      {actions.map((a) => (
        <Link key={a.label} to={a.to} className={`brutal-btn ${a.accent} text-xs`}>
          {a.icon} {a.label}
        </Link>
      ))}
    </div>
  );
}

/* ---------- Dashboard Header ---------- */
function DashboardHeader({ user, isInst, onRefresh, refreshing }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="border-b-2 border-black bg-grid">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <span className="section-tag">{isInst ? "Instructor Studio" : "Student Dashboard"}</span>
            <h1 className="font-display text-5xl font-extrabold tracking-tight mt-4">
              {greeting}, {user?.name?.split(" ")[0] || "Learner"}<span className="text-[#FF2E00]">.</span>
            </h1>
            <p className="mt-2 text-neutral-600 max-w-xl">
              {isInst
                ? "Build courses, track enrollments, see how your students vibe."
                : "Your progress, your wins, your next move."}
            </p>
            <QuickActions isInst={isInst} />
          </div>

          {/* Date + refresh */}
          <div className="flex flex-col items-end gap-3">
            <div className="brutal-card px-4 py-2 text-right">
              <div className="font-mono text-xs uppercase tracking-widest text-neutral-500">Today</div>
              <div className="font-display font-bold text-lg">
                {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </div>
            </div>
            <button
              onClick={onRefresh}
              disabled={refreshing}
              className="brutal-btn text-xs"
            >
              <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
              {refreshing ? "Refreshing…" : "Refresh"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Student View ---------- */
function StudentView({ stats, enrollments, loading }) {
  if (loading) {
    return (
      <>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => <StatSkeleton key={i} />)}
        </div>
        <div className="grid md:grid-cols-2 gap-6 mt-10">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </>
    );
  }

  if (!stats) return (
    <div className="brutal-card p-10 text-center">
      <div className="font-mono text-sm uppercase tracking-widest text-neutral-500">Failed to load stats.</div>
    </div>
  );

  const avgPct = Math.round((stats.avg_progress || 0) * 100);

  return (
    <>
      {/* Stat tiles */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatTile icon={<BookOpen size={18} />} label="Enrolled" value={stats.total_courses} accent="#FF2E00" />
        <StatTile icon={<Flame size={18} />} label="In progress" value={stats.in_progress} accent="#0047FF" />
        <StatTile icon={<Trophy size={18} />} label="Completed" value={stats.completed} accent="#00B86B" />
        <StatTile icon={<Users size={18} />} label="Lessons done" value={stats.lessons_completed} accent="#0A0A0A" />
      </div>

      {/* Charts row */}
      <div className="grid md:grid-cols-2 gap-6 mt-10">
        {/* Progress bar card */}
        <div className="brutal-card p-6">
          <span className="section-tag">Avg progress</span>
          <div className="font-display text-5xl font-extrabold mt-3">{avgPct}%</div>
          <div className="mt-4 w-full h-5 border-2 border-black bg-neutral-100 overflow-hidden">
            <div
              className="h-full bg-[#FF2E00] transition-all duration-700"
              style={{ width: `${avgPct}%` }}
            />
          </div>
          <div className="mt-2 font-mono text-xs text-neutral-400 uppercase tracking-widest">
            {avgPct < 30 ? "Just getting started 🚀" : avgPct < 70 ? "Keep going! 🔥" : "Almost there! 🏆"}
          </div>
        </div>

        {/* Category pie */}
        <div className="brutal-card p-6">
          <span className="section-tag">By category</span>
          {!stats.by_category?.length ? (
            <div className="flex flex-col items-center justify-center h-36 gap-3">
              <div className="font-mono text-xs uppercase tracking-widest text-neutral-400">Enroll in a course to see stats.</div>
              <Link to="/courses" className="brutal-btn brutal-btn--red text-xs">
                Browse courses <ArrowRight size={13} />
              </Link>
            </div>
          ) : (
            <div className="h-44 mt-2">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={stats.by_category} dataKey="count" nameKey="category" outerRadius={70} label={({ name }) => name}>
                    {stats.by_category.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* My courses */}
      <div className="flex items-center justify-between mt-12 mb-5">
        <h2 className="font-display text-3xl font-extrabold tracking-tight">My courses</h2>
        <Link to="/courses" className="brutal-btn text-xs">
          Browse more <ArrowRight size={13} />
        </Link>
      </div>

      {enrollments.length === 0 ? (
        <div className="brutal-card p-10 text-center border-dashed">
          <BookOpen size={32} className="mx-auto text-neutral-300 mb-3" />
          <div className="font-mono uppercase tracking-widest text-sm text-neutral-400">No enrollments yet.</div>
          <Link to="/courses" className="brutal-btn brutal-btn--red mt-4 inline-flex text-sm">
            Browse courses <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {enrollments.map(({ enrollment, course }) => {
            const pct = Math.round((enrollment.progress || 0) * 100);
            return (
              <Link
                key={enrollment.enrollment_id}
                to={`/courses/${course.course_id}`}
                className="brutal-card p-5 flex flex-col gap-3"
                data-testid={`enrolled-${course.course_id}`}
              >
                <div className="flex items-center justify-between">
                  <span className="section-tag">{course.category}</span>
                  <span
                    className="font-mono text-xs px-2 py-1 border-2 border-black"
                    style={{ background: pct === 100 ? "#00B86B" : pct > 0 ? "#FFE785" : "#F4F4F4" }}
                  >
                    {pct}%
                  </span>
                </div>
                <div className="font-display text-xl font-bold leading-tight">{course.title}</div>
                <div className="mt-auto w-full h-2 border-2 border-black bg-neutral-100 overflow-hidden">
                  <div className="h-full bg-[#FF2E00] transition-all duration-500" style={{ width: `${pct}%` }} />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}

/* ---------- Instructor View ---------- */
function InstructorView({ stats, loading }) {
  const [filter, setFilter] = useState("all");

  if (loading) {
    return (
      <>
        <div className="grid sm:grid-cols-3 gap-5">
          {[...Array(3)].map((_, i) => <StatSkeleton key={i} />)}
        </div>
        <Skeleton className="h-64 mt-8" />
      </>
    );
  }

  return (
    <>
      <div className="grid sm:grid-cols-3 gap-5">
        <StatTile icon={<BookOpen size={18} />} label="My courses" value={stats?.total_courses} accent="#FF2E00" sub="published" />
        <StatTile icon={<Users size={18} />} label="Total enrolled" value={stats?.total_enrolled} accent="#0047FF" sub="students" />
        <StatTile icon={<Trophy size={18} />} label="Avg rating" value={stats?.avg_rating} accent="#00B86B" sub="out of 5" />
      </div>

      {stats?.by_course?.length > 0 && (
        <div className="brutal-card p-6 mt-8">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
            <span className="section-tag">Enrollments per course</span>
            {/* filter pills (UI only — extend with real data as needed) */}
            <div className="flex gap-2">
              {["all", "week", "month"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`brutal-btn text-xs ${filter === f ? "brutal-btn--primary" : ""}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={stats.by_course}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis dataKey="title" tick={{ fontSize: 10, fontFamily: "Space Mono" }} interval={0} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ border: "2px solid #0A0A0A", borderRadius: 0, fontFamily: "Space Mono", fontSize: 11 }}
                />
                <Bar dataKey="enrolled" fill="#FF2E00" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Rating trend placeholder */}
      {stats?.by_course?.length > 0 && (
        <div className="brutal-card p-6 mt-6">
          <span className="section-tag">Rating overview</span>
          <div className="h-48 mt-4">
            <ResponsiveContainer>
              <LineChart data={stats.by_course.map((c) => ({ name: c.title, rating: stats.avg_rating || 4.5 }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 5]} tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ border: "2px solid #0A0A0A", borderRadius: 0, fontSize: 11 }} />
                <Line type="monotone" dataKey="rating" stroke="#0047FF" strokeWidth={2} dot={{ fill: "#0047FF", strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="mt-10">
        <InstructorCourseManager />
      </div>
    </>
  );
}

/* ---------- Main ---------- */
export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [myEnrollments, setMyEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const isInst = user?.role === "instructor" || user?.role === "admin";

  const loadDashboard = async (silent = false) => {
    if (!user) return;
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      if (isInst) {
        const { data } = await api.get("/analytics/instructor");
        setStats(data);
      } else {
        const [statsRes, enrollRes] = await Promise.all([
          api.get("/analytics/student"),
          api.get("/my/enrollments"),
        ]);
        setStats(statsRes.data);
        setMyEnrollments(enrollRes.data);
      }
    } catch (err) {
      console.error("Dashboard load failed:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadDashboard(); }, [user]);

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="brutal-card px-8 py-6 flex items-center gap-3">
          <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
          <span className="font-mono uppercase tracking-widest text-sm">Loading dashboard…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <DashboardHeader user={user} isInst={isInst} onRefresh={() => loadDashboard(true)} refreshing={refreshing} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {isInst
          ? <InstructorView stats={stats} loading={loading} />
          : <StudentView stats={stats} enrollments={myEnrollments} loading={loading} />
        }
      </div>
    </div>
  );
}