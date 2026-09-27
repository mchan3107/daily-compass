"use client";

import { useEffect, useState } from "react";
import { LandingPage } from "./LandingPage";
import { TodayBoard } from "./TodayBoard";
import { getSession } from "@/lib/auth";

export function AuthGate() {
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    void getSession().then(setAuthed);
  }, []);

  if (authed === null) {
    return null;
  }

  if (!authed) {
    return <LandingPage />;
  }

  return <TodayBoard onLogout={() => setAuthed(false)} />;
}
