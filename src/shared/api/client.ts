export class ApiError extends Error {
  readonly status: number;

  constructor(status: number) {
    super(
      status === 404
        ? 'This product could not be found.'
        : 'We could not load the products. Try again.',
    );
    this.name = 'ApiError';
    this.status = status;
  }
}

const baseUrl = 'https://dummyjson.com';

export async function getJson(
  path: string,
  signal: AbortSignal,
): Promise<unknown> {
  const response = await fetch(`${baseUrl}${path}`, {
    signal: AbortSignal.any([signal, AbortSignal.timeout(15_000)]),
    headers: { Accept: 'application/json' },
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
