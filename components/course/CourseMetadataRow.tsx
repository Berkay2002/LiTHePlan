interface CourseMetadataRowProps {
  label: string;
  value: string | number | null | undefined;
  className?: string;
}

export function CourseMetadataRow({ label, value, className = "" }: CourseMetadataRowProps) {
  if (!value) return null;
  
  return (
    <div className={className}>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
