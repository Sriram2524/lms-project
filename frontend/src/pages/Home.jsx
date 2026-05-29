import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { ArrowRight, Sparkles, Flame, BookOpen, Trophy } from "lucide-react";
import CourseCard from "../components/CourseCard";

const HERO_IMG = "https://static.prod-images.emergentagent.com/jobs/1bb0b3f7-2fe1-41c1-a7d6-df7fb9557549/images/50bcc641de200464c447da9763ec3ebc358e1498261c46002295c1bbf11efb30.png";

export default function Home() {
  const [courses, setCourses] = useState([]);
  const [mentors, setMentors] = useState([]);

 useEffect(() => {
  api.get("/courses")
    .then((r) => {
      console.log("Courses API:", r.data);

      const data = Array.isArray(r.data)
        ? r.data
        : r.data.courses || [];

      setCourses(data.slice(0, 4));
    })
    .catch((err) => {
      console.error(err);
      setCourses([]);
    });

  api.get("/mentors")
    .then((r) => {
      console.log("Mentors API:", r.data);

      const data = Array.isArray(r.data)
        ? r.data
        : r.data.mentors || [];

      setMentors(data);
    })
    .catch((err) => {
      console.error(err);
      setMentors([]);
    });
}, []);

  return (
    <div className="bg-white">
      {/* HERO */}
      <section className="border-b-2 border-black bg-grid relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-25 pointer-events-none"
          style={{ backgroundImage: `url(${HERO_IMG})`, backgroundSize: "cover", backgroundPosition: "center" }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24 grid md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-7">
            <span className="section-tag" data-testid="hero-tag">90 / 10 LEARNING SYSTEM</span>
            <h1 className="font-display text-5xl sm:text-7xl font-extrabold tracking-tighter leading-[0.95] mt-5">
              Learn from <span className="bg-[#FF2E00] text-white px-3 inline-block">AI Heroes.</span><br />
              Slay the rest with <span className="bg-[#FFE785] px-3 inline-block">memes.</span>
            </h1>
            <p className="mt-6 text-lg max-w-xl text-neutral-700">
              Pick a fictional mentor — cricket coach, statesman, scientist — and they'll explain any concept in their style.
              Then unwind in our GenZ slang & meme feed. Built for India's next-gen learners.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/courses" className="brutal-btn brutal-btn--red" data-testid="hero-cta-courses">
                Browse Courses <ArrowRight size={18} />
              </Link>
              <Link to="/register" className="brutal-btn" data-testid="hero-cta-signup">
                <Sparkles size={16} /> Join free
              </Link>
            </div>
            <div className="mt-10 flex gap-6 font-mono text-xs uppercase tracking-widest text-neutral-700">
              <div><div className="font-display text-3xl text-black">12k+</div>learners</div>
              <div><div className="font-display text-3xl text-black">{courses.length || 4}+</div>courses</div>
              <div><div className="font-display text-3xl text-black">3</div>AI heroes</div>
            </div>
          </div>
          <div className="md:col-span-5 grid grid-cols-2 gap-4">
            {Array.isArray(mentors) &&
  mentors.slice(0, 2).map((m) => (
            <div key={m.mentor_id} className="brutal-card p-4" data-testid={`hero-mentor-${m.mentor_id}`} style={{ boxShadow: `6px 6px 0px 0px ${m.accent}` }}>
                <div className="aspect-square overflow-hidden border-2 border-black bg-neutral-100">
                  <img src={m.avatar_url} alt={m.name} className="w-full h-full object-cover" />
                </div>
                <div className="mt-3">
                  <div className="font-mono text-xs uppercase tracking-widest text-neutral-500">{m.persona}</div>
                  <div className="font-display text-lg font-bold leading-tight">{m.name}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="border-b-2 border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <span className="section-tag">The System</span>
          <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tight mt-4 max-w-3xl">
            90% deep work. 10% chaos. The brain needs both.
          </h2>
          <div className="grid md:grid-cols-3 gap-6 mt-10">
            {[
              { icon: <BookOpen />, k: "01", t: "Pick a hero", d: "Choose an AI mentor whose voice clicks for you. Each explains in a unique style." },
              { icon: <Flame />, k: "02", t: "Learn 90%", d: "Real courses, real lessons, real progress tracking. Like Analytics Vidhya, but punchier." },
              { icon: <Trophy />, k: "03", t: "Vibe 10%", d: "Cool down in the Explore feed: GenZ slang dictionary + meme wall. Post your own. Get likes." },
            ].map((s) => (
              <div key={s.k} className="brutal-card p-6">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs uppercase tracking-widest">{s.k}</span>
                  <div className="w-10 h-10 border-2 border-black bg-[#FFE785] flex items-center justify-center">{s.icon}</div>
                </div>
                <div className="font-display text-2xl font-bold tracking-tight mt-4">{s.t}</div>
                <p className="text-neutral-700 mt-2">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED COURSES */}
      <section className="border-b-2 border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="section-tag">Featured</span>
              <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tight mt-4">Courses on the rise</h2>
            </div>
            <Link to="/courses" className="brutal-btn" data-testid="home-view-all-courses">View all <ArrowRight size={16} /></Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
            {Array.isArray(courses) &&
  courses.map((c) => (
    <CourseCard key={c.course_id} course={c} />
))}
          </div>
        </div>
      </section>

      {/* EXPLORE TEASER */}
      <section className="explore-bg border-b-2 border-black">
        <div className="marquee py-4 border-b-2 border-black bg-black text-[#FFE785]">
          <div className="marquee__track text-4xl font-extrabold uppercase">
            SLANGS • MEMES • VIBES • DELULU • RIZZ • NO CAP • SLAY • SLANGS • MEMES • VIBES • DELULU • RIZZ • NO CAP • SLAY •&nbsp;
            SLANGS • MEMES • VIBES • DELULU • RIZZ • NO CAP • SLAY • SLANGS • MEMES • VIBES • DELULU • RIZZ • NO CAP • SLAY •&nbsp;
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="section-tag">The 10%</span>
            <h2 className="font-display text-5xl font-extrabold tracking-tight mt-4 leading-none">
              Explore the<br />culture.
            </h2>
            <p className="mt-5 text-lg text-neutral-800 max-w-md">
              A GenZ slang dictionary that updates. A meme wall that doesn't sleep. Post your own. Like, comment. This is your reward for finishing that pandas lesson.
            </p>
            <Link to="/explore" className="brutal-btn brutal-btn--primary mt-6" data-testid="home-explore-cta">
              Enter the feed <ArrowRight size={18} />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {["Rizz", "Mid", "Delulu", "No cap"].map((s, i) => (
              <div key={s} className="explore-card p-5" style={{ transform: `rotate(${i % 2 ? 1.5 : -1.5}deg)` }}>
                <div className="font-mono text-xs uppercase tracking-widest text-neutral-500">slang</div>
                <div className="font-display text-3xl font-extrabold">{s}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}