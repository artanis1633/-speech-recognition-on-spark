import type { LanguageCode, RealtimeEvent } from "@/lib/types";

export interface RealtimeClientOptions {
  meetingId: string;
  clientType: "host" | "caption";
  onEvent: (event: RealtimeEvent) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: () => void;
}

export interface RealtimeClient {
  connect: () => void;
  disconnect: () => void;
  sendControl: (type: string, payload?: Record<string, unknown>) => void;
  sendLanguageChange: (targetLang: LanguageCode) => void;
}

export function createRealtimeClient(options: RealtimeClientOptions): RealtimeClient {
  let socket: WebSocket | null = null;
  const baseUrl = process.env.NEXT_PUBLIC_WS_BASE_URL ?? "ws://localhost:8000";

  function sendControl(type: string, payload: Record<string, unknown> = {}) {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      return;
    }

    socket.send(
      JSON.stringify({
        type,
        meetingId: options.meetingId,
        timestamp: new Date().toISOString(),
        payload
      })
    );
  }

  return {
    connect() {
      socket = new WebSocket(
        `${baseUrl}/ws/audio?meetingId=${options.meetingId}&clientType=${options.clientType}`
      );

      socket.addEventListener("open", () => options.onOpen?.());
      socket.addEventListener("close", () => options.onClose?.());
      socket.addEventListener("error", () => options.onError?.());
      socket.addEventListener("message", (message) => {
        if (typeof message.data !== "string") {
          return;
        }

        options.onEvent(JSON.parse(message.data) as RealtimeEvent);
      });
    },
    disconnect() {
      socket?.close();
      socket = null;
    },
    sendControl,
    sendLanguageChange(targetLang) {
      sendControl("client_language_changed", { targetLang });
    }
  };
}
