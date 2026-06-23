/**
 * WebSocket client aligned with spark-trams-agent /ws/audio endpoint.
 *
 * Protocol:
 *   Client → Server:
 *     - JSON: { action: "start", speaker?: "..." }
 *     - Binary: raw PCM frames (16-bit LE, mono, 16kHz)
 *     - JSON: { action: "set_speaker", speaker: "..." }
 *     - JSON: { action: "stop" }
 *   Server → Client:
 *     - JSON WsServerEvent messages
 */

import type { WsClientCommand, WsServerEvent } from "@/lib/types";

export interface RealtimeClientOptions {
  /** Initial speaker label, defaults to "发言人 1" */
  speaker?: string;
  /** Target language code for translation */
  targetLang?: string;
  /** Called for every server event */
  onEvent: (event: WsServerEvent) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (err: Event) => void;
}

export interface RealtimeClient {
  /** Open WebSocket connection */
  connect: () => void;
  /** Close connection gracefully (sends "stop" action first) */
  disconnect: () => void;
  /** Send a JSON control command */
  sendCommand: (cmd: WsClientCommand) => void;
  /** Send raw PCM audio bytes */
  sendAudio: (pcm: ArrayBuffer | Uint8Array) => void;
  /** Switch speaker (flushes pending audio under previous speaker) */
  setSpeaker: (speaker: string) => void;
  /** Switch target language */
  setTargetLang: (lang: string) => void;
  /** Check if connected */
  isConnected: () => boolean;
}

export function createRealtimeClient(options: RealtimeClientOptions): RealtimeClient {
  let socket: WebSocket | null = null;
  let closeTimer: ReturnType<typeof setTimeout> | null = null;
  const baseUrl = process.env.NEXT_PUBLIC_WS_BASE_URL ?? "ws://localhost:8000";

  function sendCommand(cmd: WsClientCommand) {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      return;
    }
    socket.send(JSON.stringify(cmd));
  }

  function sendAudio(pcm: ArrayBuffer | Uint8Array) {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      return;
    }
    socket.send(pcm);
  }

  function forceClose() {
    if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
    socket?.close();
    socket = null;
  }

  return {
    connect() {
      socket = new WebSocket(`${baseUrl}/ws/audio`);
      socket.binaryType = "arraybuffer";

      socket.addEventListener("open", () => {
        sendCommand({
          action: "start",
          speaker: options.speaker ?? "发言人 1",
          target_lang: options.targetLang,
        });
        options.onOpen?.();
      });

      socket.addEventListener("close", () => {
        options.onClose?.();
      });

      socket.addEventListener("error", (e) => {
        options.onError?.(e);
      });

      socket.addEventListener("message", (event) => {
        if (typeof event.data !== "string") {
          return;
        }
        try {
          const parsed = JSON.parse(event.data) as WsServerEvent;
          options.onEvent(parsed);
          // Close immediately once session_end arrives — no need to wait for timeout
          if (parsed.type === "session_end") {
            forceClose();
          }
        } catch {
          // Ignore malformed messages
        }
      });
    },

    disconnect() {
      if (socket && socket.readyState === WebSocket.OPEN) {
        sendCommand({ action: "stop" });
        // Keep socket open so the server can finish the pipeline flush
        // (ASR + translation can take several seconds after "stop").
        // Force-close after 30 s as a safety net.
        closeTimer = setTimeout(forceClose, 30000);
      } else {
        forceClose();
      }
    },

    sendCommand,
    sendAudio,

    setSpeaker(speaker: string) {
      sendCommand({ action: "set_speaker", speaker });
    },

    setTargetLang(lang: string) {
      sendCommand({ action: "set_target_lang", target_lang: lang });
    },

    isConnected() {
      return socket?.readyState === WebSocket.OPEN;
    },
  };
}
