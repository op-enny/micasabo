import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { api } from '$lib/api.js';

export const load: PageServerLoad = async ({ cookies, params }) => {
  const session = cookies.get('session')!;
  const isNew = params.id === 'new';
  if (isNew) return { property: null, rooms: [], contracts: [], documents: [], wgs: [] };

  const [property, rooms, contracts, documents, wgs] = await Promise.all([
    api(`/api/properties/${params.id}`, session),
    api(`/api/properties/${params.id}/zimmer`, session),
    api(`/api/contracts?property_id=${params.id}`, session),
    api(`/api/uploads/documents?property_id=${params.id}`, session),
    api('/api/properties?typ=wg', session)
  ]);
  return { property, rooms, contracts, documents, wgs };
};

export const actions: Actions = {
  update: async ({ request, cookies, params }) => {
    const session = cookies.get('session')!;
    const d = await request.formData();
    try {
      await api(`/api/properties/${params.id}`, session, {
        method: 'PUT',
        body: JSON.stringify({
          typ: d.get('typ'), name: d.get('name'),
          parent_id: d.get('parent_id') || null,
          moebliert: d.get('moebliert') === 'on',
          internet_vorhanden: d.get('internet_vorhanden') === 'on',
          status: d.get('status'),
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
    return { success: true };
  },
  archive: async ({ cookies, params }) => {
    const session = cookies.get('session')!;
    await api(`/api/properties/${params.id}`, session, { method: 'DELETE' });
    throw redirect(302, '/properties');
  },
  addContract: async ({ request, cookies, params }) => {
    const session = cookies.get('session')!;
    const d = await request.formData();
    try {
      const contract = await api('/api/contracts', session, {
        method: 'POST',
        body: JSON.stringify({
          property_id: Number(params.id),
          beginn_datum: d.get('beginn_datum'),
          unbefristet: d.get('unbefristet') === 'on',
          miete_gesamt: Number(d.get('miete_gesamt')),
          nebenkosten: d.get('nebenkosten') ? Number(d.get('nebenkosten')) : 0
        })
      }) as { id: number };
      throw redirect(302, `/contracts/${contract.id}`);
    } catch (e: unknown) {
      if ((e as { status?: number }).status === 302) throw e;
      return fail(400, { error: (e as Error).message });
    }
  }
};
