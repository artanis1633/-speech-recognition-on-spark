"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Clock3, Mic, MicOff, Power, Settings } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { languages } from "@/lib/mock-data";
import { PanelHeader } from "@/components/shared/PanelHeader";
import { VideoStage } from "@/components/shared/VideoStage";
import { WaveIndicator } from "@/components/shared/WaveIndicator";
import { MicrophoneLevelIcon, WifiSignalIcon } from "@/components/shared/DynamicStatusIcon";
import { createRealtimeClient } from "@/lib/websocket/realtime";
import type { RealtimeClient } from "@/lib/websocket/realtime";
import type { TranslationSegment, WsServerEvent } from "@/lib/types";

type FontSize = "small" | "medium" | "large";
const FONT_SIZES: Record<FontSize, string> = { small: "1rem", medium: "1.25rem", large: "1.6rem" };

export default function LiveMeetingPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const [speaker, setSpeaker] = useState("发言人 1");
  const [micPermission, setMicPermission] = useState<"granted" | "denied" | "prompt">("prompt");
  const [segments, setSegments] = useState<TranslationSegment[]>([]);
  const [error, setError] = useState("");

  // Sidebar panel mode: "main" or "settings"
  const [sidebarMode, setSidebarMode] = useState<"main" | "settings">("main");

  // Display settings
  const [targetLang, setTargetLang] = useState("en-US");
  const [fontSize, setFontSize] = useState<FontSize>("medium");
  const [showSource, setShowSource] = useState(true);
  const [showTranslation, setShowTranslation] = useState(true);

  const clientRef = useRef<RealtimeClient | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const accessUrl = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";

  // Map frontend language code to backend language code
  const langCodeMap: Record<string, string> = {
    "zh-CN": "zh", "en-US": "en", "ja-JP": "ja",
    "fr-FR": "fr", "es-ES": "es", "de-DE": "de", "ko-KR": "ko",
  };

  const handleTargetLangChange = (code: string) => {
    setTargetLang(code);
    if (clientRef.current?.isConnected()) {
      clientRef.current.setTargetLang(langCodeMap[code] || "en");
    }
  };

  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.permissions) {
      navigator.permissions.query({ name: "microphone" as PermissionName }).then((result) => {
        setMicPermission(result.state as "granted" | "denied" | "prompt");
        result.addEventListener("change", () => {
          setMicPermission(result.state as "granted" | "denied" | "prompt");
        });
      });
    }
  }, []);

  const handleEvent = (event: WsServerEvent) => {
    switch (event.type) {
      case "session_start":
        setSessionId(event.session_id);
        setSpeaker(event.speaker);
        setIsConnected(true);
        setError("");
        break;
      case "asr_result":
        break;
      case "translation":
        setSegments((prev) => [
          {
            segmentId: event.segment_id,
            speaker: event.speaker,
            source: event.source,
            translation: event.translation,
            marqueeText: event.marquee_text,
          },
          ...prev.slice(0, 49),
        ]);
        break;
      case "speaker_changed":
        setSpeaker(event.speaker);
        break;
      case "session_end":
        setIsConnected(false);
        setIsRecording(false);
        break;
      case "error":
        setError(event.message);
        setIsConnected(false);
        setIsRecording(false);
        break;
    }
  };

  const startRecording = async () => {
    try {
      setError("");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicPermission("granted");

      const client = createRealtimeClient({
        speaker,
        targetLang: langCodeMap[targetLang] || "en",
        onEvent: handleEvent,
        onOpen: () => setIsConnected(true),
        onClose: () => { setIsConnected(false); setIsRecording(false); },
        onError: () => {
          const wsUrl = process.env.NEXT_PUBLIC_WS_BASE_URL || "ws://localhost:8000";
          setError(`连接失败: ${wsUrl}/ws/audio`);
          setIsConnected(false);
          setIsRecording(false);
        },
      });

      client.connect();
      clientRef.current = client;

      const audioContext = new AudioContext({ sampleRate: 16000 });
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);

      processor.onaudioprocess = (e) => {
        if (!client.isConnected()) return;
        const inputData = e.inputBuffer.getChannelData(0);
        const pcm16 = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          const s = Math.max(-1, Math.min(1, inputData[i]));
          pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
        }
        client.sendAudio(pcm16.buffer);
      };

      source.connect(processor);
      processor.connect(audioContext.destination);
      setIsRecording(true);
      mediaRecorderRef.current = { stream, processor, source } as any;
    } catch {
      setError("无法访问麦克风，请检查权限设置");
      setMicPermission("denied");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      const { stream, processor, source } = mediaRecorderRef.current as any;
      if (processor) processor.disconnect();
      if (source) source.disconnect();
      if (stream) stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
    }
    if (audioContextRef.current) { audioContextRef.current.close(); audioContextRef.current = null; }
    if (clientRef.current) { clientRef.current.disconnect(); clientRef.current = null; }
    setIsRecording(false);
    setIsConnected(false);
  };

  const latestSegment = segments[0];
  const subtitleStyle = { fontSize: FONT_SIZES[fontSize] };

  return (
    <main className="app-shell">
      <div className="page-grid live-layout">
        <section className="panel live-main">
          <PanelHeader
            title="语音转译主控 + 会议室大屏展示"
            subtitle="本地 ASR、RAG 术语检索与 LLM 翻译流水线"
            action={
              <span className={`status-pill ${isConnected ? "" : "gray"}`}>
                {isConnected ? "会议进行中" : "未连接"}
              </span>
            }
          />

          <VideoStage />

          {error && (
            <div style={{ padding: "1rem", background: "#ff000020", color: "#ff4444", borderRadius: "8px", marginBottom: "1rem" }}>
              ⚠️ {error}
            </div>
          )}

          {micPermission === "denied" && (
            <div style={{ padding: "1rem", background: "#ff000020", color: "#ff4444", borderRadius: "8px", marginBottom: "1rem" }}>
              ⚠️ 麦克风权限被拒绝，请在浏览器设置中允许麦克风访问
            </div>
          )}

          <div className="subtitle-stack">
            {showSource && (
              <article className="subtitle-card">
                <p className="subtitle-label">原文（中文）</p>
                <p className="subtitle-content" style={subtitleStyle}>
                  {latestSegment ? latestSegment.source : "等待语音输入..."}
                </p>
                <WaveIndicator intensity={latestSegment ? "medium" : "low"} />
              </article>
            )}
            {showTranslation && (
              <article className="subtitle-card">
                <p className="subtitle-label">译文（{languages.find(l => l.code === targetLang)?.nativeLabel ?? "English"}）</p>
                <p className="subtitle-content" style={subtitleStyle}>
                  {latestSegment ? latestSegment.translation : "Waiting for speech input..."}
                </p>
                <WaveIndicator intensity={latestSegment ? "low" : "low"} />
              </article>
            )}
          </div>

          {segments.length > 1 && (
            <details style={{ marginTop: "2rem" }}>
              <summary style={{ cursor: "pointer", padding: "0.5rem", background: "#f5f5f5", borderRadius: "4px" }}>
                历史记录（{segments.length - 1} 条）
              </summary>
              <div style={{ marginTop: "1rem", maxHeight: "300px", overflow: "auto" }}>
                {segments.slice(1).map((seg) => (
                  <div key={seg.segmentId} style={{ padding: "0.5rem", borderBottom: "1px solid #eee", fontSize: "0.9rem" }}>
                    {showSource && <div><strong>原文:</strong> {seg.source}</div>}
                    {showTranslation && <div style={{ color: "#666", marginTop: "0.25rem" }}><strong>译文:</strong> {seg.translation}</div>}
                  </div>
                ))}
              </div>
            </details>
          )}
        </section>

        <aside className="sidebar-stack">
          {sidebarMode === "main" ? (
            <>
              {/* 主控面板 */}
              <section className="panel control-panel">
                <PanelHeader title="会议控制" subtitle="实时语音转译" />

                <div className="control-row">
                  <span>源语言</span>
                  <strong>{languages[0].label}</strong>
                </div>
                <div className="control-row">
                  <span>目标语言</span>
                  <strong>{languages.find(l => l.code === targetLang)?.nativeLabel ?? "English"}</strong>
                </div>
                <div className="control-row">
                  <span><MicrophoneLevelIcon level={isRecording ? 85 : 0} /> 麦克风</span>
                  <strong className={micPermission === "granted" ? "ok" : "error"}>
                    {isRecording ? "录音中" : micPermission === "granted" ? "已授权" : "未授权"}
                  </strong>
                </div>
                <div className="control-row">
                  <span><WifiSignalIcon strength={isConnected ? 95 : 0} /> 网络</span>
                  <strong className={isConnected ? "ok" : "error"}>
                    {isConnected ? "已连接" : "未连接"}
                  </strong>
                </div>
                {sessionId && (
                  <div className="control-row">
                    <span><Clock3 size={16} /> 会话</span>
                    <strong>{sessionId}</strong>
                  </div>
                )}
              </section>

              {/* 局域网访问 */}
              <section className="panel control-panel">
                <PanelHeader title="局域网访问" subtitle="扫码查看字幕" />
                <div className="qr-wrap">
                  <div>
                    <p className="eyebrow">访问地址</p>
                    <strong style={{ fontSize: "0.85rem" }}>{accessUrl}/caption</strong>
                  </div>
                  <div className="qr-box">
                    <QRCodeSVG value={`${accessUrl}/caption`} size={96} bgColor="#ffffff" fgColor="#07111e" />
                  </div>
                </div>
              </section>

              {/* 操作按钮 */}
              <section className="panel control-actions">
                {!isRecording ? (
                  <button className="primary-button" type="button" onClick={startRecording}>
                    <Mic size={18} /> 开始录音
                  </button>
                ) : (
                  <button className="danger-button" type="button" onClick={stopRecording}>
                    <MicOff size={18} /> 停止录音
                  </button>
                )}
                <button className="secondary-button" type="button" onClick={() => setSidebarMode("settings")}>
                  <Settings size={18} /> 字幕设置
                </button>
                <Link className="secondary-button" href="/meeting/summary">
                  <Power size={18} /> 会议总结
                </Link>
              </section>
            </>
          ) : (
            <>
              {/* 字幕设置面板 */}
              <section className="panel control-panel">
                <PanelHeader title="字幕设置" subtitle="调整字幕显示方式" />

                <label className="control-row">
                  <span>目标语言</span>
                  <select
                    className="select-field"
                    value={targetLang}
                    onChange={(e) => handleTargetLangChange(e.target.value)}
                  >
                    {languages.map((lang) => (
                      <option key={lang.code} value={lang.code}>{lang.nativeLabel}</option>
                    ))}
                  </select>
                </label>

                <div className="control-row">
                  <span>字体大小</span>
                  <div className="font-size-group">
                    <button className={`secondary-button ${fontSize === "small" ? "active" : ""}`} type="button" onClick={() => setFontSize("small")}>A-</button>
                    <button className={`secondary-button ${fontSize === "medium" ? "active" : ""}`} type="button" onClick={() => setFontSize("medium")}>中</button>
                    <button className={`secondary-button ${fontSize === "large" ? "active" : ""}`} type="button" onClick={() => setFontSize("large")}>A+</button>
                  </div>
                </div>

                <div className="control-row">
                  <span>显示原文</span>
                  <button
                    className={`switch ${showSource ? "on" : ""}`}
                    type="button"
                    aria-label="显示原文"
                    onClick={() => setShowSource(!showSource)}
                  />
                </div>

                <div className="control-row">
                  <span>显示译文</span>
                  <button
                    className={`switch ${showTranslation ? "on" : ""}`}
                    type="button"
                    aria-label="显示译文"
                    onClick={() => setShowTranslation(!showTranslation)}
                  />
                </div>
              </section>

              <section className="panel control-actions">
                <button className="secondary-button" type="button" onClick={() => setSidebarMode("main")}>
                  <ArrowLeft size={18} /> 返回主控
                </button>
              </section>
            </>
          )}
        </aside>
      </div>
    </main>
  );
}
