import { getWsUrl } from "./api";

class RealtimeWebSocketService {
  constructor() {
    this.ws = null;
    this.channel = "all";
    this.listeners = new Map(); // event -> Set of callbacks
    this.reconnectTimer = null;
    this.heartbeatTimer = null;
    this.reconnectDelay = 2000;
    this.isConnected = false;
  }

  connect(channel = "all") {
    this.channel = channel;
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    try {
      const url = getWsUrl(channel);
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        this.isConnected = true;
        this.reconnectDelay = 2000;
        this.emit("connection_status", { status: "connected", channel: this.channel });
        this.startHeartbeat();
      };

      this.ws.onmessage = (event) => {
        try {
          if (event.data === "pong") return;
          const payload = JSON.parse(event.data);
          if (payload.event) {
            this.emit(payload.event, payload.data);
            this.emit("*", payload);
          }
        } catch (err) {
          console.warn("[WS] Error parsing websocket message:", err);
        }
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        this.stopHeartbeat();
        this.emit("connection_status", { status: "disconnected", channel: this.channel });
        this.scheduleReconnect();
      };

      this.ws.onerror = (error) => {
        console.warn("[WS] WebSocket error:", error);
        this.ws?.close();
      };
    } catch (e) {
      console.warn("[WS] Failed to initialize WebSocket:", e);
      this.scheduleReconnect();
    }
  }

  scheduleReconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = setTimeout(() => {
      this.reconnectDelay = Math.min(this.reconnectDelay * 1.5, 15000);
      this.connect(this.channel);
    }, this.reconnectDelay);
  }

  startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send("ping");
      }
    }, 25000);
  }

  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach((cb) => {
        try {
          cb(data);
        } catch (err) {
          console.error(`[WS] Error in listener callback for ${event}:`, err);
        }
      });
    }
  }

  disconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
  }
}

export const realtimeWS = new RealtimeWebSocketService();
