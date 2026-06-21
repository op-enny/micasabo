import type { PageServerLoad } from './$types';
import { api } from '$lib/api.js';

export const load: PageServerLoad = async ({ cookies }) => {
  const session = cookies.get('session')!;
  const [properties, tenants] = await Promise.all([
    api('/api/properties', session),
    api('/api/tenants', session)
  ]);
  const vermietet = (properties as { status: string }[]).filter(p => p.status === 'vermietet').length;
  const frei = (properties as { status: string }[]).filter(p => p.status === 'frei').length;
  return { total: (properties as unknown[]).length, vermietet, frei, tenantCount: (tenants as unknown[]).length };
};
