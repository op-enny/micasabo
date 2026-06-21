import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

const BACKEND = process.env.BACKEND_URL ?? 'http://localhost:3001';

export const actions: Actions = {
  default: async ({ request, cookies }) => {
    const data = await request.formData();
    const email = data.get('email') as string;
    const password = data.get('password') as string;
    if (!email || !password) return fail(400, { error: 'E-Mail und Passwort erforderlich.' });

    let res: Response;
    try {
      res = await fetch(`${BACKEND}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
    } catch {
      return fail(503, { error: 'Backend nicht erreichbar.' });
    }

    if (!res.ok) {
      const body = await res.json().catch(() => ({})) as { error?: string };
      return fail(res.status, { error: body.error ?? 'Anmeldung fehlgeschlagen.' });
    }

    // Forward the session cookie from the backend
    const setCookie = res.headers.get('set-cookie');
    if (setCookie) {
      const match = setCookie.match(/session=([^;]+)/);
      if (match) {
        cookies.set('session', match[1], {
          path: '/',
          httpOnly: true,
          sameSite: 'strict',
          maxAge: 60 * 60 * 24 * 14
        });
      }
    }
    throw redirect(302, '/dashboard');
  }
};
