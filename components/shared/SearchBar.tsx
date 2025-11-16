"use client";

import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({
  value,
  onChange,
  placeholder = "Search courses by name or code...",
  className = "",
}: SearchBarProps) {
  const handleClear = () => {
    onChange("");
  };

  return (
    <div
      className={`relative flex items-center w-full max-w-md border-2 border-sidebar-border focus-within:border-primary bg-sidebar rounded-md transition-colors ${className}`}
    >
      {/* Search Icon */}
      <div className="flex items-center justify-center pl-3 pr-0 py-1.5 text-muted-foreground pointer-events-none">
        <Search className="size-4" />
      </div>

      {/* Input Field */}
      <input
        className="flex-1 h-9 px-2 bg-transparent border-0 outline-none focus:outline-none focus:ring-0 text-foreground placeholder:text-muted-foreground text-sm"
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          onChange(e.target.value)
        }
        placeholder={placeholder}
        type="text"
        value={value}
      />

      {/* Clear Button or Keyboard Shortcuts */}
      <div className="flex items-center justify-center pl-0 pr-3 py-1.5 gap-2">
        {value ? (
          <Button
            className="h-6 w-6 p-0 hover:bg-accent/10 text-muted-foreground hover:text-accent"
            onClick={handleClear}
            size="sm"
            variant="ghost"
          >
            <X className="h-3 w-3" />
          </Button>
        ) : (
          <>
            <Kbd className="bg-muted text-muted-foreground">⌘</Kbd>
            <Kbd className="bg-muted text-muted-foreground">K</Kbd>
          </>
        )}
      </div>
    </div>
  );
}
