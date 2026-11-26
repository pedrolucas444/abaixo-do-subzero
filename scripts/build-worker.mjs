import { copyFile, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const html = await readFile(resolve(root, "dist/index.html"), "utf8");
const css = await readFile(resolve(root, "dist/styles.css"), "utf8");
const app = await readFile(resolve(root, "dist/app.js"), "utf8");
const serverDir = resolve(root, "dist/server");
const manifestDir = resolve(root, "dist/.openai");

await rm(serverDir, { recursive: true, force: true });
await mkdir(serverDir, { recursive: true });
await mkdir(manifestDir, { recursive: true });

const worker = `
const INDEX_HTML = ${JSON.stringify(html)};
const STYLES_CSS = ${JSON.stringify(css)};
const APP_JS = ${JSON.stringify(app)};

const tierNames = {
  IRON: "Ferro",
  BRONZE: "Bronze",
  SILVER: "Prata",
  GOLD: "Ouro",
  PLATINUM: "Platina",
  EMERALD: "Esmeralda",
  DIAMOND: "Diamante",
  MASTER: "Mestre",
  GRANDMASTER: "Grão-Mestre",
  CHALLENGER: "Desafiante"
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff"
    }
  });
}

async function riotRequest(url, apiKey) {
  const response = await fetch(url, {
    headers: { "X-Riot-Token": apiKey, Accept: "application/json" }
  });
  if (response.ok) return response.json();

  const messages = {
    401: "A chave da Riot não foi aceita.",
    403: "A chave da Riot expirou ou não tem acesso.",
    404: "Conta não encontrada no servidor BR.",
    429: "Muitas consultas agora. Tente novamente em instantes."
  };
  const error = new Error(messages[response.status] || "A Riot não respondeu à consulta.");
  error.status = response.status;
  throw error;
}

function rankLabel(entry) {
  const tier = tierNames[entry.tier] || entry.tier;
  return ["MASTER", "GRANDMASTER", "CHALLENGER"].includes(entry.tier)
    ? tier
    : tier + " " + entry.rank;
}

async function lookupLol(url, env) {
  const riotId = (url.searchParams.get("riotId") || "").trim();
  const separator = riotId.lastIndexOf("#");
  if (separator <= 0 || separator === riotId.length - 1) {
    return json({ code: "INVALID_RIOT_ID", message: "Use o formato Nick#TAG." }, 400);
  }

  if (!env.RIOT_API_KEY) {
    return json({
      code: "RIOT_KEY_MISSING",
      message: "A integração está pronta, mas a chave da Riot ainda não foi configurada."
    }, 503);
  }

  const gameName = riotId.slice(0, separator).trim();
  const tagLine = riotId.slice(separator + 1).trim();

  try {
    const account = await riotRequest(
      "https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/" + encodeURIComponent(gameName) + "/" + encodeURIComponent(tagLine),
      env.RIOT_API_KEY
    );
    const summoner = await riotRequest(
      "https://br1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/" + encodeURIComponent(account.puuid),
      env.RIOT_API_KEY
    );
    const entries = await riotRequest(
      "https://br1.api.riotgames.com/lol/league/v4/entries/by-summoner/" + encodeURIComponent(summoner.id),
      env.RIOT_API_KEY
    );
    const solo = entries.find((entry) => entry.queueType === "RANKED_SOLO_5x5");
    const normalizedRiotId = (account.gameName || gameName) + "#" + (account.tagLine || tagLine);

    if (!solo) {
      return json({
        riotId: normalizedRiotId,
        gameName: account.gameName || gameName,
        tagLine: account.tagLine || tagLine,
        summonerLevel: summoner.summonerLevel,
        ranked: false,
        rankLabel: "Sem elo",
        leaguePoints: 0,
        wins: 0,
        losses: 0
      });
    }

    return json({
      riotId: normalizedRiotId,
      gameName: account.gameName || gameName,
      tagLine: account.tagLine || tagLine,
      summonerLevel: summoner.summonerLevel,
      ranked: true,
      tier: solo.tier,
      division: solo.rank,
      rankLabel: rankLabel(solo),
      leaguePoints: solo.leaguePoints,
      wins: solo.wins,
      losses: solo.losses
    });
  } catch (error) {
    const status = [400, 401, 403, 404, 429].includes(error.status) ? error.status : 502;
    return json({ code: "RIOT_API_ERROR", message: error.message }, status);
  }
}

function asset(body, contentType) {
  return new Response(body, {
    headers: {
      "content-type": contentType,
      "cache-control": "public, max-age=300",
      "x-content-type-options": "nosniff"
    }
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === "HEAD") {
      const contentTypes = {
        "/": "text/html; charset=utf-8",
        "/index.html": "text/html; charset=utf-8",
        "/styles.css": "text/css; charset=utf-8",
        "/app.js": "application/javascript; charset=utf-8"
      };
      const contentType = contentTypes[url.pathname];
      return contentType
        ? new Response(null, { status: 200, headers: { "content-type": contentType } })
        : new Response(null, { status: 404 });
    }
    if (request.method !== "GET") return new Response("Method not allowed", { status: 405 });
    if (url.pathname === "/api/lol-rank") return lookupLol(url, env);
    if (url.pathname === "/styles.css") return asset(STYLES_CSS, "text/css; charset=utf-8");
    if (url.pathname === "/app.js") return asset(APP_JS, "application/javascript; charset=utf-8");
    if (url.pathname === "/" || url.pathname === "/index.html") return asset(INDEX_HTML, "text/html; charset=utf-8");
    return new Response("Not found", { status: 404 });
  }
};
`;

await writeFile(resolve(serverDir, "index.js"), worker.trimStart());
await copyFile(resolve(root, ".openai/hosting.json"), resolve(manifestDir, "hosting.json"));
