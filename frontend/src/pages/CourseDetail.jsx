import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { toast, Toaster } from "sonner";
import {
  CheckCircle2, Circle, Play, Sparkles, Send,
  Clock, Users, BarChart2, ChevronRight, Lock
} from "lucide-react";

/* ── Skeleton ── */
function DetailSkeleton() {
  return (
    <div className="bg-white min-h-screen">
      <div className="border-b-2 border-black bg-grid">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid md:grid-cols-12 gap-8">
          <div className="md:col-span-7 space-y-4">
            <div className="skeleton h-5 w-32" />
            <div className="skeleton h-10 w-3/4" />
            <div className="skeleton h-4 w-full" />
            <div className="skeleton h-4 w-2/3" />
            <div className="skeleton h-4 w-1/2" />
            <div className="skeleton h-10 w-36 mt-4" />
          </div>
          <div className="md:col-span-5">
            <div className="skeleton h-48 w-full" />
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid md:grid-cols-12 gap-8">
        <div className="md:col-span-4 space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-16 w-full" />)}
        </div>
        <div className="md:col-span-8">
          <div className="skeleton h-64 w-full" />
        </div>
      </div>
    </div>
  );
}

export default function CourseDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();

  const [course, setCourse] = useState(null);
  const [mentor, setMentor] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [question, setQuestion] = useState("");
  const [reply, setReply] = useState("");
  const [asking, setAsking] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [completing, setCompleting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/courses/${id}`);
      setCourse(data);
      setActiveLesson(data.lessons?.[0] || null);

      const m = await api.get("/mentors");
      const found = m.data.find((x) => x.mentor_id === data.mentor_id) || m.data[0];
      setMentor(found);

      if (user) {
        try {
          const enrs = await api.get("/my/enrollments");
          const e = enrs.data.find((x) => x.course.course_id === id);
          if (e) setEnrollment(e.enrollment);
        } catch (err) {
          console.error(err);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load course");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id, user]);

  const enroll = async () => {
    if (!user) { nav("/login"); return; }
    setEnrolling(true);
    try {
      const { data } = await api.post(`/enroll/${id}`);
      setEnrollment(data);
      toast.success("Enrolled! Let's go 🚀");
    } catch {
      toast.error("Enrollment failed");
    } finally {
      setEnrolling(false);
    }
  };

  const complete = async () => {
    if (!enrollment || !activeLesson) return;
    setCompleting(true);
    try {
      const { data } = await api.post(`/enroll/${id}/lesson/${activeLesson.lesson_id}/complete`);
      setEnrollment({ ...enrollment, progress: data.progress, completed_lessons: data.completed_lessons });
      toast.success("Lesson complete! 🏆");

      // Auto-advance to next lesson
      const idx = course.lessons.findIndex((l) => l.lesson_id === activeLesson.lesson_id);
      if (idx < course.lessons.length - 1) {
        setActiveLesson(course.lessons[idx + 1]);
        setReply("");
      }
    } catch {
      toast.error("Failed to mark complete");
    } finally {
      setCompleting(false);
    }
  };

  const askMentor = async () => {
    if (!question.trim() || !mentor) return;
    setAsking(true);
    setReply("");
    try {
      const { data } = await api.post("/mentor/ask", {
        mentor_id: mentor.mentor_id,
        course_id: id,
        lesson_id: activeLesson?.lesson_id || "",
        question,
      });
      setReply(data.reply);
    } catch {
      toast.error("Mentor unavailable");
    } finally {
      setAsking(false);
    }
  };

  if (loading) return <DetailSkeleton />;
  if (!course) return (
    <div className="empty-state min-h-[60vh]">
      <div className="empty-state__icon"><BarChart2 size={22} /></div>
      <p className="empty-state__title">Course not found.</p>
      <button onClick={() => nav("/courses")} className="brutal-btn brutal-btn--red brutal-btn--sm">
        Back to courses
      </button>
    </div>
  );

  const completedSet = new Set(enrollment?.completed_lessons || []);
  const progress = enrollment ? Math.round((enrollment.progress || 0) * 100) : 0;
  const totalMins = course.lessons.reduce((s, l) => s + (l.duration_min || 0), 0);

  return (
    <div className="bg-white min-h-screen">
      <Toaster richColors position="top-center" />

      {/* ── Hero ── */}
      <div className="border-b-2 border-black bg-grid">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid md:grid-cols-12 gap-8 animate-fadeInUp">

          {/* Left */}
          <div className="md:col-span-7">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="section-tag">{course.category}</span>
              <span className="badge badge--surface">{course.level}</span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight mt-4">
              {course.title}
            </h1>
            <p className="mt-4 text-neutral-600 text-lg leading-relaxed">{course.description}</p>

            {/* Meta row */}
            <div className="mt-5 flex flex-wrap gap-4 font-mono text-xs uppercase tracking-widest text-neutral-500">
              <span className="flex items-center gap-1">
                <Users size={13} /> {course.enrolled_count} enrolled
              </span>
              <span className="flex items-center gap-1">
                <BarChart2 size={13} /> {course.lessons.length} lessons
              </span>
              <span className="flex items-center gap-1">
                <Clock size={13} /> {totalMins} min total
              </span>
            </div>

            <p className="mt-2 font-mono text-xs uppercase tracking-widest text-neutral-400">
              By {course.instructor_name}
            </p>

            {/* Enroll / enrolled */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              {enrollment ? (
                <div className="brutal-btn brutal-btn--green" data-testid="course-enrolled-badge">
                  <CheckCircle2 size={15} /> Enrolled
                </div>
              ) : (
                <button
                  onClick={enroll}
                  disabled={enrolling}
                  className="brutal-btn brutal-btn--red"
                  data-testid="course-enroll-btn"
                >
                  {enrolling ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Enrolling…
                    </span>
                  ) : (
                    <><Play size={15} /> Enroll free</>
                  )}
                </button>
              )}
            </div>

            {/* Progress bar */}
            {enrollment && (
              <div className="mt-6 animate-fadeIn">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs uppercase tracking-widest text-neutral-500">Progress</span>
                  <span className="font-mono text-xs font-bold">{progress}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-bar__fill" style={{ width: `${progress}%` }} />
                </div>
                <p className="font-mono text-xs text-neutral-400 mt-1 uppercase tracking-widest">
                  {completedSet.size} / {course.lessons.length} lessons done
                </p>
              </div>
            )}
          </div>

          {/* Mentor card */}
          {mentor && (
            <div className="md:col-span-5 animate-fadeIn">
              <div className="brutal-card p-5" style={{ boxShadow: `6px 6px 0px 0px ${mentor.accent}` }}>
                <p className="font-mono text-xs uppercase tracking-widest text-neutral-400 mb-3">Your hero</p>
                <div className="flex gap-4">
                  <div className="w-20 h-20 border-2 border-black overflow-hidden flex-shrink-0">
                    <img src={mentor.avatar_url} alt={mentor.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="font-mono text-xs uppercase tracking-widest text-neutral-500">{mentor.persona}</div>
                    <div className="font-display text-2xl font-bold leading-tight">{mentor.name}</div>
                    <div className="text-sm text-neutral-600 mt-1 leading-snug">{mentor.tagline}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid md:grid-cols-12 gap-8">

        {/* Lesson list */}
        <aside className="md:col-span-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-2xl font-bold">Lessons</h3>
            {enrollment && (
              <span className="badge badge--green">{completedSet.size}/{course.lessons.length}</span>
            )}
          </div>

          <div className="space-y-2 stagger-children">
            {course.lessons.map((l, i) => {
              const done = completedSet.has(l.lesson_id);
              const active = activeLesson?.lesson_id === l.lesson_id;
              const locked = !enrollment && i > 0;

              return (
                <button
                  key={l.lesson_id}
                  onClick={() => { if (!locked) { setActiveLesson(l); setReply(""); } }}
                  data-testid={`lesson-item-${i}`}
                  disabled={locked}
                  className={`w-full text-left p-3 border-2 border-black flex items-center gap-3 transition-all duration-150
                    ${active ? "bg-[#FFE785] shadow-brutal-sm" : "bg-white"}
                    ${locked ? "opacity-50 cursor-not-allowed" : "hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0_#0A0A0A]"}
                  `}
                >
                  <div className="shrink-0">
                    {locked
                      ? <Lock size={16} className="text-neutral-400" />
                      : done
                        ? <CheckCircle2 size={18} className="text-[#00B86B]" />
                        : <Circle size={18} className="text-neutral-300" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-xs uppercase tracking-widest text-neutral-500">
                      Lesson {i + 1} · {l.duration_min} min
                    </div>
                    <div className={`font-bold text-sm truncate ${active ? "" : "text-neutral-800"}`}>
                      {l.title}
                    </div>
                  </div>
                  {active && <ChevronRight size={14} className="shrink-0 text-neutral-500" />}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Lesson content + mentor */}
        <section className="md:col-span-8 space-y-6">

          {/* Lesson content */}
          {activeLesson && (
            <div className="brutal-card p-6 animate-fadeIn">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <span className="section-tag">Now learning</span>
                <span className="font-mono text-xs text-neutral-400 uppercase tracking-widest flex items-center gap-1">
                  <Clock size={12} /> {activeLesson.duration_min} min
                </span>
              </div>

              <h2 className="font-display text-3xl font-extrabold tracking-tight mt-3">
                {activeLesson.title}
              </h2>

              <div className="brutal-divider" />

              <p className="text-neutral-800 leading-relaxed whitespace-pre-line text-[1.05rem]">
                {activeLesson.content}
              </p>

              {/* Complete button */}
              {enrollment && (
                <div className="mt-6 flex items-center gap-3 flex-wrap">
                  <button
                    onClick={complete}
                    disabled={completedSet.has(activeLesson.lesson_id) || completing}
                    className={`brutal-btn ${completedSet.has(activeLesson.lesson_id) ? "brutal-btn--green" : "brutal-btn--primary"}`}
                    data-testid="complete-lesson-btn"
                  >
                    {completing ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Saving…
                      </span>
                    ) : completedSet.has(activeLesson.lesson_id) ? (
                      <><CheckCircle2 size={15} /> Completed</>
                    ) : (
                      "Mark complete"
                    )}
                  </button>

                  {completedSet.has(activeLesson.lesson_id) && (
                    <span className="font-mono text-xs uppercase tracking-widest text-[#00B86B]">
                      ✓ Done — keep going!
                    </span>
                  )}
                </div>
              )}

              {!enrollment && (
                <div className="mt-5 p-4 border-2 border-dashed border-neutral-300 bg-[#F4F4F4] flex items-center justify-between gap-3 flex-wrap">
                  <p className="font-mono text-xs uppercase tracking-widest text-neutral-500">
                    Enroll to track your progress
                  </p>
                  <button onClick={enroll} className="brutal-btn brutal-btn--red brutal-btn--sm">
                    <Play size={13} /> Enroll free
                  </button>
                </div>
              )}
            </div>
          )}

          {/* AI Mentor chat */}
          {mentor && (
            <div
              className="brutal-card p-6 animate-fadeIn"
              style={{ boxShadow: `6px 6px 0px 0px ${mentor.accent}` }}
            >
              {/* Header */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 border-2 border-black overflow-hidden shrink-0">
                  <img src={mentor.avatar_url} alt={mentor.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="font-mono text-xs uppercase tracking-widest text-neutral-500">Ask your hero</div>
                  <div className="font-display text-xl font-bold flex items-center gap-2">
                    {mentor.name}
                    <span className="w-2 h-2 rounded-full bg-[#00B86B] inline-block" title="Online" />
                  </div>
                </div>
                <Sparkles className="ml-auto text-[#FF2E00]" size={18} />
              </div>

              <div className="brutal-divider" />

              {/* Input */}
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  className="brutal-input flex-1"
                  placeholder={`Ask ${mentor.name} anything about this lesson…`}
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !asking && user && askMentor()}
                  data-testid="mentor-question-input"
                  disabled={!user}
                />
                <button
                  onClick={askMentor}
                  disabled={asking || !user || !question.trim()}
                  className="brutal-btn brutal-btn--red"
                  data-testid="mentor-ask-btn"
                >
                  {asking ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Thinking…
                    </span>
                  ) : (
                    <><Send size={14} /> Ask</>
                  )}
                </button>
              </div>

              {!user && (
                <div className="mt-3 p-3 border-2 border-dashed border-neutral-300 bg-[#F4F4F4] flex items-center justify-between gap-3 flex-wrap">
                  <p className="font-mono text-xs uppercase tracking-widest text-neutral-500">
                    Log in to chat with your hero
                  </p>
                  <button onClick={() => nav("/login")} className="brutal-btn brutal-btn--sm brutal-btn--primary">
                    Log in
                  </button>
                </div>
              )}

              {/* Reply */}
              {reply && (
                <div
                  className="mt-5 p-4 border-2 border-black bg-[#FFE785] animate-fadeIn"
                  data-testid="mentor-reply"
                >
                  <div className="font-mono text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Sparkles size={12} /> {mentor.name} says
                  </div>
                  <p className="whitespace-pre-line leading-relaxed text-[1.02rem]">{reply}</p>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}