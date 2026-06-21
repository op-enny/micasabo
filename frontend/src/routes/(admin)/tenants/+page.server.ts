import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { api } from '$lib/api.js';

export const load: PageServerLoad = async ({ cookies, url }) => {
  const session = cookies.get('session')!;
  const q = url.searchParams.get('q') ?? '';
  const tenants = await api(`/api/tenants${q ? `?q=${encodeURIComponent(q)}` : ''}`, session);
  return { tenants, q };
};

export const actions: Actions = {
  create: async ({ request, cookies }) => {
    const session = cookies.get('session')!;
    const d = await request.formData();
    try {
      const result = await api('/api/tenants', session, {
        method: 'POST',
        body: JSON.stringify({
          vorname: d.get('vorname'), nachname: d.get('nachname'),
          email: d.get('email') || null, telefon: d.get('telefon') || null,
          geburtsdatum: d.get('geburtsdatum') || null, notizen: d.get('notizen') || null
        })
      }) as { id: number };
      throw redirect(302, `/tenants/${result.id}`);
    } catch (e: unknown) {
      if ((e as { status?: number }).status === 302) throw e;
      return fail(400, { error: (e as Error).message });
    }
  }
};
