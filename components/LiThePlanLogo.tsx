// components/LiThePlanLogo.tsx

type LiThePlanLogoProps = {
  className?: string;
  width?: number | "auto";
  height?: number;
};

export function LiThePlanLogo({
  className = "",
  width = "auto",
  height = 100,
}: LiThePlanLogoProps) {
  return (
    <svg
      aria-label="LiTHePlan logo"
      className={className}
      height={height}
      role="img"
      style={{ display: "block" }}
      viewBox="0 0 280 85"
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
      <text fontFamily="Segoe UI, sans-serif" fontSize="60" x="0" y="60">
        <tspan className="bold">LiTH</tspan>
        <tspan className="highlight">e</tspan>
        <tspan className="regular">Plan</tspan>
      </text>
      <line stroke="#17c7d2" strokeWidth="5" x1="0" x2="220" y1="75" y2="75" />
    </svg>
  );
}
