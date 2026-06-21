import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { api } from '$lib/api.js';

export const load: LayoutServerLoad = async ({ cookies, url }) => {
  const session = cookies.get('session');
  if (!session) throw redirect(302, `/login`);

  try {
    const user = await api('/api/auth/me', session);
    return { user };
  } catch {
    throw redirect(302, `/login`);
  }
};
