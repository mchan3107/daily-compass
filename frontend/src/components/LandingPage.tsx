import Link from "next/link";

const previewAreas = [
  { name: "Physical Health", task: "Morning walk", color: "bg-[#d8e0d0]" },
  { name: "Relationships", task: "Call Mom", color: "bg-[#f0e1d8]" },
  { name: "Mental Wellbeing", task: "Read twenty pages", color: "bg-[#e4e3d2]" },
  { name: "Hobbies & Fun", task: "Sketch in the garden", color: "bg-[#e5dced]" },
  { name: "School & Career", task: "Outline the project brief", color: "bg-[#e9dfc7]" },
];

export function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden px-6 py-6 sm:px-10 lg:px-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-24 right-[-10rem] h-80 w-80 rounded-full bg-sage-soft/45 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-[32rem] left-[-9rem] h-72 w-72 rounded-full bg-gold/10 blur-3xl"
      />

      <header className="relative mx-auto flex max-w-6xl items-center justify-between">
        <Link href="/" className="font-serif text-2xl text-forest sm:text-3xl">
          Daily Compass
        </Link>
        <nav aria-label="Account" className="flex items-center gap-5 text-sm sm:gap-7">
          <Link className="whitespace-nowrap text-forest hover:text-forest/70" href="/sign-in">
            Sign In
          </Link>
          <Link
            className="rounded-full bg-forest px-4 py-2 text-paper transition-colors hover:bg-forest/90"
            href="/create-account"
          >
            Create Account
          </Link>
        </nav>
      </header>

      <main className="relative mx-auto max-w-6xl pb-24 pt-16 sm:pt-24">
        <section className="grid items-center gap-14 lg:min-h-[36rem] lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-20">
          <div className="border-l-2 border-gold pl-6 sm:pl-10">
            <p className="text-sm font-semibold tracking-[0.2em] text-gold uppercase">
              Daily planning, thoughtfully organized
            </p>
            <h1 className="mt-5 max-w-xl text-5xl leading-[1.05] text-forest sm:text-7xl">
              Five areas. One balanced day.
            </h1>
            <p className="mt-6 max-w-xl text-xl leading-relaxed text-warm-gray sm:text-2xl">
              Organize your day around the five areas of life that matter most to you.
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-xl px-3 py-6 sm:px-8">
            <div
              aria-hidden="true"
              className="absolute top-0 right-0 h-36 w-36 rounded-full border border-gold/40"
            />
            <div
              aria-hidden="true"
              className="absolute bottom-0 left-0 h-24 w-24 rounded-full bg-sage-soft/70"
            />
            <div className="relative rounded-[2rem] bg-paper p-3 shadow-[0_24px_60px_rgba(47,74,60,0.16)] ring-1 ring-sage/30 sm:p-4">
              <div className="flex items-center justify-between rounded-[1.4rem] bg-forest px-4 py-3 text-paper">
                <div>
                  <p className="text-xs tracking-[0.16em] text-paper/70 uppercase">Today</p>
                  <p className="font-serif text-xl">A day with room for it all</p>
                </div>
                <span className="rounded-full bg-gold px-3 py-1 text-xs font-semibold text-forest">
                  5 areas
                </span>
              </div>
              <div className="mt-3 space-y-2" aria-label="Daily Compass day preview">
                {previewAreas.map((area) => (
                  <div
                    key={area.name}
                    className="flex items-center gap-3 rounded-2xl bg-cream p-3 ring-1 ring-sage/20"
                  >
                    <span className={`h-8 w-2 rounded-full ${area.color}`} />
                    <div className="min-w-0 flex-1">
                      <p className="font-serif text-sm text-forest">{area.name}</p>
                      <p className="truncate text-xs text-warm-gray">{area.task}</p>
                    </div>
                    <span className="h-4 w-4 rounded-full border-2 border-sage" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-24 border-t border-sage/40 pt-20 sm:mt-32">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-20">
            <div>
              <p className="text-sm font-semibold tracking-[0.2em] text-gold uppercase">
                A calmer way to plan
              </p>
              <h2 className="mt-4 text-4xl leading-tight text-forest sm:text-5xl">
                Why use Daily Compass
              </h2>
            </div>
            <div className="grid gap-6 text-lg leading-relaxed text-warm-gray sm:text-xl">
              <p>
                Daily Compass gives you a simple way to organize your day across the different
                areas of life that matter to you.
              </p>
              <p>
                Instead of one long task list, your day is organized into five areas, making it
                easier to see where your attention is going and what may need more of it.
              </p>
              <p>
                When you need help deciding what to focus on, the AI assistant can look at your
                day and help you think through your priorities.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-24 rounded-[2rem] bg-cream-dark/70 p-8 ring-1 ring-sage/25 sm:mt-32 sm:p-12">
          <p className="text-sm font-semibold tracking-[0.2em] text-gold uppercase">
            A simple rhythm
          </p>
          <h2 className="mt-4 text-4xl text-forest sm:text-5xl">How It Works</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {[
              ["01", "Plan your day", "Add tasks for today or plan ahead for another day."],
              [
                "02",
                "Organize your tasks",
                "Place tasks across your five areas and arrange your day around what matters to you.",
              ],
              [
                "03",
                "Ask your AI assistant",
                "Get help prioritizing tasks, planning your day, or deciding what to focus on next.",
              ],
            ].map(([number, title, description]) => (
              <div key={number} className="border-t border-gold pt-5">
                <p className="text-sm font-semibold tracking-[0.16em] text-gold">{number}</p>
                <h3 className="mt-3 text-2xl text-forest">{title}</h3>
                <p className="mt-2 text-lg leading-relaxed text-warm-gray">{description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
