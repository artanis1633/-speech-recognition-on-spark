import { Clock3, HardDrive, Mic, Wifi } from "lucide-react";

interface SignalIconProps {
  strength: number;
  label?: string;
}

interface LevelIconProps {
  level: number;
  label?: string;
}

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, value));
}

export function WifiSignalIcon({ strength, label = "Wi-Fi 信号强度" }: SignalIconProps) {
  const normalized = clampPercent(strength);
  const activeBars = Math.max(1, Math.ceil(normalized / 25));

  return (
    <span className="dynamic-icon wifi-status-icon" aria-label={`${label} ${normalized}%`}>
      <Wifi size={22} className="dynamic-main-icon" />
      <span className="wifi-mini-bars" aria-hidden="true">
        {[1, 2, 3, 4].map((bar) => (
          <span
            key={bar}
            className={bar <= activeBars ? "active" : ""}
            style={{ "--bar-index": bar } as React.CSSProperties}
          />
        ))}
      </span>
    </span>
  );
}

export function MicrophoneLevelIcon({ level, label = "麦克风收音强度" }: LevelIconProps) {
  const normalized = clampPercent(level);
  const bars = [0.35, 0.68, 1, 0.78, 0.45];

  return (
    <span
      className="dynamic-icon mic-status-icon"
      aria-label={`${label} ${normalized}%`}
      style={{ "--level": normalized } as React.CSSProperties}
    >
      <Mic size={22} className="dynamic-main-icon" />
      <span className="mic-mini-bars" aria-hidden="true">
        {bars.map((scale, index) => (
          <span key={index} style={{ "--scale": scale } as React.CSSProperties} />
        ))}
      </span>
    </span>
  );
}

export function StorageRingIcon({ level, label = "存储空间余量" }: LevelIconProps) {
  const normalized = clampPercent(level);

  return (
    <span
      className="dynamic-icon storage-ring"
      aria-label={`${label} ${normalized}%`}
      style={{ "--storage": `${normalized}%` } as React.CSSProperties}
    >
      <HardDrive size={20} className="dynamic-main-icon" />
    </span>
  );
}

export function TimePulseIcon({ label = "系统时间" }: { label?: string }) {
  return (
    <span className="dynamic-icon time-pulse" aria-label={label}>
      <Clock3 size={22} />
    </span>
  );
}
