import "dotenv/config";
import express from "express";
import { WebSocketServer, WebSocket } from "ws";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Orchestrator } from "./orchestrator.js";
import type { WSEvent } from "./types.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: "/ws" });

app.use(express.json());

// Serve static frontend files in production
const clientDir = path.join(__dirname, "../client");
app.use(express.static(clientDir));


// Track connected clients
const clients = new Set<WebSocket>();

function broadcast(event: WSEvent) {
  const data = JSON.stringify(event);
  console.log(`[WS] ${event.type}:`, "agent" in event ? event.agent : "");
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  }
}

const orchestrator = new Orchestrator(broadcast);

// WebSocket connections
wss.on("connection", (ws) => {
  clients.add(ws);
  console.log(`[WS] Client connected (${clients.size} total)`);

  // Send current state
  ws.send(
    JSON.stringify({
      type: "init",
      agents: orchestrator.getAgentInfos(),
      tasks: orchestrator.getTasks(),
    })
  );

  ws.on("close", () => {
    clients.delete(ws);
    console.log(`[WS] Client disconnected (${clients.size} total)`);
  });
});

// --- API Routes ---

// Start a new project
app.post("/api/project", async (req, res) => {
  const { description, projectName } = req.body;

  if (!description || !projectName) {
    res.status(400).json({ error: "description and projectName required" });
    return;
  }

  console.log(`\n[PROJECT] Starting: ${projectName}`);
  console.log(`[BRIEF] ${description}\n`);

  // Run async — respond immediately
  res.json({ status: "started", projectName });

  try {
    const outputPath = await orchestrator.startProject({ description, projectName });
    broadcast({
      type: "project_complete",
      projectName,
      outputPath,
    });
  } catch (err) {
    console.error("[ERROR] Project failed:", err);
    broadcast({
      type: "error",
      agent: null,
      message: err instanceof Error ? err.message : String(err),
    });
  }
});

// Boss command
app.post("/api/command", async (req, res) => {
  const { text } = req.body;
  if (!text) {
    res.status(400).json({ error: "text required" });
    return;
  }

  res.json({ status: "received" });

  try {
    await orchestrator.bossCommand(text);
  } catch (err) {
    broadcast({
      type: "error",
      agent: null,
      message: err instanceof Error ? err.message : String(err),
    });
  }
});

// Get current state
app.get("/api/state", (_req, res) => {
  res.json({
    agents: orchestrator.getAgentInfos(),
    tasks: orchestrator.getTasks(),
  });
});

// SPA catch-all (serve index.html for client-side routes)
app.get("*", (_req, res) => {
  res.sendFile(path.join(clientDir, "index.html"));
});

// --- Start ---

const PORT = parseInt(process.env.PORT || "3001");

server.listen(PORT, () => {
  console.log(`\n========================================`);
  console.log(`  AI Dev Agency Server`);
  console.log(`  http://localhost:${PORT}`);
  console.log(`  WebSocket: ws://localhost:${PORT}/ws`);
  console.log(`========================================\n`);
});

process.on("SIGINT", () => {
  orchestrator.shutdown();
  process.exit(0);
});
