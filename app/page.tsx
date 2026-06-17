"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { CSSProperties } from "react";
import { BookOpen, FolderOpen, Mic, Monitor, Radio } from "lucide-react";
import { StatusItem } from "@/components/shared/StatusItem";
import {
  MicrophoneLevelIcon,
  StorageRingIcon,
  TimePulseIcon,
  WifiSignalIcon,
} from "@/components/shared/DynamicStatusIcon";

const entries = [
  {
    title: "开始语音转译",
    desc: "创建本地会议，开启离线实时转写与翻译。",
    href: "/meeting/live",
    icon: Mic,
    bg: "linear-gradient(145deg, #0f69ff, #05339c)",
  },
  {
    title: "PC 字幕查看",
    desc: "局域网参会端入口，查看实时字幕。",
    href: "/caption",
    icon: Monitor,
    bg: "linear-gradient(145deg, #058686, #053d4d)",
  },
  {
    title: "专业术语库管理",
    desc: "维护行业术语和 RAG 语料，提升翻译一致性。",
    href: "/terms",
    icon: BookOpen,
    bg: "linear-gradient(145deg, #5734d6, #20156c)",
  },
  {
    title: "历史会议 / 文档",
    desc: "查看会议记录，并导出 Markdown 文件。",
    href: "/meeting/summary",
    icon: FolderOpen,
    bg: "linear-gradient(145deg, #d98116, #723605)",
  },
];

export default function HomePage() {
  const [micPermission, setMicPermission] = useState<"granted" | "denied" | "prompt" | "unknown">("unknown");
  const [isOnline, setIsOnline] = useState(true);
  const [currentTime, setCurrentTime] = useState("");

  // Check microphone permission
  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.permissions) {
      navigator.permissions
        .query({ name: "microphone" as PermissionName })
        .then((result) => {
          setMicPermission(result.state as "granted" | "denied" | "prompt");
          result.addEventListener("change", () => {
            setMicPermission(result.state as "granted" | "denied" | "prompt");
          });
        })
        .catch(() => {
          setMicPermission("unknown");
        });
    }
  }, []);

  // Check network status
  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    updateOnlineStatus();
    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);

    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
    };
  }, []);

  // Update time every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("zh-CN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const getMicStatusText = (): { value: string; detail: string; tone: "green" | "blue" | "muted" | "red" } => {
    switch (micPermission) {
      case "granted":
        return { value: "已授权", detail: "可以使用", tone: "green" };
      case "denied":
        return { value: "权限被拒绝", detail: "需要授权", tone: "red" };
      case "prompt":
        return { value: "未授权", detail: "等待用户授权", tone: "muted" };
      default:
        return { value: "未知", detail: "检测中", tone: "muted" };
    }
  };

  const micStatus = getMicStatusText();

  return (
    <main className="app-shell home-page">
      <section className="page-grid panel home-panel">
        <div className="home-hero">
          <div className="home-hero-content">
            <p className="eyebrow">NVIDIA DGX Spark · Offline AI Meeting System</p>
            <h1>会议室语音转译终端系统</h1>
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
            icon={<MicrophoneLevelIcon level={micPermission === "granted" ? 76 : 0} />}
            label="麦克风状态"
            value={micStatus.value}
            detail={micStatus.detail}
            tone={micStatus.tone}
          />
          <StatusItem
            icon={<WifiSignalIcon strength={isOnline ? 95 : 0} />}
            label="网络状态"
            value={isOnline ? "已连接" : "离线"}
            detail={isOnline ? "网络正常" : "网络断开"}
            tone={isOnline ? "blue" : "red"}
          />
          <StatusItem
            icon={<StorageRingIcon level={0} />}
            label="存储空间"
            value="待配置"
            detail="服务器存储信息"
            tone="muted"
          />
          <StatusItem
            icon={<TimePulseIcon />}
            label="时间"
            value={currentTime || "00:00:00"}
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
