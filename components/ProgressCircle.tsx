// components/ProgressCircle.tsx

import { StudentProfile } from "@/types/profile";

interface ProgressCircleProps {
  profile: StudentProfile;
  targetCredits?: number;
}

export function ProgressCircle({ profile, targetCredits = 90 }: ProgressCircleProps) {
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
          width={size}
          height={size}
          className="transform -rotate-90"
          viewBox={`0 0 ${size} ${size}`}
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-gray-200 dark:text-gray-700"
          />
          
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className="text-blue-500 transition-all duration-300 ease-in-out"
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