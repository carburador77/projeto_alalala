import http from "http";
import { randomUUID } from "crypto";
import { fileURLToPath } from "url";
import path from "path";
import { promises as fs } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, "public");

const matches = [];

const toNumber = (value) => {
  if (value === "" || value === null || value === undefined) {
    return null;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

const normalizeMatchPayload = (payload) => ({
  team: payload.team?.trim() ?? "",
  opponent: payload.opponent?.trim() ?? "",
  date: payload.date?.trim() ?? "",
  scoreHome: toNumber(payload.scoreHome),
  scoreAway: toNumber(payload.scoreAway),
  possession: toNumber(payload.possession),
  xg: toNumber(payload.xg),
  shots: toNumber(payload.shots),
  shotsOnTarget: toNumber(payload.shotsOnTarget),
  corners: toNumber(payload.corners),
  fouls: toNumber(payload.fouls),
  yellowCards: toNumber(payload.yellowCards),
  redCards: toNumber(payload.redCards),
  passes: toNumber(payload.passes),
  passAccuracy: toNumber(payload.passAccuracy),
});

const contentTypes = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
};

const sendJson = (res, status, data) => {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
};

const readBody = async (req) => {
  let body = "";
  for await (const chunk of req) {
    body += chunk;
  }
  if (!body) {
    return {};
  }
  try {
    return JSON.parse(body);
  } catch (error) {
    return {};
  }
};

const handleApi = async (req, res, url) => {
  if (url.pathname === "/api/matches" && req.method === "GET") {
    sendJson(res, 200, matches);
    return true;
  }

  if (url.pathname === "/api/matches" && req.method === "POST") {
    const payload = await readBody(req);
    const match = normalizeMatchPayload(payload);
    if (!match.team || !match.opponent) {
      sendJson(res, 400, { message: "Time e adversário são obrigatórios." });
      return true;
    }
    const newMatch = { id: randomUUID(), ...match };
    matches.unshift(newMatch);
    sendJson(res, 201, newMatch);
    return true;
  }

  if (url.pathname.startsWith("/api/matches/")) {
    const id = url.pathname.split("/").pop();
    const matchIndex = matches.findIndex((item) => item.id === id);
    if (matchIndex === -1) {
      sendJson(res, 404, { message: "Partida não encontrada." });
      return true;
    }

    if (req.method === "PUT") {
      const payload = await readBody(req);
      const match = normalizeMatchPayload(payload);
      if (!match.team || !match.opponent) {
        sendJson(res, 400, { message: "Time e adversário são obrigatórios." });
        return true;
      }
      const updatedMatch = { ...matches[matchIndex], ...match };
      matches[matchIndex] = updatedMatch;
      sendJson(res, 200, updatedMatch);
      return true;
    }

    if (req.method === "DELETE") {
      matches.splice(matchIndex, 1);
      res.writeHead(204);
      res.end();
      return true;
    }
  }

  return false;
};

const serveStatic = async (res, filePath) => {
  try {
    const data = await fs.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { "Content-Type": contentTypes[ext] || "text/plain" });
    res.end(data);
  } catch (error) {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Arquivo não encontrado.");
  }
};

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (url.pathname.startsWith("/api/")) {
    const handled = await handleApi(req, res, url);
    if (handled) {
      return;
    }
    sendJson(res, 404, { message: "Rota não encontrada." });
    return;
  }

  const staticPath =
    url.pathname === "/"
      ? path.join(publicDir, "index.html")
      : path.join(publicDir, url.pathname);
  await serveStatic(res, staticPath);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor iniciado em http://localhost:${PORT}`);
});
