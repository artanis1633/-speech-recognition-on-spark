/**
 * Types aligned with spark-trams-agent backend API.
 * See: docs/api.md
 */

// --- Language ---

/** Backend only supports zh ↔ en; UI keeps broader list as placeholder */
export type LanguageCode =
  | "zh-CN"
  | "en-US"
  | "ja-JP"
  | "fr-FR"
  | "es-ES"
  | "de-DE"
  | "ko-KR";

/** Backend detection result: "zh" | "en" */
export type BackendLangCode = "zh" | "en";

export type DeviceStatus = "normal" | "connected" | "warning" | "error" | "disabled";

export interface LanguageOption {
  code: LanguageCode;
  label: string;
  nativeLabel: string;
}

export interface DeviceHealth {
  microphone: DeviceStatus;
  network: DeviceStatus;
  storageFreeGb: number;
  currentTime: string;
}

// --- Session (lightweight, derived from WS events) ---

export interface SessionInfo {
  sessionId: string;
  speaker: string;
  startedAt: string;
  status: "idle" | "live" | "ended";
}

// --- Subtitle / Translation segment ---

export interface TranslationSegment {
  segmentId: string;
  speaker: string;
  source: string;
  translation: string;
  marqueeText: string;
}

// --- Glossary (术语库) ---

export interface GlossaryEntry {
  id: string;
  zh: string;
  en: string;
  abbr: string | null;
  category: string;
  enabled: boolean;
  created_at: string;
  updated_at: string;
  import_batch: string | null;
}

export interface GlossaryState {
  total: number;
  enabled: number;
  disabled: number;
  global_enabled: boolean;
  last_import_at: string | null;
  last_import_source: string | null;
  embedding_model: string;
  embed_dim: number | null;
}

export interface GlossaryImportResult {
  imported: number;
  skipped_duplicate: number;
  errors: Array<{ row: number; error: string }>;
  batch_id: string | null;
}

// --- Prompts ---

export interface PromptItem {
  key: string;
  label: string;
  content: string;
  default: string;
  is_default: boolean;
  updated_at: string | null;
}

// --- Export ---
// Export is a direct Markdown file download via GET /api/export/{session_id}
// No JSON model needed; the client triggers a browser download.

// --- WebSocket events (server → client) ---

export interface WsSessionStart {
  type: "session_start";
  session_id: string;
  speaker: string;
}

export interface WsAsrResult {
  type: "asr_result";
  text: string;
  language: BackendLangCode;
}

export interface WsTranslation {
  type: "translation";
  speaker: string;
  source: string;
  translation: string;
  marquee_text: string;
  segment_id: string;
}

export interface WsSpeakerChanged {
  type: "speaker_changed";
  speaker: string;
}

export interface WsSessionEnd {
  type: "session_end";
  session_id: string;
  download_url: string;
  total_segments: number;
}

export interface WsError {
  type: "error";
  message: string;
}

export type WsServerEvent =
  | WsSessionStart
  | WsAsrResult
  | WsTranslation
  | WsSpeakerChanged
  | WsSessionEnd
  | WsError;

// --- WebSocket commands (client → server) ---

export interface WsStartCommand {
  action: "start";
  speaker?: string;
  target_lang?: string;
}

export interface WsSetSpeakerCommand {
  action: "set_speaker";
  speaker: string;
}

export interface WsSetTargetLangCommand {
  action: "set_target_lang";
  target_lang: string;
}

export interface WsStopCommand {
  action: "stop";
}

export type WsClientCommand = WsStartCommand | WsSetSpeakerCommand | WsSetTargetLangCommand | WsStopCommand;
