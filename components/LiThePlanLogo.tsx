// components/LiThePlanLogo.tsx

type LiThePlanLogoProps = {
  className?: string;
  width?: number;
  height?: number;
};

export function LiThePlanLogo({
  className = "",
  width = 320,
  height = 100,
}: LiThePlanLogoProps) {
  return (
    <svg
      aria-label="LiTHePlan logo"
      className={className}
      height={height}
      role="img"
      viewBox="0 0 320 100"
      width={width}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>LiTHePlan logo</title>
      <style>
        {`
          .bold { font-weight: bold; fill: oklch(0.20 0.01 200); }
          .highlight { fill: #17c7d2; }
          .regular { fill: oklch(0.20 0.01 200); }
          .dark .bold { fill: oklch(0.98 0.005 225); }
          .dark .regular { fill: oklch(0.98 0.005 225); }
        `}
      </style>
      <text fontFamily="Segoe UI, sans-serif" fontSize="60" x="20" y="65">
        <tspan className="bold">LiTH</tspan>
        <tspan className="highlight">e</tspan>
        <tspan className="regular">Plan</tspan>
      </text>
      <line stroke="#17c7d2" strokeWidth="5" x1="20" x2="300" y1="80" y2="80" />
    </svg>
  );
}
