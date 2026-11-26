import { createServer } from "node:http";
import worker from "../dist/server/index.js";

const port = Number(process.env.PORT || 4173);

const server = createServer(async (request, response) => {
  const url = `http://127.0.0.1:${port}${request.url}`;
  const workerResponse = await worker.fetch(new Request(url, { method: request.method }), {
    RIOT_API_KEY: process.env.RIOT_API_KEY
  });
  response.writeHead(workerResponse.status, Object.fromEntries(workerResponse.headers));
  response.end(Buffer.from(await workerResponse.arrayBuffer()));
});

server.listen(port, "127.0.0.1", () => {
  process.stdout.write(`Worker preview: http://127.0.0.1:${port}\n`);
});
