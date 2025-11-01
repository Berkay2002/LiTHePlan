import { Grid3X3, List } from "lucide-react";
import { Button } from "@/components/ui/button";

export type ViewMode = "grid" | "list";

interface ViewToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export function ViewToggle({ viewMode, onViewModeChange }: ViewToggleProps) {
  return (
    <div className="flex items-center gap-0.5 sm:gap-1 bg-sidebar/10 rounded-lg p-0.5 sm:p-1 border border-sidebar/20">
      <Button
        className={`h-8 sm:h-10 px-1.5 sm:px-3 text-xs sm:text-sm transition-all duration-200 ${
          viewMode === "grid"
            ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
            : "bg-sidebar-foreground/5 text-foreground hover:text-foreground border-sidebar/30 hover:bg-muted hover:border-sidebar/50"
        }`}
        onClick={() => onViewModeChange("grid")}
        size="sm"
        variant={viewMode === "grid" ? "default" : "outline"}
      >
        <Grid3X3 className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1.5" />
        <span className="hidden sm:inline">Grid</span>
      </Button>
      <Button
        className={`h-8 sm:h-10 px-1.5 sm:px-3 text-xs sm:text-sm transition-all duration-200 ${
          viewMode === "list"
            ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
            : "bg-sidebar-foreground/5 text-foreground hover:text-foreground border-sidebar/30 hover:bg-muted hover:border-sidebar/50"
        }`}
        onClick={() => onViewModeChange("list")}
        size="sm"
        variant={viewMode === "list" ? "default" : "outline"}
      >
        <List className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1.5" />
        <span className="hidden sm:inline">List</span>
      </Button>
    </div>
  );
}
