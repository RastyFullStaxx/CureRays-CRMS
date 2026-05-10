function points(values: number[], width: number, height: number) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(max - min, 1);
  return values
    .map((value, index) => {
      const x = (index / Math.max(values.length - 1, 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");
}

export function MiniSparkline({
  values,
  color = "#0033A0"
}: {
  values: number[];
  color?: string;
}) {
  return (
    <svg viewBox="0 0 96 44" className="h-11 w-24 overflow-visible" role="img" aria-label="Trend sparkline">
      <polyline
        points={points(values, 96, 38)}
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3"
      />
      {values.map((value, index) => {
        const plotted = points(values, 96, 38).split(" ")[index].split(",");
        return <circle key={`${value}-${index}`} cx={plotted[0]} cy={plotted[1]} r="2.4" fill={color} />;
      })}
    </svg>
  );
}
