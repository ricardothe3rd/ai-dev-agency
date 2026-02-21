import Database from "better-sqlite3";
import path from "node:path";
import type { AgentRole, Task, Memory } from "../types.js";

export class MemoryStore {
  private db: Database.Database;

  constructor(dbPath?: string) {
    const resolvedPath = dbPath || path.join(process.cwd(), "agency.db");
    this.db = new Database(resolvedPath);
    this.init();
  }

  private init() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        assignee TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        priority INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        dependencies TEXT DEFAULT '[]',
        files TEXT DEFAULT '[]'
      );

      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        from_agent TEXT NOT NULL,
        to_agent TEXT NOT NULL,
        content TEXT NOT NULL,
        timestamp TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS memories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        agent TEXT NOT NULL,
        content TEXT NOT NULL,
        importance INTEGER NOT NULL DEFAULT 5,
        timestamp TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'observation'
      );

      CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        brief TEXT NOT NULL,
        output_path TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        created_at TEXT NOT NULL
      );
    `);
  }

  // --- Tasks ---

  createTask(task: Task): Task {
    const stmt = this.db.prepare(`
      INSERT INTO tasks (id, title, description, assignee, status, priority, created_at, updated_at, dependencies, files)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      task.id,
      task.title,
      task.description,
      task.assignee,
      task.status,
      task.priority,
      task.createdAt,
      task.updatedAt,
      JSON.stringify(task.dependencies),
      JSON.stringify(task.files)
    );
    return task;
  }

  updateTask(id: string, updates: Partial<Task>): Task | null {
    const existing = this.getTask(id);
    if (!existing) return null;

    const merged = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    const stmt = this.db.prepare(`
      UPDATE tasks SET title=?, description=?, assignee=?, status=?, priority=?,
        updated_at=?, dependencies=?, files=?
      WHERE id=?
    `);
    stmt.run(
      merged.title,
      merged.description,
      merged.assignee,
      merged.status,
      merged.priority,
      merged.updatedAt,
      JSON.stringify(merged.dependencies),
      JSON.stringify(merged.files),
      id
    );
    return merged;
  }

  getTask(id: string): Task | null {
    const row = this.db.prepare("SELECT * FROM tasks WHERE id=?").get(id) as
      | Record<string, unknown>
      | undefined;
    if (!row) return null;
    return this.rowToTask(row);
  }

  getAllTasks(): Task[] {
    const rows = this.db.prepare("SELECT * FROM tasks ORDER BY priority DESC").all() as Record<string, unknown>[];
    return rows.map((r) => this.rowToTask(r));
  }

  getTasksByAssignee(assignee: AgentRole): Task[] {
    const rows = this.db
      .prepare("SELECT * FROM tasks WHERE assignee=? ORDER BY priority DESC")
      .all(assignee) as Record<string, unknown>[];
    return rows.map((r) => this.rowToTask(r));
  }

  clearTasks() {
    this.db.exec("DELETE FROM tasks");
  }

  private rowToTask(row: Record<string, unknown>): Task {
    return {
      id: row.id as string,
      title: row.title as string,
      description: row.description as string,
      assignee: (row.assignee as AgentRole) || null,
      status: row.status as Task["status"],
      priority: row.priority as number,
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
      dependencies: JSON.parse((row.dependencies as string) || "[]"),
      files: JSON.parse((row.files as string) || "[]"),
    };
  }

  // --- Messages ---

  saveMessage(from: AgentRole, to: string, content: string) {
    this.db
      .prepare("INSERT INTO messages (from_agent, to_agent, content, timestamp) VALUES (?,?,?,?)")
      .run(from, to, content, new Date().toISOString());
  }

  getMessages(limit = 50): Array<{ from: string; to: string; content: string; timestamp: string }> {
    return this.db
      .prepare("SELECT from_agent as 'from', to_agent as 'to', content, timestamp FROM messages ORDER BY id DESC LIMIT ?")
      .all(limit) as Array<{ from: string; to: string; content: string; timestamp: string }>;
  }

  // --- Memory ---

  addMemory(agent: AgentRole, content: string, importance: number, type: Memory["type"] = "observation") {
    this.db
      .prepare("INSERT INTO memories (agent, content, importance, timestamp, type) VALUES (?,?,?,?,?)")
      .run(agent, content, importance, new Date().toISOString(), type);
  }

  getMemories(agent: AgentRole, limit = 20): Memory[] {
    return this.db
      .prepare(
        "SELECT * FROM memories WHERE agent=? ORDER BY importance DESC, id DESC LIMIT ?"
      )
      .all(agent, limit) as Memory[];
  }

  // --- Projects ---

  createProject(name: string, brief: string, outputPath: string) {
    this.db
      .prepare("INSERT INTO projects (name, brief, output_path, status, created_at) VALUES (?,?,?,?,?)")
      .run(name, brief, outputPath, "active", new Date().toISOString());
  }

  close() {
    this.db.close();
  }
}
