import { useEffect, useState, useCallback } from "react";
import { api } from "../lib/api";
import CourseCard from "../components/CourseCard";
import { Search, X, BookOpen, SlidersHorizontal } from "lucide-react";

const CATS = ["All", "Programming", "Data Science", "Soft Skills", "Design"];
const LEVELS = ["All levels", "Beginner", "Intermediate", "Advanced"];

/* ── Skeleton card ── */
function CourseCardSkeleton() {
  return (
    <div className="brutal-card p-5 space-y-3 animate-pulse">
      <div className="skeleton h-40 w-full" />
      <div className="skeleton h-3 w-1/3" />
      <div className="skeleton h-5 w-3/4" />
      <div className="skeleton h-3 w-full" />
      <div className="skeleton h-3 w-2/3" />
      <div className="skeleton h-8 w-24 mt-2" />
    </div>
  );
}

/* ── Empty state ── */
function EmptyState({ q, cat, onReset }) {
  return (
    <div className="empty-state animate-fadeIn" data-testid="courses-empty">
      <div className="empty-state__icon">
        <BookOpen size={24} />
      </div>
      <p className="empty-state__title">
        {q || cat !== "All"
          ? `No courses match "${q || cat}"`
          : "No courses available yet."}
      </p>
      {(q || cat !== "All") && (
        <button onClick={onReset} className="brutal-btn brutal-btn--red brutal-btn--sm mt-2">
          <X size={13} /> Clear filters
        </button>
      )}
    </div>
  );
}

export default function Courses() {
  const [items, setItems] = useState([]);
  const [cat, setCat] = useState("All");
  const [level, setLevel] = useState("All levels");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [total, setTotal] = useState(0);

  const load = useCallback(() => {
    setLoading(true);
    const params = {};
    if (cat !== "All") params.category = cat;
    if (level !== "All levels") params.level = level;
    if (q.trim()) params.q = q.trim();

    api.get("/courses", { params })
      .then((r) => {
        const data = Array.isArray(r.data) ? r.data : r.data.courses || [];
        setItems(data);
        setTotal(data.length);
      })
      .catch((err) => {
        console.error(err);
        setItems([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  }, [cat, level, q]);

  useEffect(() => { load(); }, [load]);

  const handleReset = () => {
    setCat("All");
    setLevel("All levels");
    setQ("");
  };

  const hasFilters = cat !== "All" || level !== "All levels" || q.trim();

  return (
    <div className="bg-white min-h-screen">

      {/* ── Hero header ── */}
      <div className="border-b-2 border-black bg-grid">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 animate-fadeInUp">
          <span className="section-tag">All Courses</span>
          <h1 className="font-display text-5xl sm:text-6xl font-extrabold tracking-tight mt-4">
            The catalog<span className="text-[#FF2E00]">.</span>
          </h1>
          <p className="mt-3 text-lg text-neutral-600 max-w-2xl">
            From Python basics to public speaking. Pick a topic, pick a hero, start.
          </p>

          {/* Search bar */}
          <div className="mt-8 flex gap-2">
            <div className="flex-1 relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
                size={18}
              />
              <input
                className="brutal-input pl-10"
                placeholder="Search courses…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                data-testid="courses-search-input"
              />
              {q && (
                <button
                  onClick={() => setQ("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black transition-colors"
                >
                  <X size={15} />
                </button>
              )}
            </div>
            <button
              className="brutal-btn brutal-btn--primary"
              onClick={load}
              data-testid="courses-search-submit"
            >
              <Search size={15} />
              <span className="hidden sm:inline">Search</span>
            </button>
            <button
              className={`brutal-btn ${showFilters ? "brutal-btn--primary" : ""}`}
              onClick={() => setShowFilters((v) => !v)}
              aria-label="Toggle filters"
            >
              <SlidersHorizontal size={15} />
              <span className="hidden sm:inline">Filters</span>
              {hasFilters && (
                <span className="w-2 h-2 rounded-full bg-[#FF2E00] ml-1" />
              )}
            </button>
          </div>

          {/* Category filters */}
          <div className="mt-5 flex flex-wrap gap-2 stagger-children">
            {CATS.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                data-testid={`category-filter-${c.replace(/\s+/g, "-").toLowerCase()}`}
                className={`brutal-btn brutal-btn--sm ${cat === c ? "brutal-btn--red" : ""}`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Level filters (expandable) */}
          {showFilters && (
            <div className="mt-4 p-4 border-2 border-black bg-white animate-slideInDown">
              <p className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-3">Level</p>
              <div className="flex flex-wrap gap-2">
                {LEVELS.map((l) => (
                  <button
                    key={l}
                    onClick={() => setLevel(l)}
                    className={`brutal-btn brutal-btn--sm ${level === l ? "brutal-btn--primary" : ""}`}
                  >
                    {l}
                  </button>
                ))}
              </div>

              {hasFilters && (
                <button onClick={handleReset} className="brutal-btn brutal-btn--sm mt-4 text-[#FF2E00] border-[#FF2E00]">
                  <X size={12} /> Clear all filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Results ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">

        {/* Result count */}
        {!loading && (
          <div className="flex items-center justify-between mb-6 animate-fadeIn">
            <p className="font-mono text-xs uppercase tracking-widest text-neutral-500">
              {total} course{total !== 1 ? "s" : ""} found
              {hasFilters && (
                <button
                  onClick={handleReset}
                  className="ml-3 text-[#FF2E00] hover:underline"
                >
                  clear filters
                </button>
              )}
            </p>
          </div>
        )}

        {/* Skeletons */}
        {loading && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <CourseCardSkeleton key={i} />)}
          </div>
        )}

        {/* Empty */}
        {!loading && items.length === 0 && (
          <EmptyState q={q} cat={cat} onReset={handleReset} />
        )}

        {/* Grid */}
        {!loading && items.length > 0 && (
          <div
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children"
            data-testid="courses-grid"
          >
            {items.map((c) => (
              <CourseCard key={c.course_id} course={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}