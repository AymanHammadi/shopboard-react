import type { Connect, Plugin } from 'vite';

export const apiScenarioMiddleware: Connect.NextHandleFunction = (
  request,
  response,
  next,
) => {
  const url = new URL(request.url ?? '/', 'http://localhost');
  const delay = /^\/api\/delay\/(\d+)(\/products(?:\/\d+)?)$/.exec(
    url.pathname,
  );
  if (delay !== null) {
    const milliseconds = Math.min(Number(delay[1]), 10_000);
    request.url = `/api${delay[2]}${url.search}`;
    setTimeout(next, milliseconds);
    return;
  }

  const failure = /^\/api\/fail\/([45]\d{2})\/products(?:\/\d+)?$/.exec(
    url.pathname,
  );
  if (failure !== null) {
    response.writeHead(Number(failure[1]), {
      'Content-Type': 'application/json',
    });
    response.end(JSON.stringify({ message: 'Requested API failure.' }));
    return;
  }

  if (/^\/api\/empty\/products(?:\/\d+)?$/.test(url.pathname)) {
    const catalog = url.pathname.endsWith('/products');
    response.writeHead(catalog ? 200 : 404, {
      'Content-Type': 'application/json',
    });
    response.end(
      JSON.stringify(
        catalog
          ? { products: [], total: 0 }
          : { message: 'Product not found.' },
      ),
    );
    return;
  }
  next();
};

export function apiScenarios(): Plugin {
  return {
    name: 'shopboard-api-scenarios',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(apiScenarioMiddleware);
    },
  };
}
