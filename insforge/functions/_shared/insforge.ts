import { createAdminClient, createClient } from 'npm:@insforge/sdk';

/**
 * El proyecto inyecta API_KEY, ANON_KEY e INSFORGE_BASE_URL en cada funcion.
 * API_KEY es la clave de admin / service role del proyecto (nunca se escribe en
 * el codigo; se lee del entorno).
 */
export function isServiceRole(req: Request): boolean {
  const apiKey = Deno.env.get('API_KEY') ?? '';
  const auth = (req.headers.get('Authorization') ?? '').trim();
  return apiKey.length > 0 && auth === `Bearer ${apiKey}`;
}

export function adminClient() {
  return createAdminClient({
    baseUrl: Deno.env.get('INSFORGE_BASE_URL')!,
    apiKey: Deno.env.get('API_KEY')!,
  });
}

/** Devuelve el id del usuario autenticado a partir del JWT del request, o null. */
export async function getUserId(req: Request): Promise<string | null> {
  const auth = (req.headers.get('Authorization') ?? '').trim();
  const token = auth.startsWith('Bearer ') ? auth.slice('Bearer '.length) : null;
  if (!token) return null;
  try {
    const client = createClient({
      baseUrl: Deno.env.get('INSFORGE_BASE_URL')!,
      accessToken: token,
    });
    const { data } = await client.auth.getCurrentUser();
    return data?.user?.id ?? null;
  } catch {
    return null;
  }
}
