interface VideoStageProps {
  compact?: boolean;
}

export function VideoStage({ compact = false }: VideoStageProps) {
  return (
    <div className="video-stage" style={{ minHeight: compact ? 210 : undefined }}>
      <div className="video-stage-content">
        <div>
          <p className="video-title">创新驱动发展 · 合作共赢未来</p>
          <p className="video-subtitle">
            Innovation Drives Development · Cooperation Wins the Future
          </p>
        </div>
      </div>
    </div>
  );
}
