"use client";

import { useCallback, useEffect, useRef, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  FileText,
  Loader2,
  RefreshCw,
  RotateCcw,
  Users,
} from "lucide-react";
import { PanelHeader } from "@/components/shared/PanelHeader";
import { downloadExport, generateMinutes, getMinutes } from "@/lib/api/client";
import type { MeetingMinutes } from "@/lib/types";

// ── helpers ───────────────────────────────────────────────────────────────────

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m} 分 ${s} 秒`;
}

function formatDatetime(iso: string): string {
  try { return new Date(iso).toLocaleString("zh-CN"); } catch { return iso; }
}

function MinutesList({ title, items }: { title: string; items: string[] }) {
  if (!items?.length) return null;
  return (
    <div className="minutes-section">
      <p className="minutes-section-title">{title}</p>
      <ul className="minutes-list">
        {items.map((item, i) => <li key={i} className="minutes-list-item">{item}</li>)}
      </ul>
    </div>
  );
}

// ── constants ─────────────────────────────────────────────────────────────────

const MAX_POLL = 6;
const POLL_INTERVAL_MS = 4000;

// ── main component ────────────────────────────────────────────────────────────

function SummaryContent() {
  const searchParams = useSearchParams();
  const urlSessionId = searchParams.get("session_id") ?? "";

  const [inputId, setInputId]   = useState(urlSessionId);
  const [activeId, setActiveId] = useState(urlSessionId);
  const [lang, setLang]         = useState<"zh" | "en">("zh");

  const [minutes, setMinutes]       = useState<MeetingMinutes | null>(null);
  const [loading, setLoading]       = useState(false);
  const [regenerating, setRegenerat] = useState(false);
  const [error, setError]           = useState("");
  const [pollCount, setPollCount]   = useState(0);
  const pollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchMinutes = useCallback(async (id: string, isPoll = false) => {
    if (!isPoll) setLoading(true);
    setError("");
    try {
      const data = await getMinutes(id);
      setMinutes(data);
      setPollCount(0);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("404") || msg.toLowerCase().includes("not yet")) {
        setPollCount((n) => {
          const next = n + 1;
          if (next < MAX_POLL) {
            pollTimer.current = setTimeout(() => fetchMinutes(id, true), POLL_INTERVAL_MS);
          } else {
            setError("会议纪要尚未生成，请稍后刷新或点击「重新生成」。");
          }
          return next;
        });
      } else {
        setError(msg);
      }
    } finally {
      if (!isPoll) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeId) fetchMinutes(activeId);
    return () => { if (pollTimer.current) clearTimeout(pollTimer.current); };
  }, [activeId, fetchMinutes]);

  // When minutes load, default to the meeting's source language tab.
  // zh-source meetings → 中文 tab; en-source meetings → English tab.
  useEffect(() => {
    if (!minutes) return;
    const src = minutes.source_lang ?? "zh";
    setLang(src === "en" && minutes.summary_en ? "en" : "zh");
  }, [minutes]);

  const handleQuery = () => {
    const id = inputId.trim();
    if (!id || id === activeId) return;
    setMinutes(null);
    setError("");
    setPollCount(0);
    setActiveId(id);
  };

  const handleRegenerate = async () => {
    if (!activeId) return;
    setRegenerat(true);
    setError("");
    try {
      const data = await generateMinutes(activeId);
      setMinutes(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "重新生成失败");
    } finally {
      setRegenerat(false);
    }
  };

  const isPolling = pollCount > 0 && pollCount < MAX_POLL && !minutes;
  const isLoaded  = !!minutes && !loading;

  // ── viewport-filling shell ─────────────────────────────────────────────────
  // The outer shell adds 24px padding top+bottom = 48px total.
  const panelHeight = "calc(100vh - 48px)";

  return (
    <main className="app-shell" style={{ overflow: "hidden" }}>
      <div
        className="page-grid two-col"
        style={{ alignItems: "start", height: panelHeight }}
      >

        {/* ── 左侧主栏 ── */}
        <section
          className="panel caption-left"
          style={{ display: "flex", flexDirection: "column", height: panelHeight }}
        >
          {/* ── 固定顶部：标题 + 输入 + 状态 ── */}
          <div style={{ flexShrink: 0 }}>
            <PanelHeader
              title="会议纪要"
              subtitle="输入会话 ID 查询 AI 生成的摘要"
              action={
                <span className={`status-pill ${isLoaded ? "blue" : "gray"}`}>
                  {isLoaded ? "已加载" : loading ? "加载中" : "未加载"}
                </span>
              }
            />

            {/* Session ID 输入 */}
            <div style={{ display:"flex", gap:"0.5rem", marginBottom:"12px", alignItems:"center" }}>
              <input
                type="text"
                className="select-field"
                placeholder="输入会话 ID，例如 a1b2c3d4"
                value={inputId}
                onChange={(e) => setInputId(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleQuery(); }}
                style={{ flex: 1 }}
              />
              <button
                className="primary-button"
                type="button"
                onClick={handleQuery}
                disabled={!inputId.trim() || (inputId.trim() === activeId && isLoaded)}
              >
                {isLoaded && inputId.trim() === activeId ? "已加载" : "查询"}
              </button>
            </div>

            {/* 紧凑信息条 */}
            <div style={{ display:"flex", flexWrap:"wrap", gap:"8px", marginBottom:"12px" }}>
              <span className="caption-chip" style={{ fontSize:"12px" }}>
                {isLoaded ? <CheckCircle2 size={14} /> : <Clock3 size={14} />}
                {isLoaded ? "纪要就绪" : isPolling ? "生成中…" : loading ? "加载中…" : "待查询"}
              </span>
              {activeId && (
                <span className="caption-chip" style={{ fontSize:"12px", fontFamily:"monospace" }}>
                  #{activeId}
                </span>
              )}
              {minutes?.speakers.length ? (
                <span className="caption-chip" style={{ fontSize:"12px" }}>
                  <Users size={14} />{minutes.speakers.join("、")}
                </span>
              ) : null}
              {minutes && (
                <span className="caption-chip" style={{ fontSize:"12px" }}>
                  <Clock3 size={14} />{formatDuration(minutes.duration_seconds)}
                </span>
              )}
            </div>

            {/* 轮询提示 */}
            {isPolling && (
              <div style={{ display:"flex", alignItems:"center", gap:"10px", padding:"12px 14px",
                background:"rgba(22,119,255,0.08)", border:"1px solid rgba(22,119,255,0.2)",
                borderRadius:"8px", marginBottom:"12px", color:"#76b7ff", fontSize:"12px" }}>
                <Loader2 size={16} className="spin" />
                纪要正在生成中，请稍候…（{pollCount}/{MAX_POLL}）
              </div>
            )}

            {/* 错误 */}
            {error && !loading && (
              <div style={{ padding:"12px 14px", background:"rgba(239,68,68,0.1)",
                border:"1px solid rgba(239,68,68,0.25)", borderRadius:"8px",
                marginBottom:"12px", color:"#ff8f8f", display:"flex",
                alignItems:"flex-start", gap:"8px", fontSize:"12px" }}>
                <AlertCircle size={15} style={{ flexShrink:0, marginTop:"1px" }} />{error}
              </div>
            )}

            {/* 无 session 提示 */}
            {!activeId && (
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"10px",
                padding:"28px", borderRadius:"8px", border:"1px dashed rgba(102,165,224,0.3)",
                color:"var(--muted)", textAlign:"center", marginBottom:"12px" }}>
                <AlertCircle size={24} />
                <p style={{ margin:0, fontSize:"13px" }}>
                  输入会话 ID 查询，或从主控页停止会议后自动跳转。
                </p>
              </div>
            )}

            {/* 加载占位 */}
            {loading && (
              <div style={{ display:"flex", alignItems:"center", justifyContent:"center",
                gap:"10px", padding:"24px", color:"var(--muted)", fontSize:"13px" }}>
                <Loader2 size={20} className="spin" />正在加载会议纪要…
              </div>
            )}

            {/* 语言切换（只在有内容时显示） */}
            {minutes && !loading && (
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
                borderBottom:"1px solid rgba(102,165,224,0.18)", paddingBottom:"10px",
                marginBottom:"2px" }}>
                <span style={{ color:"var(--muted)", fontSize:"12px" }}>
                  AI 自动生成 · {formatDatetime(minutes.generated_at)}
                </span>
                <div style={{ display:"flex", gap:"6px" }}>
                  <button
                    className={`secondary-button${lang === "zh" ? " active" : ""}`}
                    type="button" onClick={() => setLang("zh")}
                    style={{ fontSize:"11px", minHeight:"26px", padding:"0 12px" }}>
                    中文
                  </button>
                  <button
                    className={`secondary-button${lang === "en" ? " active" : ""}`}
                    type="button" onClick={() => setLang("en")}
                    disabled={!minutes.summary_en}
                    style={{ fontSize:"11px", minHeight:"26px", padding:"0 12px" }}>
                    English
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── 可滚动纪要内容区 ── */}
          {minutes && !loading && (
            <div style={{
              flex: 1,
              overflowY: "auto",
              paddingRight: "4px",
              marginTop: "12px",
              // Custom thin scrollbar
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(95,172,255,0.3) transparent",
            }}>
              {lang === "zh" ? (
                <>
                  <div className="minutes-summary-block">
                    <p className="minutes-section-title">执行摘要</p>
                    <p className="minutes-summary-text">{minutes.summary || "（无）"}</p>
                  </div>
                  <MinutesList title="主要议题" items={minutes.topics} />
                  <MinutesList title="关键要点" items={minutes.key_points} />
                  <MinutesList title="决议与共识" items={minutes.decisions} />
                  <MinutesList title="行动事项" items={minutes.action_items} />
                </>
              ) : (
                <>
                  <div className="minutes-summary-block">
                    <p className="minutes-section-title">Executive Summary</p>
                    <p className="minutes-summary-text">{minutes.summary_en || "(none)"}</p>
                  </div>
                  <MinutesList title="Key Topics"    items={minutes.topics_en ?? []} />
                  <MinutesList title="Key Points"    items={minutes.key_points_en ?? []} />
                  <MinutesList title="Decisions"     items={minutes.decisions_en ?? []} />
                  <MinutesList title="Action Items"  items={minutes.action_items_en ?? []} />
                </>
              )}
              {/* 底部内边距，防止最后一行贴边 */}
              <div style={{ height: "16px" }} />
            </div>
          )}
        </section>

        {/* ── 右侧边栏（sticky） ── */}
        <aside className="sidebar-stack" style={{ position: "sticky", top: 0 }}>
          <section className="panel caption-settings">
            <PanelHeader title="操作" subtitle="导出与生成" />
            <div style={{ display:"grid", gap:"10px" }}>
              <button className="primary-button" type="button"
                disabled={!activeId} onClick={() => activeId && downloadExport(activeId)}>
                <FileText size={18} />导出 Markdown
              </button>
              <button className="secondary-button" type="button"
                disabled={!activeId || regenerating} onClick={handleRegenerate}>
                {regenerating ? <Loader2 size={18} className="spin" /> : <RefreshCw size={18} />}
                重新生成纪要
              </button>
              <Link className="secondary-button" href="/meeting/live">
                <ArrowLeft size={18} />回到主控页
              </Link>
              <Link className="secondary-button" href="/">
                <RotateCcw size={18} />返回首页
              </Link>
            </div>
          </section>

          <section className="panel caption-settings">
            <PanelHeader title="说明" subtitle="会议纪要查询" />
            <div style={{ display:"grid", gap:"8px" }}>
              <div className="caption-chip">
                <CheckCircle2 size={16} />会议结束后自动生成
              </div>
              <div className="caption-chip">
                <RefreshCw size={16} />支持手动重新生成
              </div>
              <div className="caption-chip">
                <FileText size={16} />可导出双语 Markdown
              </div>
            </div>
          </section>
        </aside>

      </div>
    </main>
  );
}

// ── page export ───────────────────────────────────────────────────────────────

export default function MeetingSummaryPage() {
  return (
    <Suspense fallback={
      <main className="app-shell">
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center",
          minHeight:"60vh", gap:"12px", color:"var(--muted)" }}>
          <Loader2 size={28} className="spin" />加载中…
        </div>
      </main>
    }>
      <SummaryContent />
    </Suspense>
  );
}
