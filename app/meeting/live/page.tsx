import Link from "next/link";
import { Clock3, MonitorCheck, Power, QrCode, Settings } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { activeMeeting, languages, subtitleSegments } from "@/lib/mock-data";
import { formatDuration } from "@/lib/format";
import { PanelHeader } from "@/components/shared/PanelHeader";
import { VideoStage } from "@/components/shared/VideoStage";
import { WaveIndicator } from "@/components/shared/WaveIndicator";
import { MicrophoneLevelIcon, WifiSignalIcon } from "@/components/shared/DynamicStatusIcon";

const latestSegment = subtitleSegments[0];

export default function LiveMeetingPage() {
  const accessUrl = "http://192.168.31.20";

  return (
    <main className="app-shell">
      <div className="page-grid live-layout">
        <section className="panel live-main">
          <PanelHeader
            title="语音转译主控 + 会议室大屏展示"
            subtitle="本地 ASR、RAG 术语检索与 LLM 翻译流水线"
            action={<span className="status-pill">会议进行中</span>}
          />

          <VideoStage />

          <div className="subtitle-stack">
            <article className="subtitle-card">
              <p className="subtitle-label">原文（中文）</p>
              <p className="subtitle-content">{latestSegment.sourceText}</p>
              <WaveIndicator intensity="high" />
            </article>
            <article className="subtitle-card">
              <p className="subtitle-label">译文（English）</p>
              <p className="subtitle-content">{latestSegment.translatedText}</p>
              <WaveIndicator intensity="medium" />
            </article>
          </div>
        </section>

        <aside className="sidebar-stack">
          <section className="panel control-panel">
            <PanelHeader title="会议控制" subtitle={activeMeeting.title} />

            <div className="control-row">
              <span>源语言</span>
              <strong>{languages[0].label}</strong>
            </div>
            <div className="control-row">
              <span>目标语言</span>
              <strong>English（默认）</strong>
            </div>
            <div className="control-row">
              <span>
                <MicrophoneLevelIcon level={76} /> 麦克风状态
              </span>
              <strong className="ok">正常 · 76%</strong>
            </div>
            <div className="control-row">
              <span>
                <WifiSignalIcon strength={88} /> 网络状态
              </span>
              <strong className="ok">已连接 · 88%</strong>
            </div>
            <div className="control-row">
              <span>
                <Clock3 size={16} /> 会议时长
              </span>
              <strong>{formatDuration(activeMeeting.durationSeconds)}</strong>
            </div>
          </section>

          <section className="panel control-panel">
            <PanelHeader title="PC 局域网访问" subtitle="参会者扫码或输入地址查看字幕" />
            <div className="qr-wrap">
              <div>
                <p className="eyebrow">访问地址</p>
                <strong>{accessUrl}</strong>
              </div>
              <div className="qr-box">
                <QRCodeSVG value={accessUrl} size={112} bgColor="#ffffff" fgColor="#07111e" />
              </div>
              <div className="control-row no-pad">
                <span>
                  <MonitorCheck size={16} /> 已连接 PC
                </span>
                <strong>{activeMeeting.connectedClients} 台</strong>
              </div>
            </div>
          </section>

          <section className="panel control-actions">
            <Link className="primary-button" href="/caption">
              <QrCode size={18} /> 字幕预览
            </Link>
            <button className="secondary-button" type="button">
              <Settings size={18} /> 显示设置
            </button>
            <Link className="danger-button" href="/meeting/summary">
              <Power size={18} /> 结束会议
            </Link>
          </section>
        </aside>
      </div>
    </main>
  );
}
