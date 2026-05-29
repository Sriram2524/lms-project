import { useEffect, useState, useCallback } from "react";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { toast, Toaster } from "sonner";
import { Heart, MessageCircle, Plus, X, Sparkles, ImageIcon, Send, Flame } from "lucide-react";

const BANNER = "https://static.prod-images.emergentagent.com/jobs/1bb0b3f7-2fe1-41c1-a7d6-df7fb9557549/images/0f8ad5d802a549fd2011fe4cd609c8bf06f99969e4177a7d3d643d70baf50398.png";

/* ── Skeleton ── */
function PostSkeleton() {
  return (
    <div className="explore-card p-5 space-y-3 animate-pulse">
      <div className="flex justify-between">
        <div className="skeleton h-5 w-16" />
        <div className="skeleton h-4 w-24" />
      </div>
      <div className="skeleton h-7 w-2/3" />
      <div className="skeleton h-4 w-full" />
      <div className="skeleton h-4 w-3/4" />
      <div className="flex gap-2 mt-2">
        <div className="skeleton h-8 w-16" />
        <div className="skeleton h-8 w-16" />
      </div>
    </div>
  );
}

/* ── Post Card ── */
function PostCard({ post, onLike, user, reload, tilt }) {
  const [text, setText] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const liked = user && Array.isArray(post.likes) && post.likes.includes(user.user_id);

  const comment = async () => {
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      await api.post(`/explore/${post.post_id}/comment`, { text });
      setText("");
      reload();
    } catch {
      toast.error("Failed to comment");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="explore-card p-5 flex flex-col gap-3 animate-fadeIn"
      style={{ transform: `rotate(${tilt}deg)` }}
      data-testid={`post-${post.post_id}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="section-tag">{post.kind}</span>
        <span className="font-mono text-xs uppercase tracking-widest text-neutral-500">
          @{post.author_name}
        </span>
      </div>

      {/* Content */}
      {post.kind === "slang" ? (
        <>
          <div className="font-display text-3xl font-extrabold break-words leading-tight">
            {post.title}
          </div>
          <p className="font-mono text-sm leading-relaxed text-neutral-700">{post.body}</p>
        </>
      ) : (
        <>
          <div className="font-display text-2xl font-bold leading-tight">{post.title}</div>
          {post.image_data_url && (
            <div className="border-2 border-black overflow-hidden">
              <img src={post.image_data_url} alt={post.title} className="w-full object-cover" />
            </div>
          )}
          {post.body && <p className="text-sm text-neutral-700">{post.body}</p>}
        </>
      )}

      {/* Tags */}
      {post.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {post.tags.map((t) => (
            <span
              key={t}
              className="font-mono text-xs uppercase tracking-widest px-2 py-0.5 border-2 border-black bg-[#FFB7E1]"
            >
              #{t}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 mt-auto pt-1">
        <button
          onClick={onLike}
          data-testid={`like-${post.post_id}`}
          className={`brutal-btn brutal-btn--sm gap-1.5 transition-all ${liked ? "brutal-btn--red" : ""}`}
        >
          <Heart size={13} className={liked ? "fill-white" : ""} />
          {post.likes?.length || 0}
        </button>
        <button
          onClick={() => setShowComments((v) => !v)}
          className={`brutal-btn brutal-btn--sm gap-1.5 ${showComments ? "brutal-btn--primary" : ""}`}
          data-testid={`toggle-comments-${post.post_id}`}
        >
          <MessageCircle size={13} />
          {post.comments?.length || 0}
        </button>
      </div>

      {/* Comments panel */}
      {showComments && (
        <div className="border-t-2 border-black pt-3 mt-1 animate-slideInDown space-y-3">
          {post.comments?.length === 0 && (
            <p className="font-mono text-xs uppercase tracking-widest text-neutral-400">
              No comments yet.
            </p>
          )}
          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
            {post.comments?.map((c) => (
              <div key={c.comment_id} className="text-sm border-l-2 border-black pl-2">
                <span className="font-bold">{c.author_name}</span>
                <span className="text-neutral-600">: {c.text}</span>
              </div>
            ))}
          </div>
          {user ? (
            <div className="flex gap-2">
              <input
                className="brutal-input text-sm py-1.5"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && comment()}
                placeholder="Add a comment…"
                data-testid={`comment-input-${post.post_id}`}
              />
              <button
                onClick={comment}
                disabled={submitting || !text.trim()}
                className="brutal-btn brutal-btn--sm brutal-btn--primary"
              >
                {submitting
                  ? <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <Send size={13} />
                }
              </button>
            </div>
          ) : (
            <p className="font-mono text-xs text-neutral-400 uppercase tracking-widest">
              Log in to comment.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Post Form Modal ── */
function PostForm({ onClose, onCreated }) {
  const [kind, setKind] = useState("slang");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState({});

  const onFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) { toast.error("Only image files allowed"); return; }
    if (f.size > 2 * 1024 * 1024) { toast.error("Image too large (max 2MB)"); return; }
    const r = new FileReader();
    r.onload = () => setImageDataUrl(r.result);
    r.readAsDataURL(f);
  };

  const validate = () => {
    const e = {};
    if (!title.trim()) e.title = "Title is required.";
    if (kind === "slang" && !body.trim()) e.body = "Definition is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setBusy(true);
    try {
      await api.post("/explore", {
        kind, title, body,
        image_data_url: imageDataUrl,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      });
      toast.success("Posted! 🔥");
      onCreated();
    } catch {
      toast.error("Failed to post");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      data-testid="post-form-modal"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-box animate-scaleIn w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-2 border-black">
          <div className="font-display text-2xl font-extrabold flex items-center gap-2">
            <Sparkles size={18} className="text-[#FF2E00]" /> New post
          </div>
          <button onClick={onClose} className="brutal-btn brutal-btn--sm">
            <X size={15} />
          </button>
        </div>

        <form onSubmit={submit} className="p-5 space-y-4">
          {/* Kind toggle */}
          <div className="grid grid-cols-2 gap-3">
            {["slang", "meme"].map((k) => (
              <button
                type="button"
                key={k}
                onClick={() => setKind(k)}
                data-testid={`post-kind-${k}`}
                className={`brutal-btn justify-center ${kind === k ? "brutal-btn--primary" : ""}`}
              >
                {k === "slang" ? "💬 Slang" : "🖼️ Meme"}
              </button>
            ))}
          </div>

          {/* Title */}
          <div>
            <label className="font-mono text-xs uppercase tracking-widest block mb-1">Title</label>
            <input
              required
              className={`brutal-input ${errors.title ? "brutal-input--error" : ""}`}
              value={title}
              onChange={(e) => { setTitle(e.target.value); setErrors((p) => ({ ...p, title: "" })); }}
              placeholder={kind === "slang" ? "e.g., Bussin'" : "Meme caption"}
              data-testid="post-title"
            />
            {errors.title && <p className="mt-1 font-mono text-xs text-[#FF2E00] uppercase tracking-wide">{errors.title}</p>}
          </div>

          {/* Body */}
          <div>
            <label className="font-mono text-xs uppercase tracking-widest block mb-1">
              {kind === "slang" ? "Definition" : "Description (optional)"}
            </label>
            <textarea
              rows={3}
              className={`brutal-input resize-none ${errors.body ? "brutal-input--error" : ""}`}
              value={body}
              onChange={(e) => { setBody(e.target.value); setErrors((p) => ({ ...p, body: "" })); }}
              placeholder={kind === "slang" ? "What does it mean?" : "Say something about this meme…"}
              data-testid="post-body"
            />
            {errors.body && <p className="mt-1 font-mono text-xs text-[#FF2E00] uppercase tracking-wide">{errors.body}</p>}
          </div>

          {/* Image (meme only) */}
          {kind === "meme" && (
            <div>
              <label className="font-mono text-xs uppercase tracking-widest flex items-center gap-2 mb-1">
                <ImageIcon size={13} /> Image (max 2MB)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={onFile}
                className="block text-sm"
                data-testid="post-image"
              />
              {imageDataUrl && (
                <div className="mt-3 relative">
                  <img src={imageDataUrl} alt="preview" className="max-h-48 border-2 border-black" />
                  <button
                    type="button"
                    onClick={() => setImageDataUrl("")}
                    className="absolute top-1 right-1 brutal-btn brutal-btn--sm p-1"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Tags */}
          <div>
            <label className="font-mono text-xs uppercase tracking-widest block mb-1">
              Tags <span className="text-neutral-400 normal-case">(comma-separated)</span>
            </label>
            <input
              className="brutal-input"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="funny, college, relatable"
              data-testid="post-tags"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="brutal-btn">Cancel</button>
            <button
              type="submit"
              disabled={busy}
              className="brutal-btn brutal-btn--red"
              data-testid="post-submit"
            >
              {busy ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Posting…
                </span>
              ) : (
                <><Flame size={15} /> Post it</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Main ── */
export default function Explore() {
  const { user } = useAuth();
  const [tab, setTab] = useState("all");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    const params = {};
    if (tab !== "all") params.kind = tab;
    api.get("/explore", { params })
      .then((r) => setPosts(Array.isArray(r.data) ? r.data : []))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, [tab]);

  useEffect(() => { load(); }, [load]);

  const toggleLike = async (post_id) => {
    if (!user) { toast.error("Log in to like"); return; }
    try {
      const { data } = await api.post(`/explore/${post_id}/like`);
      setPosts((ps) => ps.map((p) => p.post_id === post_id ? { ...p, likes: data.likes } : p));
    } catch {
      toast.error("Failed to like");
    }
  };

  return (
    <div className="explore-bg min-h-screen">
      <Toaster richColors position="top-center" />

      {/* Marquee */}
      <div className="border-b-2 border-black bg-black text-white">
        <div className="marquee py-4">
          <div className="marquee__track text-4xl font-extrabold uppercase">
            VIBE • SLAY • DELULU • RIZZ • NO CAP • MID • BET • VIBE • SLAY • DELULU • RIZZ • NO CAP • MID • BET •&nbsp;
            VIBE • SLAY • DELULU • RIZZ • NO CAP • MID • BET • VIBE • SLAY • DELULU • RIZZ • NO CAP • MID • BET •&nbsp;
          </div>
        </div>
      </div>

      {/* Hero */}
      <div className="relative border-b-2 border-black overflow-hidden">
        <div
          className="absolute inset-0 opacity-25 pointer-events-none"
          style={{ backgroundImage: `url(${BANNER})`, backgroundSize: "cover", backgroundPosition: "center" }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-14 animate-fadeInUp">
          <span className="section-tag">The 10%</span>
          <h1 className="font-display text-6xl sm:text-7xl font-extrabold tracking-tighter mt-4 leading-none">
            Explore<span className="text-[#FF2E00]">.</span>
          </h1>
          <p className="mt-4 text-lg max-w-xl text-neutral-800">
            A live wall of Gen Z slangs and memes from the community. Post your own. Get likes. Touch grass later.
          </p>
        </div>
      </div>

      {/* Feed */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex gap-2">
            {[
              { k: "all", l: "All" },
              { k: "slang", l: "💬 Slangs" },
              { k: "meme", l: "🖼️ Memes" },
            ].map((t) => (
              <button
                key={t.k}
                onClick={() => setTab(t.k)}
                data-testid={`explore-tab-${t.k}`}
                className={`brutal-btn brutal-btn--sm ${tab === t.k ? "brutal-btn--primary" : ""}`}
              >
                {t.l}
              </button>
            ))}
          </div>

          <button
            onClick={() => user ? setShowForm(true) : toast.error("Log in to post")}
            className="brutal-btn brutal-btn--red"
            data-testid="explore-create-btn"
          >
            <Plus size={15} /> Post
          </button>
        </div>

        {/* Post count */}
        {!loading && posts.length > 0 && (
          <p className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-4 animate-fadeIn">
            {posts.length} post{posts.length !== 1 ? "s" : ""}
          </p>
        )}

        {/* Skeletons */}
        {loading && (
          <div className="grid sm:grid-cols-2 gap-5">
            {[...Array(4)].map((_, i) => <PostSkeleton key={i} />)}
          </div>
        )}

        {/* Empty */}
        {!loading && posts.length === 0 && (
          <div className="empty-state animate-fadeIn border-black">
            <div className="empty-state__icon"><Sparkles size={22} /></div>
            <p className="empty-state__title">No posts yet. Be the first to vibe.</p>
            <button
              onClick={() => user ? setShowForm(true) : toast.error("Log in to post")}
              className="brutal-btn brutal-btn--red brutal-btn--sm mt-2"
            >
              <Plus size={13} /> Post something
            </button>
          </div>
        )}

        {/* Grid */}
        {!loading && posts.length > 0 && (
          <div className="grid sm:grid-cols-2 gap-5 stagger-children">
            {posts.map((p, i) => (
              <PostCard
                key={p.post_id}
                post={p}
                onLike={() => toggleLike(p.post_id)}
                user={user}
                reload={load}
                tilt={i % 2 ? 0.8 : -0.8}
              />
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <PostForm
          onClose={() => setShowForm(false)}
          onCreated={() => { setShowForm(false); load(); }}
        />
      )}
    </div>
  );
}