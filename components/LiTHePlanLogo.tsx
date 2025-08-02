// components/LiTHePlanLogo.tsx

interface LiTHePlanLogoProps {
  className?: string;
  width?: number;
  height?: number;
}

export function LiTHePlanLogo({ 
  className = "", 
  width = 320, 
  height = 100 
}: LiTHePlanLogoProps) {
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 320 100" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <style>
        {`
          .bold { font-weight: bold; fill: #FFFFFF; }
          .highlight { fill: #17c7d2; }
          .regular { fill: #FFFFFF; }
        `}
      </style>
      <text x="20" y="65" fontSize="60" fontFamily="Segoe UI, sans-serif">
        <tspan className="bold">LiTH</tspan>
        <tspan className="highlight">e</tspan>
        <tspan className="regular">Plan</tspan>
      </text>
      <line x1="20" y1="80" x2="300" y2="80" stroke="#17c7d2" strokeWidth="5"/>
    </svg>
  );
}