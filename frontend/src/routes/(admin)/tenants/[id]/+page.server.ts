import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { api } from '$lib/api.js';

export const load: PageServerLoad = async ({ cookies, params }) => {
  const session = cookies.get('session')!;
  const [tenant, contracts] = await Promise.all([
    api(`/api/tenants/${params.id}`, session),
    api(`/api/tenants/${params.id}/contracts`, session)
  ]);
  return { tenant, contracts };
};

export const actions: Actions = {
  update: async ({ request, cookies, params }) => {
    const session = cookies.get('session')!;
    const d = await request.formData();
    try {
      await api(`/api/tenants/${params.id}`, session, {
        method: 'PUT',
        body: JSON.stringify({
          vorname: d.get('vorname'), nachname: d.get('nachname'),
          email: d.get('email') || null, telefon: d.get('telefon') || null,
          geburtsdatum: d.get('geburtsdatum') || null, notizen: d.get('notizen') || null
        })
      });
    } catch (e: unknown) {
      return fail(400, { error: (e as Error).message });
    }
    return { success: true };
  }
};
