import Link from "next/link";

const previewAreas = [
  { name: "Physical Health", task: "Morning walk", color: "bg-[#d8e0d0]" },
  { name: "Relationships", task: "Call Mom", color: "bg-[#f0e1d8]" },
  { name: "Mental Wellbeing", task: "Journal for 10 minutes", color: "bg-[#e4e3d2]" },
  { name: "Hobbies & Fun", task: "Practice guitar", color: "bg-[#e5dced]" },
  { name: "School & Career", task: "Finish problem set", color: "bg-[#e9dfc7]" },
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
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-[38rem] right-[12%] hidden h-56 w-72 rounded-[60%_40%_55%_45%] bg-sage-soft/25 blur-2xl lg:block"
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
            <div
              aria-hidden="true"
              className="pointer-events-none absolute right-[-1rem] bottom-[-1.5rem] h-64 w-36 origin-bottom-right scale-75 sm:right-[-2rem] sm:bottom-[-1rem] sm:h-72 sm:w-40 sm:scale-90 lg:right-[-3.5rem] lg:bottom-[-0.5rem] lg:h-80 lg:w-44 lg:scale-100"
            >
              <span className="absolute right-9 bottom-12 h-56 w-px origin-bottom rotate-[-15deg] bg-forest/45" />
              <span className="absolute right-13 bottom-12 h-48 w-px origin-bottom rotate-[16deg] bg-forest/35" />
              <span className="absolute right-7 bottom-12 h-40 w-px origin-bottom rotate-[-36deg] bg-forest/30" />
              <span className="absolute right-16 bottom-29 h-14 w-7 rotate-[-42deg] rounded-[100%_0_100%_0] bg-sage/70" />
              <span className="absolute right-2 bottom-35 h-15 w-7 rotate-[38deg] rounded-[0_100%_0_100%] bg-sage/65" />
              <span className="absolute right-17 bottom-45 h-13 w-7 rotate-[-34deg] rounded-[100%_0_100%_0] bg-sage-soft" />
              <span className="absolute right-1 bottom-51 h-15 w-7 rotate-[40deg] rounded-[0_100%_0_100%] bg-sage/55" />
              <span className="absolute right-20 bottom-57 h-12 w-6 rotate-[-38deg] rounded-[100%_0_100%_0] bg-sage/60" />
              <span className="absolute right-4 bottom-63 h-14 w-6 rotate-[38deg] rounded-[0_100%_0_100%] bg-sage-soft/90" />
              <span className="absolute right-7 bottom-0 h-14 w-18 rounded-b-2xl rounded-t-md bg-forest/45 ring-1 ring-forest/20" />
            </div>
            <div className="relative z-10 rounded-[2rem] bg-paper p-3 shadow-[0_24px_60px_rgba(47,74,60,0.16)] ring-1 ring-sage/30 sm:p-4">
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
                Daily Compass gives you a simple and visual way to organize your day across the
                different areas of life that matter to you.
              </p>
              <p>
                Instead of one long task list, your day is organized into five areas, making it
                easy to see your plans at a glance and understand where your attention is going.
              </p>
              <p>
                Your AI assistant can help you plan and prioritize your day, add or move tasks,
                and make changes with you when your plans change.
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
                "Get help planning your day, prioritizing tasks, and adding, moving, or updating tasks for you.",
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
