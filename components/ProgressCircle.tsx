// components/ProgressCircle.tsx

import type { StudentProfile } from "@/types/profile";

interface ProgressCircleProps {
  profile: StudentProfile;
  targetCredits?: number;
}

export function ProgressCircle({
  profile,
  targetCredits = 90,
}: ProgressCircleProps) {
  const currentCredits = profile.metadata.total_credits;
  const percentage = Math.min((currentCredits / targetCredits) * 100, 100);

  // Calculate SVG circle properties
  const size = 200;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex items-center justify-center">
      <div className="relative">
        <svg
          className="transform -rotate-90"
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          width={size}
        >
          {/* Background circle */}
          <circle
            className="text-gray-200 dark:text-gray-700"
            cx={size / 2}
            cy={size / 2}
            fill="transparent"
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
          />

          {/* Progress circle */}
          <circle
            className="text-blue-500 transition-all duration-300 ease-in-out"
            cx={size / 2}
            cy={size / 2}
            fill="transparent"
            r={radius}
            stroke="currentColor"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            strokeWidth={strokeWidth}
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">
              {currentCredits} / {targetCredits} hp
            </div>
            <div className="text-sm text-muted-foreground">
              {Math.round(percentage)}% complete
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
