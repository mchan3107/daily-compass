export async function getSession(): Promise<boolean> {
  const response = await fetch("/api/session", { credentials: "include" });
  if (!response.ok) return false;
  const data = (await response.json()) as { authenticated?: boolean };
  return Boolean(data.authenticated);
}

export async function login(
  username: string,
  password: string,
): Promise<string | null> {
  const response = await fetch("/api/login", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (response.ok) return null;
  return "Invalid username or password";
}

export async function logout(): Promise<void> {
  await fetch("/api/logout", { method: "POST", credentials: "include" });
}
