import Link from "next/link";
import { ArrowLeft, CheckCircle2, FileText, FileType2, History, RotateCcw } from "lucide-react";
import { meetingSummary } from "@/lib/mock-data";
import { formatDateTime, formatDuration, formatNumber } from "@/lib/format";
import { PanelHeader } from "@/components/shared/PanelHeader";

export default function MeetingSummaryPage() {
  return (
    <main className="app-shell">
      <section className="page-grid panel summary-page">
        <div className="summary-hero">
          <CheckCircle2 size={58} />
          <div>
            <h1>会议已结束</h1>
            <p>感谢使用语音转译终端系统，会议转写与译文已本地留存。</p>
          </div>
        </div>

        <div className="summary-grid">
          <section className="panel-soft summary-info">
            <PanelHeader title="会议信息" subtitle="由本地会议流水线生成" />
            <div className="summary-info-grid">
              <div>
                <span>会议主题</span>
                <strong>{meetingSummary.title}</strong>
              </div>
              <div>
                <span>会议时长</span>
                <strong>{formatDuration(meetingSummary.durationSeconds)}</strong>
              </div>
              <div>
                <span>开始时间</span>
                <strong>{formatDateTime(meetingSummary.startedAt)}</strong>
              </div>
              <div>
                <span>结束时间</span>
                <strong>{formatDateTime(meetingSummary.endedAt)}</strong>
              </div>
              <div>
                <span>源语言</span>
                <strong>中文（自动识别）</strong>
              </div>
              <div>
                <span>默认目标语言</span>
                <strong>English</strong>
              </div>
            </div>
          </section>

          <section className="mini-metrics">
            <div className="metric-card">
              <div className="label">原文字数总数</div>
              <div className="value">{formatNumber(meetingSummary.sourceWordCount)}</div>
              <div className="hint">条</div>
            </div>
            <div className="metric-card">
              <div className="label">译文字数总数</div>
              <div className="value">{formatNumber(meetingSummary.translatedWordCount)}</div>
              <div className="hint">条</div>
            </div>
            <div className="metric-card">
              <div className="label">术语命中总数</div>
              <div className="value">{formatNumber(meetingSummary.termHitCount)}</div>
              <div className="hint">条</div>
            </div>
          </section>
        </div>

        <section className="panel-soft content-preview">
          <PanelHeader title="内容预览（节选）" subtitle="导出文档会包含完整转写、译文与纪要信息" />
          {meetingSummary.previewSegments.slice(0, 2).map((segment) => (
            <article key={segment.id} className="preview-row">
              <p>
                <strong>原文：</strong>
                {segment.sourceText}
              </p>
              <p>
                <strong>译文：</strong>
                {segment.translatedText}
              </p>
            </article>
          ))}
          <div className="summary-empty">...（更多内容）</div>
        </section>

        <div className="export-actions">
          <button className="primary-button" type="button">
            <FileText size={18} /> 导出 Word
          </button>
          <button className="danger-button" type="button">
            <FileType2 size={18} /> 导出 PDF
          </button>
          <button className="secondary-button" type="button">
            <History size={18} /> 查看会议记录
          </button>
          <Link className="secondary-button" href="/">
            <RotateCcw size={18} /> 返回首页
          </Link>
          <Link className="secondary-button" href="/meeting/live">
            <ArrowLeft size={18} /> 回到主控页
          </Link>
        </div>
      </section>
    </main>
  );
}
