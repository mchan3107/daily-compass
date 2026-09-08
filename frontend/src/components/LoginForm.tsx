"use client";

import { FormEvent, useId, useState } from "react";
import { login } from "@/lib/auth";

type LoginFormProps = {
  onSuccess: () => void;
};

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const usernameId = useId();
  const passwordId = useId();

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const message = await login(username, password);
    if (message) {
      setError(message);
      return;
    }
    setError("");
    onSuccess();
  }

  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col justify-center px-4 py-16">
      <header className="mb-10 text-center">
        <p className="text-sm font-medium tracking-[0.25em] text-gold uppercase">
          Welcome
        </p>
        <h1 className="mt-2 font-serif text-4xl text-forest">Daily Compass</h1>
        <p className="mt-3 text-warm-gray">Sign in to plan your day.</p>
      </header>
      <form
        data-testid="login-form"
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 rounded-3xl bg-sage-soft/60 p-6 ring-1 ring-sage/30"
      >
        <label
          className="flex flex-col gap-1 text-xs tracking-wide text-warm-gray uppercase"
          htmlFor={usernameId}
        >
          Username
          <input
            id={usernameId}
            name="username"
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className="rounded-lg border border-sage/40 bg-paper px-3 py-2 font-sans text-sm normal-case text-forest outline-none focus:border-forest"
          />
        </label>
        <label
          className="flex flex-col gap-1 text-xs tracking-wide text-warm-gray uppercase"
          htmlFor={passwordId}
        >
          Password
          <input
            id={passwordId}
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="rounded-lg border border-sage/40 bg-paper px-3 py-2 font-sans text-sm normal-case text-forest outline-none focus:border-forest"
          />
        </label>
        {error ? (
          <p role="alert" className="text-sm text-clay">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          className="rounded-full bg-forest px-4 py-2 text-sm text-paper transition-colors hover:bg-forest/90"
        >
          Sign in
        </button>
      </form>
    </div>
  );
}
