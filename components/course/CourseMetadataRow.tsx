interface CourseMetadataRowProps {
  className?: string;
  label: string;
  value: string | number | null | undefined;
}

export function CourseMetadataRow({
  label,
  value,
  className = "",
}: CourseMetadataRowProps) {
  if (!value) {
    return null;
  }

  return (
    <div className={className}>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-medium text-foreground">{value}</p>
    </div>
  );
}
