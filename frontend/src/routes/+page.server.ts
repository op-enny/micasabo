import type { Actions } from './$types';
import { fail } from '@sveltejs/kit';

export const actions: Actions = {
  default: async ({ request }) => {
    const data = await request.formData();
    const email = data.get('email');
    const password = data.get('password');

    if (!email || !password) {
      return fail(400, { error: 'E-Mail und Passwort erforderlich.' });
    }

    // Auth logic implemented in Phase 1
    return fail(401, { error: 'Anmeldung noch nicht implementiert (Phase 1).' });
  }
};
