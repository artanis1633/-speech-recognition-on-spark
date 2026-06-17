import Link from "next/link";
import { ArrowLeft, CheckCircle2, FileText, History, RotateCcw } from "lucide-react";
import { activeSession, translationSegments } from "@/lib/mock-data";
import { formatDateTime } from "@/lib/format";
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
                <span>会话 ID</span>
                <strong>{activeSession.sessionId}</strong>
              </div>
              <div>
                <span>发言人</span>
                <strong>{activeSession.speaker}</strong>
              </div>
              <div>
                <span>开始时间</span>
                <strong>{formatDateTime(activeSession.startedAt)}</strong>
              </div>
              <div>
                <span>翻译方向</span>
                <strong>中文 ↔ English（自动检测）</strong>
              </div>
              <div>
                <span>总段数</span>
                <strong>{translationSegments.length} 段</strong>
              </div>
            </div>
          </section>
        </div>

        <section className="panel-soft content-preview">
          <PanelHeader title="内容预览（节选）" subtitle="导出文档包含完整转写与译文" />
          {translationSegments.slice(0, 2).map((segment) => (
            <article key={segment.segmentId} className="preview-row">
              <p>
                <strong>原文：</strong>
                {segment.source}
              </p>
              <p>
                <strong>译文：</strong>
                {segment.translation}
              </p>
            </article>
          ))}
          <div className="summary-empty">...（更多内容）</div>
        </section>

        <div className="export-actions">
          <button className="primary-button" type="button">
            <FileText size={18} /> 导出 Markdown
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
