// components/LiTHePlanLogo.tsx

interface LiTHePlanLogoProps {
  className?: string;
  width?: number;
  height?: number;
}

export function LiTHePlanLogo({
  className = "",
  width = 320,
  height = 100,
}: LiTHePlanLogoProps) {
  return (
    <svg
      className={className}
      height={height}
      viewBox="0 0 320 100"
      width={width}
      xmlns="http://www.w3.org/2000/svg"
    >
      <style>
        {`
          .bold { font-weight: bold; fill: #FFFFFF; }
          .highlight { fill: #17c7d2; }
          .regular { fill: #FFFFFF; }
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
