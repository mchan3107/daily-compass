"use client";

import { FormEvent, useId, useState } from "react";

type TaskFormProps = {
  initialTitle?: string;
  initialDetails?: string;
  submitLabel?: string;
  onSubmit: (input: { title: string; details: string }) => void;
  onCancel: () => void;
};

export function TaskForm({
  initialTitle = "",
  initialDetails = "",
  submitLabel = "Save",
  onSubmit,
  onCancel,
}: TaskFormProps) {
  const [title, setTitle] = useState(initialTitle);
  const [details, setDetails] = useState(initialDetails);
  const titleId = useId();
  const detailsId = useId();

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const nextTitle = title.trim();
    if (!nextTitle) return;
    onSubmit({ title: nextTitle, details: details.trim() });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <label className="flex flex-col gap-1 text-xs tracking-wide text-warm-gray uppercase" htmlFor={titleId}>
        Title
        <input
          id={titleId}
          name="title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="rounded-lg border border-sage/40 bg-paper px-3 py-2 font-sans text-sm normal-case text-forest outline-none focus:border-forest"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs tracking-wide text-warm-gray uppercase" htmlFor={detailsId}>
        Details
        <textarea
          id={detailsId}
          name="details"
          value={details}
          onChange={(event) => setDetails(event.target.value)}
          rows={3}
          className="resize-none rounded-lg border border-sage/40 bg-paper px-3 py-2 font-sans text-sm normal-case text-forest outline-none focus:border-forest"
        />
      </label>
      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          className="rounded-full bg-forest px-3 py-1.5 text-sm text-paper transition-colors hover:bg-forest/90"
        >
          {submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full px-3 py-1.5 text-sm text-warm-gray hover:text-forest"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
