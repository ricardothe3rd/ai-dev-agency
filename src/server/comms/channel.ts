import type { AgentRole, WSEvent } from "../types.js";

type MessageHandler = (from: AgentRole, message: string) => Promise<string>;

export class MessageBus {
  private handlers = new Map<AgentRole, MessageHandler>();
  private emit: (event: WSEvent) => void;
  private messageQueue: Array<{
    from: AgentRole;
    to: AgentRole;
    message: string;
  }> = [];
  private processing = false;

  constructor(emit: (event: WSEvent) => void) {
    this.emit = emit;
  }

  register(role: AgentRole, handler: MessageHandler) {
    this.handlers.set(role, handler);
  }

  async send(from: AgentRole, to: AgentRole, message: string): Promise<string> {
    this.emit({ type: "message", from, to, text: message });

    this.messageQueue.push({ from, to, message });

    if (!this.processing) {
      return this.processQueue();
    }

    return "Message queued.";
  }

  async broadcast(from: AgentRole, message: string) {
    this.emit({ type: "message", from, to: "all", text: message });

    const responses: string[] = [];
    for (const [role, handler] of this.handlers) {
      if (role !== from) {
        const resp = await handler(from, message);
        responses.push(`[${role}]: ${resp}`);
      }
    }
    return responses.join("\n\n");
  }

  private async processQueue(): Promise<string> {
    this.processing = true;
    let lastResponse = "";

    while (this.messageQueue.length > 0) {
      const msg = this.messageQueue.shift()!;
      const handler = this.handlers.get(msg.to);
      if (handler) {
        lastResponse = await handler(msg.from, msg.message);
      }
    }

    this.processing = false;
    return lastResponse;
  }
}
