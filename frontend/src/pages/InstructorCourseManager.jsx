import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { toast, Toaster } from "sonner";
import { Plus, Trash2, Edit, X } from "lucide-react";

const CATS = ["Programming", "Data Science", "Soft Skills", "Design"];
const LEVELS = ["Beginner", "Intermediate", "Advanced"];

export default function InstructorCourseManager() {
  const [courses, setCourses] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const load = () => api.get("/instructor/courses").then((r) => setCourses(r.data));
  useEffect(() => {
    load();
    api.get("/mentors").then((r) => setMentors(r.data));
  }, []);

  const onSave = async (payload, id) => {
  try {
    if (id) {
      await api.put(`/courses/${id}`, payload);
    } else {
      await api.post("/courses", payload);
    }

    setEditing(null);
    setShowForm(false);

    toast.success(id ? "Course updated" : "Course created");

    load();
  } catch (err) {
    console.error(err);
    toast.error(
      err?.response?.data?.detail || "Failed to save course"
    );
  }
};

  const onDelete = async (id) => {
  if (!window.confirm("Delete this course?")) return;

  try {
    await api.delete(`/courses/${id}`);
    toast.success("Course deleted");
    load();
  } catch (err) {
    toast.error("Delete failed");
  }
};

  return (
    <div>
      <Toaster richColors position="top-center" />
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-display text-3xl font-extrabold tracking-tight">My courses</h2>
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="brutal-btn brutal-btn--red" data-testid="create-course-btn">
          <Plus size={16} /> New course
        </button>
      </div>

      {courses.length === 0 ? (
        <div className="brutal-card p-8 text-center font-mono uppercase text-sm tracking-widest text-neutral-500">
          No courses yet. Create your first.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          {courses.map((c) => (
            <div key={c.course_id} className="brutal-card p-5" data-testid={`inst-course-${c.course_id}`}>
              <div className="flex justify-between gap-2">
                <div>
                  <span className="section-tag">{c.category} • {c.level}</span>
                  <h3 className="font-display text-xl font-bold mt-2">{c.title}</h3>
                  <div className="font-mono text-xs uppercase tracking-widest text-neutral-500 mt-1">{c.lessons.length} lessons • {c.enrolled_count} enrolled</div>
                </div>
                <div className="flex flex-col gap-2">
                  <button onClick={() => { setEditing(c); setShowForm(true); }} className="brutal-btn brutal-btn-sm" data-testid={`edit-course-${c.course_id}`}>
                    <Edit size={14} />
                  </button>
                  <button onClick={() => onDelete(c.course_id)} className="brutal-btn brutal-btn-sm" data-testid={`delete-course-${c.course_id}`}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <CourseForm
          mentors={mentors}
          initial={editing}
          onClose={() => { setEditing(null); setShowForm(false); }}
          onSave={onSave}
        />
      )}
    </div>
  );
}

function CourseForm({ mentors, initial, onClose, onSave }) {
  const [form, setForm] = useState(initial ? {
    title: initial.title, description: initial.description, category: initial.category,
    level: initial.level, cover_url: initial.cover_url, mentor_id: initial.mentor_id,
    lessons: initial.lessons.map(({ title, content, duration_min }) => ({ title, content, duration_min })),
  } : {
    title: "", description: "", category: "Programming", level: "Beginner",
    cover_url: "", mentor_id: mentors[0]?.mentor_id || "",
    lessons: [{ title: "", content: "", duration_min: 10 }],
  });

  const set = (k, v) => setForm({ ...form, [k]: v });
  const setLesson = (i, k, v) => {
    const ls = [...form.lessons];
    ls[i] = { ...ls[i], [k]: v };
    set("lessons", ls);
  };
  const addLesson = () => set("lessons", [...form.lessons, { title: "", content: "", duration_min: 10 }]);
  const rmLesson = (i) => {
  if (form.lessons.length === 1) {
    toast.error("At least one lesson required");
    return;
  }

  set(
    "lessons",
    form.lessons.filter((_, x) => x !== i)
  );
};

  const submit = (e) => {
    e.preventDefault();
    onSave({ ...form, lessons: form.lessons.map(l => ({ ...l, duration_min: Number(l.duration_min) || 10 })) }, initial?.course_id);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center p-4 overflow-y-auto" data-testid="course-form-modal">
      <div className="bg-white border-2 border-black w-full max-w-3xl my-8 shadow-brutal">
        <div className="flex items-center justify-between p-4 border-b-2 border-black">
          <h3 className="font-display text-2xl font-extrabold">{initial ? "Edit course" : "New course"}</h3>
          <button onClick={onClose} className="brutal-btn" data-testid="course-form-close"><X size={16} /></button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="font-mono text-xs uppercase tracking-widest">Title</label>
              <input required className="brutal-input mt-1" value={form.title} onChange={(e) => set("title", e.target.value)} data-testid="form-course-title" />
            </div>
            <div>
              <label className="font-mono text-xs uppercase tracking-widest">Cover image URL</label>
              <input className="brutal-input mt-1" value={form.cover_url} onChange={(e) => set("cover_url", e.target.value)} data-testid="form-course-cover" />
            </div>
          </div>
          <div>
            <label className="font-mono text-xs uppercase tracking-widest">Description</label>
            <textarea required rows={3} className="brutal-input mt-1" value={form.description} onChange={(e) => set("description", e.target.value)} data-testid="form-course-desc" />
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="font-mono text-xs uppercase tracking-widest">Category</label>
              <select className="brutal-input mt-1" value={form.category} onChange={(e) => set("category", e.target.value)} data-testid="form-course-category">
                {CATS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="font-mono text-xs uppercase tracking-widest">Level</label>
              <select className="brutal-input mt-1" value={form.level} onChange={(e) => set("level", e.target.value)} data-testid="form-course-level">
                {LEVELS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="font-mono text-xs uppercase tracking-widest">Mentor</label>
              <select className="brutal-input mt-1" value={form.mentor_id} onChange={(e) => set("mentor_id", e.target.value)} data-testid="form-course-mentor">
                {mentors.map((m) => <option key={m.mentor_id} value={m.mentor_id}>{m.name}</option>)}
              </select>
            </div>
          </div>

          <div className="border-t-2 border-black pt-4">
            <div className="flex items-center justify-between mb-3">
              <div className="font-display text-xl font-bold">Lessons</div>
              <button type="button" onClick={addLesson} className="brutal-btn" data-testid="form-add-lesson"><Plus size={14} /> Add lesson</button>
            </div>
            <div className="space-y-3">
              {form.lessons.map((l, i) => (
                <div key={i} className="p-3 border-2 border-black">
                  <div className="flex justify-between gap-2 mb-2">
                    <input required placeholder={`Lesson ${i + 1} title`} className="brutal-input" value={l.title} onChange={(e) => setLesson(i, "title", e.target.value)} data-testid={`form-lesson-title-${i}`} />
                    <input type="number" min={1} className="brutal-input w-24" value={l.duration_min} onChange={(e) => setLesson(i, "duration_min", e.target.value)} data-testid={`form-lesson-duration-${i}`} />
                    <button type="button" onClick={() => rmLesson(i)} className="brutal-btn"><Trash2 size={14} /></button>
                  </div>
                  <textarea required rows={2} placeholder="Lesson content" className="brutal-input" value={l.content} onChange={(e) => setLesson(i, "content", e.target.value)} data-testid={`form-lesson-content-${i}`} />
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <button type="button" onClick={onClose} className="brutal-btn">Cancel</button>
            <button type="submit" className="brutal-btn brutal-btn--red" data-testid="form-save-course">Save course</button>
          </div>
        </form>
      </div>
    </div>
  );
}