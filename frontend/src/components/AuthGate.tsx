"use client";

import { useEffect, useState } from "react";
import { LoginForm } from "./LoginForm";
import { TodayBoard } from "./TodayBoard";
import { getSession } from "@/lib/auth";

export function AuthGate() {
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    void getSession().then(setAuthed);
  }, []);

  if (!authed) {
    return <LoginForm onSuccess={() => setAuthed(true)} />;
  }

  return <TodayBoard onLogout={() => setAuthed(false)} />;
}
