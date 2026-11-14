import { createServer } from 'node:http';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { setTimeout } from 'node:timers/promises';
import { z } from 'zod';
import { apiProducts } from '../tests/fixtures.ts';

const scenarioSchema = z.object({
  status: z.number().int().min(200).max(599).default(200),
  detailStatus: z.number().int().min(200).max(599).default(200),
  delay: z.number().int().min(0).max(5000).default(0),
  catalog: z.array(z.unknown()).default(apiProducts),
});
let scenario = scenarioSchema.parse({});
let detailRequests = 0;

async function handle(request: IncomingMessage, response: ServerResponse) {
  if (request.url === '/__scenario' && request.method === 'POST') {
    let body = '';
    for await (const chunk of request) body += String(chunk);
    scenario = scenarioSchema.parse(JSON.parse(body));
    detailRequests = 0;
    response.writeHead(200).end('{}');
    return;
  }
  if (request.url === '/__requests') {
    response
      .writeHead(200, { 'Content-Type': 'application/json' })
      .end(JSON.stringify({ detailRequests }));
    return;
  }
  const current = scenario;
  await setTimeout(current.delay);
  const url = new URL(request.url ?? '/', 'http://127.0.0.1:5198');
  let data: unknown = {};
  let status = current.status;
  if (url.pathname === '/products') {
    data = { products: current.catalog, total: current.catalog.length };
  } else if (url.pathname.startsWith('/products/')) {
    detailRequests += 1;
    status = current.detailStatus;
    const product = current.catalog.find(
      (item) =>
        z.object({ id: z.number() }).parse(item).id ===
        Number(url.pathname.split('/').at(-1)),
    );
    if (product === undefined) status = 404;
    data = product ?? {};
  }
  response
    .writeHead(status, { 'Content-Type': 'application/json' })
    .end(JSON.stringify(data));
}

createServer((request, response) => {
  void handle(request, response).catch(() => response.writeHead(500).end('{}'));
}).listen(5198, '127.0.0.1');
