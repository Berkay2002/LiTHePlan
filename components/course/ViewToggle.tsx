import { Button } from "@/components/ui/button";
import { Grid3X3, List } from "lucide-react";

export type ViewMode = 'grid' | 'list';

interface ViewToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export function ViewToggle({ viewMode, onViewModeChange }: ViewToggleProps) {
  return (
    <div className="flex items-center gap-1 bg-air-superiority-blue/10 rounded-lg p-1 border border-air-superiority-blue/20">
      <Button
        variant={viewMode === 'grid' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onViewModeChange('grid')}
        className={`h-10 px-2 sm:px-3 transition-all duration-200 ${
          viewMode === 'grid'
            ? 'bg-picton-blue hover:bg-picton-blue-600 text-white shadow-sm border-picton-blue'
            : 'bg-white/80 text-air-superiority-blue border-air-superiority-blue/30 hover:bg-air-superiority-blue/10 hover:border-air-superiority-blue/50'
        }`}
      >
        <Grid3X3 className="h-4 w-4 mr-1.5" />
        Grid
      </Button>
      <Button
        variant={viewMode === 'list' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onViewModeChange('list')}
        className={`h-10 px-2 sm:px-3 transition-all duration-200 ${
          viewMode === 'list'
            ? 'bg-picton-blue hover:bg-picton-blue-600 text-white shadow-sm border-picton-blue'
            : 'bg-white/80 text-air-superiority-blue border-air-superiority-blue/30 hover:bg-air-superiority-blue/10 hover:border-air-superiority-blue/50'
        }`}
      >
        <List className="h-4 w-4 mr-1.5" />
        List
      </Button>
    </div>
  );
}