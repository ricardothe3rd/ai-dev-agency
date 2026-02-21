import { app, BrowserWindow, shell } from "electron";
import path from "node:path";
import { fork, type ChildProcess } from "node:child_process";

let mainWindow: BrowserWindow | null = null;
let serverProcess: ChildProcess | null = null;

const isDev = process.env.NODE_ENV === "development";
const SERVER_PORT = 3001;

function startServer() {
  const serverEntry = path.join(__dirname, "../dist/server/index.js");
  serverProcess = fork(serverEntry, [], {
    env: {
      ...process.env,
      PORT: String(SERVER_PORT),
    },
    silent: true,
  });

  serverProcess.stdout?.on("data", (data) => {
    console.log(`[server] ${data.toString().trim()}`);
  });

  serverProcess.stderr?.on("data", (data) => {
    console.error(`[server] ${data.toString().trim()}`);
  });

  serverProcess.on("exit", (code) => {
    console.log(`[server] Exited with code ${code}`);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    title: "AI Dev Agency",
    titleBarStyle: "hiddenInset",
    backgroundColor: "#060612",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (isDev) {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools({ mode: "detach" });
  } else {
    // In production, load from the built files via the local server
    mainWindow.loadURL(`http://localhost:${SERVER_PORT}`);
  }

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  if (!isDev) {
    startServer();
    // Give server a moment to start
    setTimeout(createWindow, 1500);
  } else {
    createWindow();
  }

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (serverProcess) {
    serverProcess.kill();
  }
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  if (serverProcess) {
    serverProcess.kill();
  }
});
