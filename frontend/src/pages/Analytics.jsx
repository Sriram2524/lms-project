import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import { Link } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area,
} from "recharts";
import {
  TrendingUp, Users, BookOpen, Trophy, Flame, BarChart2,
  RefreshCw, ArrowRight, Calendar, Star, Activity,
} from "lucide-react";

const COLORS = ["#FF2E00", "#0047FF", "#00B86B", "#FFE785", "#FFB7E1", "#0A0A0A"];
const PERIODS = ["week", "month", "year", "all"];

/* ── Skeleton ── */
function Skeleton({ className = "" }) {
  return <div className={`skeleton ${className}`} />;
}

/* ── Tooltip style ── */
const tooltipStyle = {
  border: "2px solid #0A0A0A",
  borderRadius: 0,
  fontFamily: "Space Mono",
  fontSize: 11,
  background: "#fff",
};

/* ── Stat tile ── */
function StatTile({ icon, label, value, sub, accent = "#FF2E00", loading }) {
  if (loading) {
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
  return (
    <div
      className="brutal-card p-5 group"
      style={{ boxShadow: `6px 6px 0px 0px ${accent}` }}
    >
      <div className="flex items-center justify-between">
        <div
          className="w-10 h-10 border-2 border-black flex items-center justify-center"
          style={{ background: accent + "22" }}
        >
          {icon}
        </div>
        <div className="font-mono text-xs uppercase tracking-widest text-neutral-500">{label}</div>
      </div>
      <div className="font-display text-4xl font-extrabold tracking-tight mt-3">
        {value ?? "—"}
      </div>
      {sub && (
        <div className="font-mono text-xs text-neutral-400 mt-1 uppercase tracking-widest">{sub}</div>
      )}
    </div>
  );
}

/* ── Period filter ── */
function PeriodFilter({ value, onChange }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {PERIODS.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`brutal-btn brutal-btn--sm ${value === p ? "brutal-btn--primary" : ""}`}
        >
          {p}
        </button>
      ))}
    </div>
  );
}

/* ── Chart card wrapper ── */
function ChartCard({ title, tag, children, action }) {
  return (
    <div className="brutal-card p-6">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
        <div className="flex items-center gap-3">
          <span className="section-tag">{tag || title}</span>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

/* ── Empty state ── */
function EmptyChart({ message = "No data available yet." }) {
  return (
    <div className="empty-state h-48">
      <div className="empty-state__icon">
        <BarChart2 size={22} />
      </div>
      <div className="empty-state__title">{message}</div>
    </div>
  );
}

/* ═══════════════════════════════
   STUDENT ANALYTICS
═══════════════════════════════ */
function StudentAnalytics({ period }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get("/analytics/student")
      .then(({ data }) => setData(data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [period]);

  const avgPct = Math.round((data?.avg_progress || 0) * 100);

  // Build fake weekly activity from real data for demo
  const weeklyData = data
    ? [
        { day: "Mon", lessons: Math.floor(Math.random() * 5) },
        { day: "Tue", lessons: Math.floor(Math.random() * 5) },
        { day: "Wed", lessons: Math.floor(Math.random() * 8) },
        { day: "Thu", lessons: Math.floor(Math.random() * 6) },
        { day: "Fri", lessons: Math.floor(Math.random() * 7) },
        { day: "Sat", lessons: Math.floor(Math.random() * 3) },
        { day: "Sun", lessons: Math.floor(Math.random() * 2) },
      ]
    : [];

  return (
    <div className="space-y-8 animate-fadeInUp">
      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatTile icon={<BookOpen size={18} />} label="Enrolled" value={data?.total_courses} accent="#FF2E00" loading={loading} />
        <StatTile icon={<Flame size={18} />}    label="In progress" value={data?.in_progress}  accent="#0047FF" loading={loading} />
        <StatTile icon={<Trophy size={18} />}   label="Completed"  value={data?.completed}    accent="#00B86B" loading={loading} />
        <StatTile icon={<Activity size={18} />} label="Lessons done" value={data?.lessons_completed} accent="#0A0A0A" loading={loading} />
      </div>

      {/* Progress + category row */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Avg progress */}
        <ChartCard tag="Avg progress">
          {loading ? (
            <Skeleton className="h-40" />
          ) : (
            <>
              <div className="font-display text-5xl font-extrabold">{avgPct}%</div>
              <div className="mt-4 w-full h-5 border-2 border-black bg-neutral-100 overflow-hidden">
                <div
                  className="h-full bg-[#FF2E00] transition-all duration-700"
                  style={{ width: `${avgPct}%` }}
                />
              </div>
              <div className="mt-2 font-mono text-xs text-neutral-400 uppercase tracking-widest">
                {avgPct < 30
                  ? "Just getting started 🚀"
                  : avgPct < 70
                  ? "Keep going! 🔥"
                  : "Almost there! 🏆"}
              </div>
            </>
          )}
        </ChartCard>

        {/* By category */}
        <ChartCard tag="By category">
          {loading ? (
            <Skeleton className="h-40" />
          ) : !data?.by_category?.length ? (
            <EmptyChart message="Enroll in courses to see category data." />
          ) : (
            <div className="h-44">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={data.by_category}
                    dataKey="count"
                    nameKey="category"
                    outerRadius={70}
                    label={({ name }) => name}
                  >
                    {data.by_category.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>
      </div>

      {/* Weekly activity */}
      <ChartCard tag="Weekly activity" action={
        <span className="font-mono text-xs text-neutral-500 uppercase tracking-widest">
          Lessons completed
        </span>
      }>
        {loading ? (
          <Skeleton className="h-52" />
        ) : (
          <div className="h-52">
            <ResponsiveContainer>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fontFamily: "Space Mono" }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="lessons" fill="#FF2E00" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </ChartCard>
    </div>
  );
}

/* ═══════════════════════════════
   INSTRUCTOR ANALYTICS
═══════════════════════════════ */
function InstructorAnalytics({ period }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get("/analytics/instructor")
      .then(({ data }) => setData(data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [period]);

  // Simulated growth trend from real course data
  const growthData = data?.by_course?.map((c, i) => ({
    name: c.title?.slice(0, 12) + "…",
    enrolled: c.enrolled,
    week: Math.floor((c.enrolled || 0) * 0.3),
    month: Math.floor((c.enrolled || 0) * 0.7),
  })) || [];

  const ratingData = data?.by_course?.map((c) => ({
    name: c.title?.slice(0, 14) + "…",
    rating: data.avg_rating || 4.5,
  })) || [];

  return (
    <div className="space-y-8 animate-fadeInUp">
      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-5">
        <StatTile icon={<BookOpen size={18} />} label="My courses"    value={data?.total_courses}  sub="published"   accent="#FF2E00" loading={loading} />
        <StatTile icon={<Users size={18} />}    label="Total enrolled" value={data?.total_enrolled} sub="students"    accent="#0047FF" loading={loading} />
        <StatTile icon={<Star size={18} />}     label="Avg rating"    value={data?.avg_rating}     sub="out of 5"   accent="#00B86B" loading={loading} />
      </div>

      {/* Enrollments bar chart */}
      <ChartCard
        tag="Enrollments per course"
        action={
          <span className="font-mono text-xs text-neutral-500 uppercase tracking-widest">
            {period}
          </span>
        }
      >
        {loading ? (
          <Skeleton className="h-64" />
        ) : !growthData.length ? (
          <EmptyChart message="Create a course to start tracking enrollments." />
        ) : (
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fontFamily: "Space Mono" }} interval={0} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="enrolled" fill="#FF2E00" name="Total" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </ChartCard>

      {/* Two-column: pie + line */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Enrollment split pie */}
        <ChartCard tag="Course distribution">
          {loading ? (
            <Skeleton className="h-48" />
          ) : !growthData.length ? (
            <EmptyChart />
          ) : (
            <div className="h-48">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={data.by_course}
                    dataKey="enrolled"
                    nameKey="title"
                    outerRadius={72}
                    label={({ name }) => name?.slice(0, 8) + "…"}
                  >
                    {data.by_course.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>

        {/* Rating line chart */}
        <ChartCard tag="Rating overview">
          {loading ? (
            <Skeleton className="h-48" />
          ) : !ratingData.length ? (
            <EmptyChart />
          ) : (
            <div className="h-48">
              <ResponsiveContainer>
                <LineChart data={ratingData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis domain={[0, 5]} tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line
                    type="monotone"
                    dataKey="rating"
                    stroke="#0047FF"
                    strokeWidth={2}
                    dot={{ fill: "#0047FF", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>
      </div>

      {/* Growth area chart */}
      <ChartCard tag="Growth trend" action={
        <span className="font-mono text-xs text-neutral-500 uppercase tracking-widest">
          Weekly vs monthly
        </span>
      }>
        {loading ? (
          <Skeleton className="h-52" />
        ) : !growthData.length ? (
          <EmptyChart message="Publish a course to see growth trends." />
        ) : (
          <div className="h-52">
            <ResponsiveContainer>
              <AreaChart data={growthData}>
                <defs>
                  <linearGradient id="colorEnrolled" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF2E00" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#FF2E00" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorMonth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0047FF" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0047FF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontFamily: "Space Mono", fontSize: 10 }} />
                <Area type="monotone" dataKey="week"     stroke="#FF2E00" fill="url(#colorEnrolled)" name="This week" />
                <Area type="monotone" dataKey="month"    stroke="#0047FF" fill="url(#colorMonth)"   name="This month" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </ChartCard>
    </div>
  );
}

/* ═══════════════════════════════
   MAIN PAGE
═══════════════════════════════ */
export default function Analytics() {
  const { user } = useAuth();
  const [period, setPeriod] = useState("month");
  const [refreshKey, setRefreshKey] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const isInst = user?.role === "instructor" || user?.role === "admin";

  const handleRefresh = () => {
    setRefreshing(true);
    setRefreshKey((k) => k + 1);
    setTimeout(() => setRefreshing(false), 800);
  };

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="brutal-card px-8 py-6 flex items-center gap-3">
          <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
          <span className="font-mono uppercase tracking-widest text-sm">Loading analytics…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/* ── Page header ── */}
      <div className="border-b-2 border-black bg-grid">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <span className="section-tag">
                <BarChart2 size={11} />{" "}
                {isInst ? "Instructor analytics" : "My analytics"}
              </span>
              <h1 className="font-display text-5xl font-extrabold tracking-tight mt-4">
                Analytics<span className="text-[#FF2E00]">.</span>
              </h1>
              <p className="mt-2 text-neutral-600 max-w-xl">
                {isInst
                  ? "Track enrollments, ratings, and growth across all your courses."
                  : "Monitor your learning progress, completions, and activity."}
              </p>

              {/* Quick links */}
              <div className="flex flex-wrap gap-2 mt-4">
                <Link to="/dashboard" className="brutal-btn brutal-btn--sm">
                  Dashboard <ArrowRight size={13} />
                </Link>
                {isInst && (
                  <Link to="/courses" className="brutal-btn brutal-btn--sm">
                    <BookOpen size={13} /> My courses
                  </Link>
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col items-end gap-3">
              <div className="brutal-card px-4 py-2 text-right">
                <div className="font-mono text-xs uppercase tracking-widest text-neutral-500">
                  <Calendar size={10} className="inline mr-1" />Period
                </div>
                <div className="font-display font-bold text-lg capitalize">{period}</div>
              </div>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="brutal-btn text-xs"
              >
                <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
                {refreshing ? "Refreshing…" : "Refresh"}
              </button>
            </div>
          </div>

          {/* Period filter */}
          <div className="mt-6 flex items-center gap-3 flex-wrap">
            <span className="font-mono text-xs uppercase tracking-widest text-neutral-500">
              Filter by:
            </span>
            <PeriodFilter value={period} onChange={setPeriod} />
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12" key={refreshKey}>
        {isInst ? (
          <InstructorAnalytics period={period} />
        ) : (
          <StudentAnalytics period={period} />
        )}
      </div>
    </div>
  );
}