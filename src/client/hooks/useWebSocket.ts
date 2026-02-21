import { useEffect, useRef, useCallback } from "react";
import { useAgentStore } from "./useAgentState";

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const { addEvent, setAgents, setTasks, setConnected } = useAgentStore();

  const connect = useCallback(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws`);

    ws.onopen = () => {
      console.log("[WS] Connected");
      setConnected(true);
    };

    ws.onmessage = (e) => {
      const event = JSON.parse(e.data);

      if (event.type === "init") {
        setAgents(event.agents);
        setTasks(event.tasks);
        return;
      }

      addEvent(event);
    };

    ws.onclose = () => {
      console.log("[WS] Disconnected, retrying in 2s...");
      setConnected(false);
      setTimeout(connect, 2000);
    };

    ws.onerror = () => ws.close();
    wsRef.current = ws;
  }, [addEvent, setAgents, setTasks, setConnected]);

  useEffect(() => {
    connect();
    return () => wsRef.current?.close();
  }, [connect]);
}
