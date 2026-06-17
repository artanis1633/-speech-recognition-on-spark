import { CheckCircle2, Clock3, Monitor, MonitorSpeaker, Volume2 } from "lucide-react";
import { activeSession, languages, translationSegments } from "@/lib/mock-data";
import { PanelHeader } from "@/components/shared/PanelHeader";
import { VideoStage } from "@/components/shared/VideoStage";
import { WaveIndicator } from "@/components/shared/WaveIndicator";

export default function CaptionPage() {
  return (
    <main className="app-shell">
      <div className="page-grid two-col">
        <section className="panel caption-left">
          <PanelHeader
            title="PC 字幕查看页"
            subtitle="参会者通过局域网访问主机，查看实时字幕"
            action={<span className="status-pill blue">已连接本地设备</span>}
          />

          <div className="caption-status-grid">
            <div className="panel-soft caption-info">
              <div>
                <p className="eyebrow">本地设备地址</p>
                <strong>http://192.168.31.20</strong>
              </div>
              <div>
                <p className="eyebrow">会话 ID</p>
                <strong>{activeSession.sessionId}</strong>
              </div>
              <div>
                <p className="eyebrow">当前发言人</p>
                <strong>{activeSession.speaker}</strong>
              </div>
            </div>

            <div className="panel-soft caption-info">
              <div className="caption-chip">
                <CheckCircle2 size={18} /> 已连接本地设备
              </div>
              <div className="caption-chip">
                <Clock3 size={18} /> 实时字幕刷新
              </div>
              <div className="caption-chip">
                <MonitorSpeaker size={18} /> 支持双语并行显示
              </div>
            </div>
          </div>

          <div className="caption-video">
            <VideoStage compact />
          </div>

          <div className="subtitle-stack">
            {translationSegments.slice(0, 2).map((segment) => (
              <article className="subtitle-card" key={segment.segmentId}>
                <p className="subtitle-label">原文（中文） · {segment.speaker}</p>
                <p className="subtitle-content">{segment.source}</p>
                <WaveIndicator intensity="high" />
                <p className="subtitle-label">译文（English）</p>
                <p className="subtitle-content subtitle-english">{segment.translation}</p>
                <WaveIndicator intensity="low" />
              </article>
            ))}
          </div>
        </section>

        <aside className="sidebar-stack">
          <section className="panel caption-settings">
            <PanelHeader title="字幕设置" subtitle="用户偏好可本地保存" />

            <label className="setting-row">
              <span>源语言</span>
              <select className="select-field" defaultValue="zh-CN">
                {languages.map((language) => (
                  <option key={language.code} value={language.code}>
                    {language.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="setting-row">
              <span>目标语言</span>
              <select className="select-field" defaultValue="en-US">
                {languages.map((language) => (
                  <option key={language.code} value={language.code}>
                    {language.nativeLabel}
                  </option>
                ))}
              </select>
            </label>

            <div className="setting-row">
              <span>显示原文</span>
              <button className="switch on" type="button" aria-label="显示原文" />
            </div>
            <div className="setting-row">
              <span>显示译文</span>
              <button className="switch on" type="button" aria-label="显示译文" />
            </div>
            <div className="setting-row">
              <span>字体大小</span>
              <div className="font-size-group">
                <button className="secondary-button" type="button">
                  A-
                </button>
                <button className="secondary-button active" type="button">
                  中
                </button>
                <button className="secondary-button" type="button">
                  A+
                </button>
              </div>
            </div>
          </section>

          <section className="panel caption-settings">
            <PanelHeader title="访问状态" subtitle="当前后端仅支持中 ↔ 英自动翻译" />
            <div className="caption-chip">
              <Monitor size={18} /> 适配浏览器访问
            </div>
            <div className="caption-chip">
              <Volume2 size={18} /> 支持 WebSocket 实时字幕
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}
