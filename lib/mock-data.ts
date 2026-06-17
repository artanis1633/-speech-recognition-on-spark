import type {
  DeviceHealth,
  GlossaryEntry,
  GlossaryState,
  LanguageOption,
  SessionInfo,
  TranslationSegment,
} from "@/lib/types";

export const languages: LanguageOption[] = [
  { code: "zh-CN", label: "中文（自动识别）", nativeLabel: "中文" },
  { code: "en-US", label: "English（默认）", nativeLabel: "English" },
  { code: "ja-JP", label: "日本語", nativeLabel: "日本語" },
  { code: "fr-FR", label: "Français", nativeLabel: "Français" },
  { code: "es-ES", label: "Español", nativeLabel: "Español" },
  { code: "de-DE", label: "Deutsch", nativeLabel: "Deutsch" },
  { code: "ko-KR", label: "한국어", nativeLabel: "한국어" },
];

export const deviceHealth: DeviceHealth = {
  microphone: "normal",
  network: "connected",
  storageFreeGb: 128,
  currentTime: "10:30:25",
};

export const activeSession: SessionInfo = {
  sessionId: "a1b2c3d4",
  speaker: "发言人 1",
  startedAt: "2026-06-16T10:30:25+08:00",
  status: "live",
};

export const translationSegments: TranslationSegment[] = [
  {
    segmentId: "seg_001",
    speaker: "发言人 1",
    source: "人工智能正在深刻改变各行各业，推动生产力的全面提升。",
    translation:
      "Artificial intelligence is profoundly transforming industries and driving comprehensive improvements in productivity.",
    marqueeText:
      "Artificial intelligence is profoundly transforming industries and driving comprehensive improvements in productivity.",
  },
  {
    segmentId: "seg_002",
    speaker: "发言人 1",
    source: "我们相信，开放合作是实现共赢未来的必由之路。",
    translation:
      "We believe that open collaboration is the only way to achieve win-win results.",
    marqueeText:
      "Artificial intelligence is profoundly transforming industries... We believe that open collaboration is the only way to achieve win-win results.",
  },
  {
    segmentId: "seg_003",
    speaker: "发言人 2",
    source: "本地化部署可以确保会议数据不出私有网络。",
    translation:
      "Local deployment ensures that meeting data never leaves the private network.",
    marqueeText:
      "We believe that open collaboration is the only way to achieve win-win results. Local deployment ensures that meeting data never leaves the private network.",
  },
];

export const glossaryEntries: GlossaryEntry[] = [
  {
    id: "a1b2c3d4e5f6",
    zh: "人工智能",
    en: "Artificial Intelligence",
    abbr: "AI",
    category: "技术",
    enabled: true,
    created_at: "2026-06-16T10:00:00+08:00",
    updated_at: "2026-06-16T10:00:00+08:00",
    import_batch: null,
  },
  {
    id: "b2c3d4e5f6a1",
    zh: "机器学习",
    en: "Machine Learning",
    abbr: "ML",
    category: "技术",
    enabled: true,
    created_at: "2026-06-16T10:01:00+08:00",
    updated_at: "2026-06-16T10:01:00+08:00",
    import_batch: null,
  },
  {
    id: "c3d4e5f6a1b2",
    zh: "深度学习",
    en: "Deep Learning",
    abbr: "DL",
    category: "技术",
    enabled: true,
    created_at: "2026-06-16T10:02:00+08:00",
    updated_at: "2026-06-16T10:02:00+08:00",
    import_batch: null,
  },
  {
    id: "d4e5f6a1b2c3",
    zh: "云计算",
    en: "Cloud Computing",
    abbr: null,
    category: "技术",
    enabled: true,
    created_at: "2026-06-16T10:03:00+08:00",
    updated_at: "2026-06-16T10:03:00+08:00",
    import_batch: null,
  },
  {
    id: "e5f6a1b2c3d4",
    zh: "物联网",
    en: "Internet of Things",
    abbr: "IoT",
    category: "技术",
    enabled: true,
    created_at: "2026-06-16T10:04:00+08:00",
    updated_at: "2026-06-16T10:04:00+08:00",
    import_batch: null,
  },
  {
    id: "f6a1b2c3d4e5",
    zh: "区块链",
    en: "Blockchain",
    abbr: null,
    category: "技术",
    enabled: false,
    created_at: "2026-06-16T10:05:00+08:00",
    updated_at: "2026-06-16T10:05:00+08:00",
    import_batch: null,
  },
];

export const glossaryState: GlossaryState = {
  total: 256,
  enabled: 248,
  disabled: 8,
  global_enabled: true,
  last_import_at: "2026-05-20T08:00:00+08:00",
  last_import_source: "CSV",
  embedding_model: "Qwen/Qwen3-Embedding-0.6B",
  embed_dim: 1024,
};
