import { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import { toast, Toaster } from "sonner";
import {
  Bell, BellOff, CheckCheck, Trash2, BookOpen,
  Trophy, Users, Star, Flame, RefreshCw, AlertCircle,
} from "lucide-react";

/* ── Notification type meta ── */
const TYPE_META = {
  enrollment:  { icon: <BookOpen size={15} />,   accent: "#0047FF", label: "Enrollment"  },
  completion:  { icon: <Trophy size={15} />,      accent: "#00B86B", label: "Completion"  },
  new_student: { icon: <Users size={15} />,       accent: "#FF2E00", label: "New student" },
  rating:      { icon: <Star size={15} />,        accent: "#FFE785", label: "Rating"      },
  streak:      { icon: <Flame size={15} />,       accent: "#FF2E00", label: "Streak"      },
  system:      { icon: <AlertCircle size={15} />, accent: "#0A0A0A", label: "System"      },
};

function getMeta(type) {
  return TYPE_META[type] || TYPE_META.system;
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

/* ── Skeleton ── */
function NotifSkeleton() {
  return (
    <div className="flex gap-4 p-4 border-b-2 border-black animate-pulse">
      <div className="skeleton w-10 h-10 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="skeleton h-3 w-3/4" />
        <div className="skeleton h-3 w-1/2" />
        <div className="skeleton h-3 w-1/4" />
      </div>
    </div>
  );
}

/* ── Single notification row ── */
function NotifItem({ notif, onRead, onDelete }) {
  const meta = getMeta(notif.type);
  const unread = !notif.read;

  return (
    <div
      className={`flex gap-4 p-4 border-b-2 border-black transition-colors group ${
        unread ? "bg-[#FFFBEA]" : "bg-white hover:bg-[#F4F4F4]"
      }`}
      data-testid={`notif-${notif.id}`}
    >
      <div
        className="w-10 h-10 border-2 border-black flex items-center justify-center shrink-0"
        style={{ background: meta.accent + "22" }}
      >
        {meta.icon}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span
              className="badge font-mono text-[10px]"
              style={{
                background: meta.accent,
                color: meta.accent === "#FFE785" ? "#0A0A0A" : "#fff",
                borderColor: meta.accent,
              }}
            >
              {meta.label}
            </span>
            {unread && (
              <span className="inline-block w-2 h-2 rounded-full bg-[#FF2E00] border border-white" />
            )}
          </div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 shrink-0">
            {timeAgo(notif.created_at)}
          </span>
        </div>

        <p className="mt-1 text-sm font-medium leading-snug">{notif.message}</p>

        <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {unread && (
            <button
              onClick={() => onRead(notif.id)}
              className="brutal-btn brutal-btn--sm brutal-btn--ghost gap-1 text-xs"
            >
              <CheckCheck size={12} /> Mark read
            </button>
          )}
          <button
            onClick={() => onDelete(notif.id)}
            className="brutal-btn brutal-btn--sm brutal-btn--ghost gap-1 text-xs text-[#FF2E00]"
          >
            <Trash2 size={12} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Empty state ── */
function EmptyState() {
  return (
    <div className="empty-state py-24">
      <div className="empty-state__icon">
        <BellOff size={22} />
      </div>
      <div className="empty-state__title">No notifications yet</div>
      <p className="text-sm text-neutral-500 max-w-xs text-center mt-2">
        Enroll in a course, complete a lesson, or interact with the platform to
        start receiving notifications.
      </p>
    </div>
  );
}

/* ── Filter tabs ── */
const FILTERS = ["all", "unread", "enrollment", "completion", "system"];

function FilterTabs({ value, onChange, unreadCount }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {FILTERS.map((f) => (
        <button
          key={f}
          onClick={() => onChange(f)}
          className={`brutal-btn brutal-btn--sm capitalize ${value === f ? "brutal-btn--primary" : ""}`}
        >
          {f}
          {f === "unread" && unreadCount > 0 && (
            <span className="ml-1 bg-[#FF2E00] text-white text-[10px] font-mono px-1.5 py-0.5 border border-black">
              {unreadCount}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

/* ═══════════════════════════════
   MAIN PAGE
═══════════════════════════════ */
export default function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const pollRef = useRef(null);

  const load = useCallback(async (silent = false) => {
    if (!user) return;
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const { data } = await api.get("/notifications");
      setNotifications(Array.isArray(data) ? data : []);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    load();
    pollRef.current = setInterval(() => load(true), 30_000);
    return () => clearInterval(pollRef.current);
  }, [load]);

  const markRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch {
      toast.error("Could not mark as read.");
    }
  };

  const markAllRead = async () => {
    try {
      await api.patch("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      toast.success("All notifications marked as read.");
    } catch {
      toast.error("Could not mark all as read.");
    }
  };

  const deleteOne = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch {
      toast.error("Could not delete notification.");
    }
  };

  const filtered = notifications.filter((n) => {
    if (filter === "all")    return true;
    if (filter === "unread") return !n.read;
    return n.type === filter;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="brutal-card px-8 py-6 flex items-center gap-3">
          <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
          <span className="font-mono uppercase tracking-widest text-sm">Loading…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <Toaster richColors position="top-center" />

      {/* ── Page header ── */}
      <div className="border-b-2 border-black bg-grid">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex items-start justify-between gap-4 flex-wrap">

            {/* Left */}
            <div>
              <span className="section-tag">
                <Bell size={11} /> Notifications
              </span>
              <h1 className="font-display text-5xl font-extrabold tracking-tight mt-4">
                Inbox<span className="text-[#FF2E00]">.</span>
              </h1>
              <p className="mt-2 text-neutral-600">
                Stay on top of your learning activity and platform updates.
              </p>
            </div>

            {/* Right */}
            <div className="flex flex-col items-end gap-3">
              {unreadCount > 0 && (
                <div
                  className="brutal-card px-4 py-2 text-right"
                  style={{ boxShadow: "6px 6px 0px 0px #FF2E00" }}
                >
                  <div className="font-mono text-xs uppercase tracking-widest text-neutral-500">Unread</div>
                  <div className="font-display font-bold text-3xl">{unreadCount}</div>
                </div>
              )}
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="brutal-btn brutal-btn--sm brutal-btn--green gap-1"
                  >
                    <CheckCheck size={13} /> Mark all read
                  </button>
                )}
                <button
                  onClick={() => load(true)}
                  disabled={refreshing}
                  className="brutal-btn brutal-btn--sm"
                >
                  <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
                  {refreshing ? "…" : "Refresh"}
                </button>
              </div>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="mt-6">
            <FilterTabs value={filter} onChange={setFilter} unreadCount={unreadCount} />
          </div>
        </div>
      </div>

      {/* ── Notifications list ── */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="brutal-card overflow-hidden">
          {loading ? (
            <>
              {[...Array(5)].map((_, i) => <NotifSkeleton key={i} />)}
            </>
          ) : filtered.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="animate-fadeInUp">
              {/* Count bar */}
              <div className="px-4 py-2 bg-[#F4F4F4] border-b-2 border-black flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-widest text-neutral-500">
                  {filtered.length} notification{filtered.length !== 1 ? "s" : ""}
                </span>
                {filter !== "all" && (
                  <button
                    onClick={() => setFilter("all")}
                    className="font-mono text-xs uppercase tracking-widest text-[#0047FF] hover:underline"
                  >
                    Clear filter
                  </button>
                )}
              </div>

              {filtered.map((n) => (
                <NotifItem
                  key={n.id}
                  notif={n}
                  onRead={markRead}
                  onDelete={deleteOne}
                />
              ))}
            </div>
          )}
        </div>

        <p className="mt-4 text-center font-mono text-xs uppercase tracking-widest text-neutral-400">
          Auto-refreshes every 30 seconds
        </p>
      </div>
    </div>
  );
}