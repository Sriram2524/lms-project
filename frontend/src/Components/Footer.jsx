export default function Footer() {
  return (
    <footer className="border-t-2 border-black bg-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <div className="font-display text-3xl font-extrabold">Brainrot Academy<span className="text-[#FF2E00]">.</span></div>
          <p className="mt-3 text-sm text-neutral-600 max-w-xs">90% learn. 10% slay. Built for the next generation of Indian learners.</p>
        </div>
        <div>
          <div className="font-mono text-xs uppercase tracking-widest mb-3">Sections</div>
          <ul className="space-y-2 font-semibold">
            <li>Courses</li>
            <li>AI Heroes</li>
            <li>Explore (Slangs + Memes)</li>
            </ul>
        </div>
        <div>
          <div className="font-mono text-xs uppercase tracking-widest mb-3">#Edutainment</div>
          <p className="text-sm text-neutral-700">Built for Students who Love vibing while Stu-Dieing!</p>
        </div>

      </div>
      <div className="border-t-2 border-black py-3 text-center font-mono text-xs uppercase tracking-widest">
        © {new Date().getFullYear()} Brainrot Academy — no cap.
      </div>
    </footer>
  );
}