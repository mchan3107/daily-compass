"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LoginForm } from "./LoginForm";

type AuthPageProps = {
  initialMode: "login" | "signup";
};

export function AuthPage({ initialMode }: AuthPageProps) {
  const router = useRouter();

  return (
    <div className="relative min-h-screen">
      <header className="absolute top-6 left-6 sm:left-10 lg:left-16">
        <Link href="/" className="font-serif text-2xl text-forest sm:text-3xl">
          Daily Compass
        </Link>
      </header>
      <LoginForm
        initialMode={initialMode}
        showWordmark={false}
        onSuccess={() => router.push("/")}
      />
    </div>
  );
}
