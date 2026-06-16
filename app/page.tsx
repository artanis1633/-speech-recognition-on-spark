import Link from "next/link";
import type { CSSProperties } from "react";
import { BookOpen, FolderOpen, Mic, Monitor, Radio } from "lucide-react";
import { deviceHealth } from "@/lib/mock-data";
import { StatusItem } from "@/components/shared/StatusItem";
import {
  MicrophoneLevelIcon,
  StorageRingIcon,
  TimePulseIcon,
  WifiSignalIcon
} from "@/components/shared/DynamicStatusIcon";

const entries = [
  {
    title: "开始同声传译",
    desc: "创建本地会议，开启离线实时转写与翻译。",
    href: "/meeting/live",
    icon: Mic,
    bg: "linear-gradient(145deg, #0f69ff, #05339c)"
  },
  {
    title: "PC 字幕查看",
    desc: "局域网参会端入口，支持个人字幕语种。",
    href: "/caption",
    icon: Monitor,
    bg: "linear-gradient(145deg, #058686, #053d4d)"
  },
  {
    title: "专业术语库管理",
    desc: "维护行业术语和 RAG 语料，提升翻译一致性。",
    href: "/terms",
    icon: BookOpen,
    bg: "linear-gradient(145deg, #5734d6, #20156c)"
  },
  {
    title: "历史会议 / 文档",
    desc: "查看会议记录，并导出 Word 或 PDF 文件。",
    href: "/meeting/summary",
    icon: FolderOpen,
    bg: "linear-gradient(145deg, #d98116, #723605)"
  }
];

export default function HomePage() {
  return (
    <main className="app-shell home-page">
      <section className="page-grid panel home-panel">
        <div className="home-hero">
          <div className="home-hero-content">
            <p className="eyebrow">NVIDIA DGX Spark · Offline AI Meeting System</p>
            <h1>会议室同传终端系统</h1>
            <p>高效沟通 · 实时互译 · 智慧会议</p>
          </div>
        </div>

        <div className="card-grid-4 home-entry-grid">
          {entries.map((entry) => {
            const Icon = entry.icon;
            return (
              <Link
                key={entry.title}
                className="entry-card"
                href={entry.href}
                style={{ "--entry-bg": entry.bg } as CSSProperties}
              >
                <span className="entry-icon">
                  <Icon size={38} strokeWidth={1.8} />
                </span>
                <div>
                  <h3>{entry.title}</h3>
                  <p>{entry.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="home-status panel-soft">
          <StatusItem
            icon={<MicrophoneLevelIcon level={76} />}
            label="麦克风状态"
            value="正常"
            detail="收音 76%"
            tone="green"
          />
          <StatusItem
            icon={<WifiSignalIcon strength={88} />}
            label="网络状态"
            value="已连接"
            detail="信号 88%"
            tone="blue"
          />
          <StatusItem
            icon={<StorageRingIcon level={72} />}
            label="存储空间"
            value={`${deviceHealth.storageFreeGb} GB 可用`}
            detail="剩余 72%"
            tone="muted"
          />
          <StatusItem
            icon={<TimePulseIcon />}
            label="时间"
            value={deviceHealth.currentTime}
            detail="本地系统"
            tone="muted"
          />
        </div>

        <div className="home-live-indicator">
          <Radio size={16} />
          全离线运行 · 音频、文本与译文不出本地私有网络
        </div>
      </section>
    </main>
  );
}
