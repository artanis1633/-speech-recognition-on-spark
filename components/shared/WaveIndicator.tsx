const heights = [4, 7, 5, 10, 8, 12, 14, 17, 18, 20, 13, 15, 9, 11, 16, 18];

interface WaveIndicatorProps {
  intensity?: "low" | "medium" | "high";
}

export function WaveIndicator({ intensity = "medium" }: WaveIndicatorProps) {
  return (
    <span className={`wave ${intensity}`} aria-label={`实时音频波形 ${intensity}`}>
      {heights.map((height, index) => (
        <span
          key={index}
          style={
            {
              height,
              "--wave-delay": `${index * 70}ms`
            } as React.CSSProperties
          }
        />
      ))}
    </span>
  );
}
