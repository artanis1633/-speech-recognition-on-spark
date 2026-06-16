import type {
  DeviceHealth,
  LanguageOption,
  MeetingSession,
  MeetingSummary,
  SubtitleSegment,
  TermEntry
} from "@/lib/types";

export const languages: LanguageOption[] = [
  { code: "zh-CN", label: "中文（自动识别）", nativeLabel: "中文" },
  { code: "en-US", label: "English（默认）", nativeLabel: "English" },
  { code: "ja-JP", label: "日本語", nativeLabel: "日本語" },
  { code: "fr-FR", label: "Francais", nativeLabel: "Francais" },
  { code: "es-ES", label: "Espanol", nativeLabel: "Espanol" },
  { code: "de-DE", label: "Deutsch", nativeLabel: "Deutsch" },
  { code: "ko-KR", label: "한국어", nativeLabel: "한국어" }
];

export const deviceHealth: DeviceHealth = {
  microphone: "normal",
  network: "connected",
  storageFreeGb: 128,
  currentTime: "10:30:25"
};

export const activeMeeting: MeetingSession = {
  meetingId: "mtg_20260616_001",
  title: "创新驱动发展 - 合作共赢未来",
  sourceLang: "zh-CN",
  targetLang: "en-US",
  startedAt: "2026-06-16T10:30:25+08:00",
  durationSeconds: 5025,
  connectedClients: 8,
  status: "live"
};

export const subtitleSegments: SubtitleSegment[] = [
  {
    id: "seg_001",
    meetingId: activeMeeting.meetingId,
    sourceText: "人工智能正在深刻改变各行各业，推动生产力的全面提升。",
    translatedText:
      "Artificial intelligence is profoundly transforming industries and driving comprehensive improvements in productivity.",
    sourceLang: "zh-CN",
    targetLang: "en-US",
    isFinal: true,
    latencyMs: 682,
    termHits: 2,
    timestamp: "2026-06-16T10:31:03+08:00"
  },
  {
    id: "seg_002",
    meetingId: activeMeeting.meetingId,
    sourceText: "我们相信，开放合作是实现共赢未来的必由之路。",
    translatedText:
      "We believe that open collaboration is the only way to achieve win-win results.",
    sourceLang: "zh-CN",
    targetLang: "en-US",
    isFinal: true,
    latencyMs: 615,
    termHits: 1,
    timestamp: "2026-06-16T10:32:12+08:00"
  },
  {
    id: "seg_003",
    meetingId: activeMeeting.meetingId,
    sourceText: "本地化部署可以确保会议数据不出私有网络。",
    translatedText:
      "Local deployment ensures that meeting data never leaves the private network.",
    sourceLang: "zh-CN",
    targetLang: "en-US",
    isFinal: true,
    latencyMs: 704,
    termHits: 2,
    timestamp: "2026-06-16T10:33:20+08:00"
  }
];

export const terms: TermEntry[] = [
  {
    id: "term_001",
    sourceTerm: "人工智能",
    targetTerm: "Artificial Intelligence",
    code: "AI",
    category: "技术类",
    status: "enabled",
    updatedAt: "2026-06-16T10:00:00+08:00"
  },
  {
    id: "term_002",
    sourceTerm: "机器学习",
    targetTerm: "Machine Learning",
    code: "ML",
    category: "技术类",
    status: "enabled",
    updatedAt: "2026-06-16T10:01:00+08:00"
  },
  {
    id: "term_003",
    sourceTerm: "深度学习",
    targetTerm: "Deep Learning",
    code: "DL",
    category: "技术类",
    status: "enabled",
    updatedAt: "2026-06-16T10:02:00+08:00"
  },
  {
    id: "term_004",
    sourceTerm: "云计算",
    targetTerm: "Cloud Computing",
    category: "技术类",
    status: "enabled",
    updatedAt: "2026-06-16T10:03:00+08:00"
  },
  {
    id: "term_005",
    sourceTerm: "物联网",
    targetTerm: "Internet of Things",
    code: "IoT",
    category: "技术类",
    status: "enabled",
    updatedAt: "2026-06-16T10:04:00+08:00"
  },
  {
    id: "term_006",
    sourceTerm: "区块链",
    targetTerm: "Blockchain",
    category: "技术类",
    status: "enabled",
    updatedAt: "2026-06-16T10:05:00+08:00"
  }
];

export const meetingSummary: MeetingSummary = {
  meetingId: activeMeeting.meetingId,
  title: activeMeeting.title,
  startedAt: "2026-06-16T10:30:00+08:00",
  endedAt: "2026-06-16T11:03:45+08:00",
  durationSeconds: 2025,
  sourceLang: "zh-CN",
  targetLang: "en-US",
  sourceWordCount: 2568,
  translatedWordCount: 2542,
  termHitCount: 316,
  previewSegments: subtitleSegments
};
