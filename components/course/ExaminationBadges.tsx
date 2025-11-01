import { Badge } from "@/components/ui/badge";

interface ExaminationBadgesProps {
  examinations: string[];
  className?: string;
}

const EXAMINATION_LABELS: Record<string, string> = {
  TEN: "Written Exam",
  LAB: "Laboratory Work",
  PROJ: "Project",
  SEM: "Seminar",
  UPG: "Assignment",
  HEM: "Home Exam",
  KTR: "Control",
  MUN: "Oral Exam",
  PRA: "Practical",
  DAT: "Computer Exercise",
};

export function ExaminationBadges({ examinations, className = "" }: ExaminationBadgesProps) {
  if (!examinations || examinations.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {examinations.map((exam, index) => (
        <Badge
          key={`${exam}-${index}`}
          variant="secondary"
          className="text-xs px-3 py-1 bg-accent/10 text-accent-foreground border border-accent/20 hover:bg-accent/20 hover:border-accent/30 transition-all duration-200"
        >
          {EXAMINATION_LABELS[exam] || exam}
        </Badge>
      ))}
    </div>
  );
}
