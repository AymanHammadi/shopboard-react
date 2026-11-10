import { setTimeout } from 'node:timers/promises';
import {
  ApiError,
  getJson,
  requestErrorMessage,
} from '../../../shared/api/client';
import { resolveApiScenario } from '../../../../tooling/api-scenarios';

export async function GET(request: Request) {
  if (process.env.NODE_ENV !== 'development') {
    return Response.json({ message: 'Not found.' }, { status: 404 });
  }

  const scenario = resolveApiScenario(new URL(request.url));
  if (scenario === null) {
    return Response.json({ message: 'Not found.' }, { status: 404 });
  }
  if (scenario.response !== null) return scenario.response;

  if (scenario.delay > 0) {
    await setTimeout(scenario.delay, undefined, { signal: request.signal });
  }

  try {
    const data = await getJson(
      scenario.path,
      request.signal,
      'https://dummyjson.com',
    );
    return Response.json(data);
  } catch (error) {
    return Response.json(
      { message: requestErrorMessage(error) },
      { status: error instanceof ApiError ? error.status : 502 },
    );
  }
}
