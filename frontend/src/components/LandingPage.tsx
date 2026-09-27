import Link from "next/link";

export function LandingPage() {
  return (
    <div className="min-h-screen px-6 py-6 sm:px-10 lg:px-16">
      <header className="mx-auto flex max-w-6xl items-center justify-between">
        <Link href="/" className="font-serif text-2xl text-forest sm:text-3xl">
          Daily Compass
        </Link>
        <nav aria-label="Account" className="flex items-center gap-5 text-sm sm:gap-7">
          <Link className="text-forest hover:text-forest/70" href="/sign-in">
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

      <main className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-4xl items-center py-20">
        <section className="max-w-3xl border-l-2 border-gold pl-6 sm:pl-10">
          <p className="text-sm font-semibold tracking-[0.2em] text-gold uppercase">
            Daily planning, thoughtfully organized
          </p>
          <h1 className="mt-5 text-5xl leading-[1.05] text-forest sm:text-7xl">
            Five areas. One balanced day.
          </h1>
          <p className="mt-6 max-w-xl text-xl leading-relaxed text-warm-gray sm:text-2xl">
            Organize your day around the five areas of life that matter most to you.
          </p>
        </section>
      </main>
    </div>
  );
}
