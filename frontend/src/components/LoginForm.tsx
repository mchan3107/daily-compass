"use client";

import { FormEvent, useId, useState } from "react";
import { login, signup } from "@/lib/auth";

type LoginFormProps = {
  onSuccess: () => void;
};

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const emailId = useId();
  const passwordId = useId();
  const isSignup = mode === "signup";

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const message = isSignup
      ? await signup(email, password)
      : await login(email, password);
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
        <p className="mt-3 text-warm-gray">
          {isSignup ? "Create an account to plan your day." : "Sign in to plan your day."}
        </p>
      </header>
      <form
        data-testid={isSignup ? "signup-form" : "login-form"}
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 rounded-3xl bg-sage-soft/60 p-6 ring-1 ring-sage/30"
      >
        <label
          className="flex flex-col gap-1 text-xs tracking-wide text-warm-gray uppercase"
          htmlFor={emailId}
        >
          Email
          <input
            id={emailId}
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
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
            autoComplete={isSignup ? "new-password" : "current-password"}
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
          {isSignup ? "Create account" : "Sign in"}
        </button>
        {isSignup ? (
          <p className="text-center text-sm text-warm-gray">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError("");
              }}
              className="text-forest underline-offset-4 hover:underline"
            >
              Sign in
            </button>
          </p>
        ) : (
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setError("");
            }}
            className="text-sm text-forest underline-offset-4 hover:underline"
          >
            Create an account
          </button>
        )}
      </form>
    </div>
  );
}
