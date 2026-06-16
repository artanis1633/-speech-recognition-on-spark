export type LanguageCode =
  | "zh-CN"
  | "en-US"
  | "ja-JP"
  | "fr-FR"
  | "es-ES"
  | "de-DE"
  | "ko-KR";

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

export interface MeetingSession {
  meetingId: string;
  title: string;
  sourceLang: LanguageCode;
  targetLang: LanguageCode;
  startedAt: string;
  endedAt?: string;
  durationSeconds: number;
  connectedClients: number;
  status: "idle" | "live" | "ended";
}

export interface SubtitleSegment {
  id: string;
  meetingId: string;
  sourceText: string;
  translatedText: string;
  sourceLang: LanguageCode;
  targetLang: LanguageCode;
  isFinal: boolean;
  latencyMs?: number;
  termHits?: number;
  timestamp: string;
}

export interface TermEntry {
  id: string;
  sourceTerm: string;
  targetTerm: string;
  code?: string;
  category: string;
  status: "enabled" | "disabled";
  updatedAt: string;
}

export interface MeetingSummary {
  meetingId: string;
  title: string;
  startedAt: string;
  endedAt: string;
  durationSeconds: number;
  sourceLang: LanguageCode;
  targetLang: LanguageCode;
  sourceWordCount: number;
  translatedWordCount: number;
  termHitCount: number;
  previewSegments: SubtitleSegment[];
}

export interface ExportTask {
  exportId: string;
  meetingId: string;
  format: "word" | "pdf";
  status: "pending" | "processing" | "completed" | "failed";
  downloadUrl?: string;
  message?: string;
}

export type RealtimeEvent =
  | {
      type: "session_started";
      meetingId: string;
      timestamp: string;
      payload: Pick<MeetingSession, "title" | "sourceLang" | "targetLang">;
    }
  | {
      type: "transcript_partial";
      meetingId: string;
      timestamp: string;
      payload: {
        segmentId: string;
        sourceText: string;
        sourceLang: LanguageCode;
        isFinal: false;
        latencyMs: number;
      };
    }
  | {
      type: "translation_final";
      meetingId: string;
      timestamp: string;
      payload: {
        segmentId: string;
        sourceText: string;
        translatedText: string;
        sourceLang: LanguageCode;
        targetLang: LanguageCode;
        isFinal: true;
        latencyMs: number;
        termHits: number;
      };
    }
  | {
      type: "client_count_changed";
      meetingId: string;
      timestamp: string;
      payload: {
        connectedClients: number;
      };
    }
  | {
      type: "session_ended";
      meetingId: string;
      timestamp: string;
      payload: {
        summaryUrl: string;
      };
    }
  | {
      type: "error";
      meetingId: string;
      timestamp: string;
      payload: {
        code: string;
        message: string;
      };
    };
