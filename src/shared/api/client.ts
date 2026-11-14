export class ApiError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(status: number, body?: unknown) {
    super(
      status === 404
        ? 'This product could not be found.'
        : 'We could not load the products. Try again.',
    );
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

export async function postJson(path: string, body: unknown): Promise<unknown> {
  const response = await fetch(path, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(20_000),
    cache: 'no-store',
  });
  const data: unknown = await response.json();
  if (response.ok === false) throw new ApiError(response.status, data);
  return data;
}

export async function getJson(
  path: string,
  signal: AbortSignal,
  configuredBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ??
    'https://dummyjson.com',
): Promise<unknown> {
  const baseUrl = configuredBaseUrl.replace(/\/$/, '');
  const response = await fetch(`${baseUrl}${path}`, {
    signal: AbortSignal.any([signal, AbortSignal.timeout(15_000)]),
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });

  if (response.ok === false) {
    throw new ApiError(response.status);
  }

  const data: unknown = await response.json();
  return data;
}

export function requestErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  return 'We could not load the products. Check your connection and try again.';
}
