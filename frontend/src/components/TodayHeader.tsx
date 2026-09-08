import { formatDisplayDate } from "@/lib/dates";

type TodayHeaderProps = {
  date: string;
  viewingToday: boolean;
  onPrev: () => void;
  onNext: () => void;
  onPickDate: (date: string) => void;
  onLogout: () => void;
};

export function TodayHeader({
  date,
  viewingToday,
  onPrev,
  onNext,
  onPickDate,
  onLogout,
}: TodayHeaderProps) {
  return (
    <header className="mb-10 text-center">
      {viewingToday ? (
        <p className="text-sm font-medium tracking-[0.25em] text-gold uppercase">
          Today
        </p>
      ) : null}
      <h1 className="mt-2 font-serif text-4xl text-forest sm:text-5xl">
        Daily Compass
      </h1>
      <div className="mt-4 flex items-center justify-center gap-3 text-warm-gray">
        <button
          type="button"
          onClick={onPrev}
          aria-label="Previous day"
          data-testid="prev-day"
          className="rounded-full px-3 py-1 text-forest hover:bg-sage-soft"
        >
          Previous
        </button>
        <label className="sr-only" htmlFor="date-picker">
          Choose date
        </label>
        <input
          id="date-picker"
          type="date"
          data-testid="date-picker"
          value={date}
          onChange={(event) => {
            if (event.target.value) onPickDate(event.target.value);
          }}
          className="rounded-lg border border-sage/40 bg-paper px-3 py-1.5 text-sm text-forest outline-none focus:border-forest"
        />
        <button
          type="button"
          onClick={onNext}
          aria-label="Next day"
          data-testid="next-day"
          className="rounded-full px-3 py-1 text-forest hover:bg-sage-soft"
        >
          Next
        </button>
      </div>
      <p className="mt-3 text-warm-gray">{formatDisplayDate(date)}</p>
      <button
        type="button"
        onClick={onLogout}
        data-testid="logout"
        className="mt-4 text-sm text-sage hover:text-forest"
      >
        Log out
      </button>
    </header>
  );
}
