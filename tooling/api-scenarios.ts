interface Scenario {
  path: string;
  delay: number;
  response: Response | null;
}

export function resolveApiScenario(url: URL): Scenario | null {
  if (/^\/api\/products(?:\/\d+)?$/.test(url.pathname)) {
    return {
      path: `${url.pathname.replace(/^\/api/, '')}${url.search}`,
      delay: 0,
      response: null,
    };
  }

  const delay = /^\/api\/delay\/(\d+)(\/products(?:\/\d+)?)$/.exec(
    url.pathname,
  );
  if (delay !== null) {
    return {
      path: `${delay[2]}${url.search}`,
      delay: Math.min(Number(delay[1]), 10_000),
      response: null,
    };
  }

  const failure = /^\/api\/fail\/([45]\d{2})\/products(?:\/\d+)?$/.exec(
    url.pathname,
  );
  if (failure !== null) {
    return {
      path: '',
      delay: 0,
      response: Response.json(
        { message: 'Requested API failure.' },
        { status: Number(failure[1]) },
      ),
    };
  }

  if (/^\/api\/empty\/products(?:\/\d+)?$/.test(url.pathname)) {
    const catalog = url.pathname.endsWith('/products');
    return {
      path: '',
      delay: 0,
      response: Response.json(
        catalog
          ? { products: [], total: 0 }
          : { message: 'Product not found.' },
        { status: catalog ? 200 : 404 },
      ),
    };
  }

  return null;
}
