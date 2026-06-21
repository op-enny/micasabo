const BACKEND = process.env.BACKEND_URL ?? 'http://localhost:3001';

export async function api(path: string, sessionCookie: string, options: RequestInit = {}) {
  const res = await fetch(`${BACKEND}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Cookie: `session=${sessionCookie}`,
      ...options.headers
    }
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(err.error ?? `HTTP ${res.status}`);
  }
  return res.json();
}
