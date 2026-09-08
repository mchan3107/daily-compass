export async function getSession(): Promise<boolean> {
  const response = await fetch("/api/session", { credentials: "include" });
  if (!response.ok) return false;
  const data = (await response.json()) as { authenticated?: boolean };
  return Boolean(data.authenticated);
}

export async function login(
  email: string,
  password: string,
): Promise<string | null> {
  const response = await fetch("/api/login", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (response.ok) return null;
  return "Invalid email or password";
}

export async function signup(
  email: string,
  password: string,
): Promise<string | null> {
  if (password.length < 8) {
    return "Password must be at least 8 characters";
  }
  const response = await fetch("/api/signup", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (response.ok) return null;
  if (response.status === 409) {
    return "An account with this email already exists";
  }
  const data = (await response.json().catch(() => ({}))) as { detail?: string };
  return data.detail || "Could not create the account";
}

export async function logout(): Promise<void> {
  await fetch("/api/logout", { method: "POST", credentials: "include" });
}
