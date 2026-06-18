"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Clock3, Monitor, MonitorSpeaker, WifiOff } from "lucide-react";
import { languages } from "@/lib/mock-data";
import { PanelHeader } from "@/components/shared/PanelHeader";
import { WaveIndicator } from "@/components/shared/WaveIndicator";
import type { TranslationSegment, WsServerEvent } from "@/lib/types";

type FontSize = "small" | "medium" | "large";
const FONT_SIZES: Record<FontSize, string> = {
  small: "1rem",
  medium: "1.25rem",
  large: "1.6rem",
};

// Map frontend language code → backend short code
const LANG_CODE_MAP: Record<string, string> = {
  "zh-CN": "zh",
  "en-US": "en",
  "ja-JP": "ja",
  "fr-FR": "fr",
  "es-ES": "es",
  "de-DE": "de",
  "ko-KR": "ko",
};

export default function CaptionPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id") ?? "";

  const [isConnected, setIsConnected] = useState(false);
  const [speaker, setSpeaker] = useState("—");
  const [segments, setSegments] = useState<TranslationSegment[]>([]);
  const [error, setError] = useState("");
  const [sessionEnded, setSessionEnded] = useState(false);

  // Display settings
  const [fontSize, setFontSize] = useState<FontSize>("medium");
  const [showSource, setShowSource] = useState(true);
  const [showTranslation, setShowTranslation] = useState(true);
  const [targetLang, setTargetLang] = useState("en-US");

  const wsRef = useRef<WebSocket | null>(null);
  const subtitleStyle = { fontSize: FONT_SIZES[fontSize] };
  const latestSegment = segments[0];

  // Send a JSON command over the caption WS
  const sendCommand = (cmd: Record<string, string>) => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(cmd));
    }
  };

  const handleTargetLangChange = (frontendCode: string) => {
    setTargetLang(frontendCode);
    // Clear stale segments — they were translated in the old language
    setSegments([]);
    const backendLang = LANG_CODE_MAP[frontendCode] ?? frontendCode;
    sendCommand({ action: "set_target_lang", target_lang: backendLang });
  };

  useEffect(() => {
    if (!sessionId) {
      setError("缺少 session_id 参数，请通过主控页面的二维码访问此页面。");
      return;
    }

    const baseUrl = process.env.NEXT_PUBLIC_WS_BASE_URL ?? "ws://localhost:8000";
    const ws = new WebSocket(`${baseUrl}/ws/caption/${sessionId}`);
    wsRef.current = ws;

    ws.addEventListener("open", () => {
      setIsConnected(true);
      setError("");
    });

    ws.addEventListener("close", () => {
      setIsConnected(false);
    });

    ws.addEventListener("error", () => {
      setError(`无法连接到字幕服务，请确认主控设备已开启会议。`);
      setIsConnected(false);
    });

    ws.addEventListener("message", (event) => {
      if (typeof event.data !== "string") return;
      try {
        const msg = JSON.parse(event.data) as WsServerEvent;
        switch (msg.type) {
          case "session_start":
            setSpeaker(msg.speaker);
            setIsConnected(true);
            break;
          case "translation":
            setSegments((prev) => [
              {
                segmentId: msg.segment_id,
                speaker: msg.speaker,
                source: msg.source,
                translation: msg.translation,
                marqueeText: msg.marquee_text,
              },
              ...prev.slice(0, 49),
            ]);
            setSpeaker(msg.speaker);
            break;
          case "speaker_changed":
            setSpeaker(msg.speaker);
            break;
          case "target_lang_changed":
            // Server confirmed the language switch; segments already cleared on send
            break;
          case "session_end":
            setIsConnected(false);
            setSessionEnded(true);
            break;
          case "error":
            setError(msg.message);
            setIsConnected(false);
            break;
        }
      } catch {
        // ignore malformed
      }
    });

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [sessionId]);

  const targetLangLabel = languages.find((l) => l.code === targetLang)?.nativeLabel ?? "English";

  return (
    <main className="app-shell">
      <div className="page-grid two-col">
        <section className="panel caption-left">
          <PanelHeader
            title="PC 字幕查看页"
            subtitle="参会者通过局域网访问主机，查看实时字幕"
            action={
              <span className={`status-pill ${isConnected ? "blue" : "gray"}`}>
                {isConnected ? "已连接" : sessionEnded ? "会议已结束" : "未连接"}
              </span>
            }
          />

          {/* Status / error banners */}
          {error && (
            <div
              style={{
                padding: "1rem",
                background: "#ff000020",
                color: "#ff4444",
                borderRadius: "8px",
                marginBottom: "1rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <WifiOff size={16} /> {error}
            </div>
          )}

          {sessionEnded && !error && (
            <div
              style={{
                padding: "1rem",
                background: "#f5f5f5",
                borderRadius: "8px",
                marginBottom: "1rem",
                color: "#666",
              }}
            >
              会议已结束，共 {segments.length} 条字幕记录。
            </div>
          )}

          {!sessionId && !error && (
            <div
              style={{
                padding: "1rem",
                background: "#fff3cd",
                borderRadius: "8px",
                marginBottom: "1rem",
                color: "#856404",
              }}
            >
              请通过主控页面的二维码扫码进入此页面。
            </div>
          )}

          <div className="caption-status-grid">
            <div className="panel-soft caption-info">
              <div>
                <p className="eyebrow">会话 ID</p>
                <strong>{sessionId || "—"}</strong>
              </div>
              <div>
                <p className="eyebrow">当前发言人</p>
                <strong>{speaker}</strong>
              </div>
            </div>

            <div className="panel-soft caption-info">
              <div className="caption-chip">
                {isConnected ? <CheckCircle2 size={18} /> : <WifiOff size={18} />}
                {isConnected ? "实时字幕同步中" : "等待连接..."}
              </div>
              <div className="caption-chip">
                <Clock3 size={18} /> 共 {segments.length} 条记录
              </div>
              <div className="caption-chip">
                <MonitorSpeaker size={18} /> 译文语言：{targetLangLabel}
              </div>
            </div>
          </div>

          {/* Live subtitles */}
          <div className="subtitle-stack">
            {segments.length === 0 && isConnected && (
              <article className="subtitle-card">
                {showSource && (
                  <>
                    <p className="subtitle-label">原文</p>
                    <p className="subtitle-content" style={subtitleStyle}>
                      等待语音输入...
                    </p>
                    <WaveIndicator intensity="low" />
                  </>
                )}
                {showTranslation && (
                  <>
                    <p className="subtitle-label">译文（{targetLangLabel}）</p>
                    <p className="subtitle-content subtitle-english" style={subtitleStyle}>
                      Waiting for speech input...
                    </p>
                    <WaveIndicator intensity="low" />
                  </>
                )}
              </article>
            )}

            {latestSegment && (
              <article className="subtitle-card">
                {showSource && (
                  <>
                    <p className="subtitle-label">原文 · {latestSegment.speaker}</p>
                    <p className="subtitle-content" style={subtitleStyle}>
                      {latestSegment.source}
                    </p>
                    <WaveIndicator intensity="high" />
                  </>
                )}
                {showTranslation && (
                  <>
                    <p className="subtitle-label">译文（{targetLangLabel}）</p>
                    <p className="subtitle-content subtitle-english" style={subtitleStyle}>
                      {latestSegment.translation}
                    </p>
                    <WaveIndicator intensity="low" />
                  </>
                )}
              </article>
            )}
          </div>

          {/* History */}
          {segments.length > 1 && (
            <details style={{ marginTop: "2rem" }}>
              <summary
                style={{
                  cursor: "pointer",
                  padding: "0.5rem",
                  background: "#f5f5f5",
                  borderRadius: "4px",
                }}
              >
                历史记录（{segments.length - 1} 条）
              </summary>
              <div style={{ marginTop: "1rem", maxHeight: "300px", overflow: "auto" }}>
                {segments.slice(1).map((seg) => (
                  <div
                    key={seg.segmentId}
                    style={{ padding: "0.5rem", borderBottom: "1px solid #eee", fontSize: "0.9rem" }}
                  >
                    {showSource && (
                      <div>
                        <strong>原文:</strong> {seg.source}
                      </div>
                    )}
                    {showTranslation && (
                      <div style={{ color: "#666", marginTop: "0.25rem" }}>
                        <strong>译文:</strong> {seg.translation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </details>
          )}
        </section>

        <aside className="sidebar-stack">
          <section className="panel caption-settings">
            <PanelHeader title="字幕设置" subtitle="用户偏好可本地保存" />

            <label className="setting-row">
              <span>目标语言</span>
              <select
                className="select-field"
                value={targetLang}
                onChange={(e) => handleTargetLangChange(e.target.value)}
              >
                {languages.map((language) => (
                  <option key={language.code} value={language.code}>
                    {language.nativeLabel}
                  </option>
                ))}
              </select>
            </label>

            <div className="setting-row">
              <span>显示原文</span>
              <button
                className={`switch ${showSource ? "on" : ""}`}
                type="button"
                aria-label="显示原文"
                onClick={() => setShowSource((v) => !v)}
              />
            </div>
            <div className="setting-row">
              <span>显示译文</span>
              <button
                className={`switch ${showTranslation ? "on" : ""}`}
                type="button"
                aria-label="显示译文"
                onClick={() => setShowTranslation((v) => !v)}
              />
            </div>
            <div className="setting-row">
              <span>字体大小</span>
              <div className="font-size-group">
                <button
                  className={`secondary-button ${fontSize === "small" ? "active" : ""}`}
                  type="button"
                  onClick={() => setFontSize("small")}
                >
                  A-
                </button>
                <button
                  className={`secondary-button ${fontSize === "medium" ? "active" : ""}`}
                  type="button"
                  onClick={() => setFontSize("medium")}
                >
                  中
                </button>
                <button
                  className={`secondary-button ${fontSize === "large" ? "active" : ""}`}
                  type="button"
                  onClick={() => setFontSize("large")}
                >
                  A+
                </button>
              </div>
            </div>
          </section>

          <section className="panel caption-settings">
            <PanelHeader title="访问状态" subtitle="只读字幕订阅模式" />
            <div className="caption-chip">
              <Monitor size={18} /> 适配浏览器访问
            </div>
            <div className="caption-chip">
              <CheckCircle2 size={18} /> 支持 WebSocket 实时字幕
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}
