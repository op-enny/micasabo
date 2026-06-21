import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { api } from '$lib/api.js';

export const load: PageServerLoad = async ({ cookies, url }) => {
  const session = cookies.get('session')!;
  const typ = url.searchParams.get('typ') ?? '';
  const properties = await api(`/api/properties${typ ? `?typ=${typ}` : ''}`, session);
  return { properties, typ };
};

export const actions: Actions = {
  create: async ({ request, cookies }) => {
    const session = cookies.get('session')!;
    const d = await request.formData();
    try {
      await api('/api/properties', session, {
        method: 'POST',
        body: JSON.stringify({
          typ: d.get('typ'), name: d.get('name'),
          parent_id: d.get('parent_id') || null,
          moebliert: d.get('moebliert') === 'on',
          internet_vorhanden: d.get('internet_vorhanden') === 'on',
          status: d.get('status') ?? 'frei',
          flaeche_qm: d.get('flaeche_qm') ? Number(d.get('flaeche_qm')) : null,
          zimmer_anzahl: d.get('zimmer_anzahl') ? Number(d.get('zimmer_anzahl')) : null,
          kaltmiete: d.get('kaltmiete') ? Number(d.get('kaltmiete')) : null,
          nebenkosten_pauschal: d.get('nebenkosten_pauschal') ? Number(d.get('nebenkosten_pauschal')) : null,
          adresse: d.get('adresse'), beschreibung: d.get('beschreibung'),
          aktiv_auf_landingpage: d.get('aktiv_auf_landingpage') === 'on'
        })
      });
    } catch (e: unknown) {
      return fail(400, { error: (e as Error).message });
    }
    throw redirect(302, '/properties');
  }
};
