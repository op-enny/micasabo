import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { api } from '$lib/api.js';

export const load: PageServerLoad = async ({ cookies, params }) => {
  const session = cookies.get('session')!;
  const [contract, tenants] = await Promise.all([
    api(`/api/contracts/${params.id}`, session),
    api('/api/tenants', session)
  ]);
  return { contract, allTenants: tenants };
};

export const actions: Actions = {
  addTenant: async ({ request, cookies, params }) => {
    const session = cookies.get('session')!;
    const d = await request.formData();
    try {
      await api(`/api/contracts/${params.id}/tenants`, session, {
        method: 'POST',
        body: JSON.stringify({
          tenant_id: Number(d.get('tenant_id')),
          rolle: d.get('rolle') ?? 'mitmieter',
          gesamtschuldnerisch: d.get('gesamtschuldnerisch') === 'on',
          mietanteil: d.get('mietanteil') ? Number(d.get('mietanteil')) : null,
          einzug: d.get('einzug') || null,
          kaution_betrag: d.get('kaution_betrag') ? Number(d.get('kaution_betrag')) : null,
          kaution_erhalten: d.get('kaution_erhalten') === 'on'
        })
      });
    } catch (e: unknown) {
      return fail(400, { error: (e as Error).message });
    }
    return { success: true };
  },
  recordAuszug: async ({ request, cookies, params }) => {
    const session = cookies.get('session')!;
    const d = await request.formData();
    const ctId = d.get('ct_id') as string;
    try {
      await api(`/api/contracts/${params.id}/tenants/${ctId}/auszug`, session, {
        method: 'PATCH',
        body: JSON.stringify({ auszug: d.get('auszug') })
      });
    } catch (e: unknown) {
      return fail(400, { error: (e as Error).message });
    }
    return { success: true };
  }
};
