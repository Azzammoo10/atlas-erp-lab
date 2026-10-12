export type Health = { status: 'UP' };

export async function fetchHealth(signal: AbortSignal): Promise<Health> {
  const response = await fetch('/api/health', { signal, credentials: 'same-origin', headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error('Backend indisponible.');
  const data: unknown = await response.json();
  if (!data || typeof data !== 'object' || !('status' in data) || data.status !== 'UP') {
    throw new Error('Réponse du backend invalide.');
  }
  return { status: 'UP' };
}
