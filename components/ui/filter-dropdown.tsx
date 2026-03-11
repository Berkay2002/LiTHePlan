"use client";

import { Check, ChevronDown, Search, X } from "lucide-react";
import { useState, useRef, useEffect, useCallback, useId } from "react";
import { cn } from "@/lib/utils";

interface FilterDropdownOption {
  label: string;
  value: string;
}

interface FilterDropdownProps {
  options: FilterDropdownOption[];
  selectedValues: string[];
  onValueChange: (values: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  className?: string;
  idPrefix?: string;
}

export function FilterDropdown({
  options,
  selectedValues,
  onValueChange,
  placeholder = "Select options...",
  searchPlaceholder = "Search...",
  className,
  idPrefix = "dropdown",
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const uniqueId = useId();
  const listboxId = `${idPrefix}-${uniqueId}-listbox`;

  // Focus search input when opened
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const toggleOption = useCallback(
    (value: string) => {
      const newValues = selectedValues.includes(value)
        ? selectedValues.filter((v) => v !== value)
        : [...selectedValues, value];
      onValueChange(newValues);
    },
    [selectedValues, onValueChange]
  );

  const removeOption = useCallback(
    (event: React.MouseEvent, value: string) => {
      event.stopPropagation();
      onValueChange(selectedValues.filter((v) => v !== value));
    },
    [selectedValues, onValueChange]
  );

  const filteredOptions = options.filter(
    (option) =>
      option.label.toLowerCase().includes(searchValue.toLowerCase()) ||
      option.value.toLowerCase().includes(searchValue.toLowerCase())
  );

  const hasSelection = selectedValues.length > 0;

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Trigger Button */}
      <button
        aria-controls={isOpen ? listboxId : undefined}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-left transition-all duration-200",
          "border-sidebar-border/60 bg-sidebar-accent/20 hover:border-sidebar-border/90 hover:bg-sidebar-accent/30",
          isOpen && "border-sidebar-border bg-sidebar-accent/30 ring-1 ring-sidebar-border/50"
        )}
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <div className="flex flex-1 flex-wrap items-center gap-1.5 overflow-hidden">
          {!hasSelection ? (
            <span className="text-sm text-sidebar-foreground/50">
              {placeholder}
            </span>
          ) : (
            selectedValues.map((value) => {
              const option = options.find((o) => o.value === value);
              if (!option) return null;
              return (
                <span
                  className="inline-flex items-center gap-1 rounded-md bg-sidebar-accent px-2 py-0.5 text-xs font-medium text-sidebar-foreground transition-all duration-150 hover:bg-sidebar-accent/80"
                  key={value}
                >
                  <span className="truncate max-w-[120px]">{option.label}</span>
                  <span
                    aria-label={`Remove ${option.label}`}
                    className="flex h-4 w-4 cursor-pointer items-center justify-center rounded-full text-sidebar-foreground/60 transition-colors hover:bg-sidebar-border/50 hover:text-sidebar-foreground"
                    onClick={(event) => removeOption(event, value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        removeOption(event as unknown as React.MouseEvent, value);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    <X className="h-3 w-3" />
                  </span>
                </span>
              );
            })
          )}
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-sidebar-foreground/50 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {/* Dropdown Panel */}
      <div
        className={cn(
          "absolute left-0 right-0 z-[9999] mt-1.5 overflow-hidden rounded-xl border border-sidebar-border/70 shadow-2xl transition-all duration-200",
          isOpen
            ? "translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-2 opacity-0"
        )}
        id={listboxId}
        role="listbox"
        style={{
          backgroundColor: "hsl(var(--card))",
          willChange: "transform, opacity",
        }}
      >
        {/* Search Input */}
        <div className="border-b border-sidebar-border/40 p-2.5">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-sidebar-foreground/40" />
            <input
              aria-label="Search options"
              className="w-full rounded-lg border border-sidebar-border/50 bg-background py-2 pl-9 pr-3 text-sm text-sidebar-foreground placeholder:text-sidebar-foreground/40 focus:border-sidebar-border focus:outline-none focus:ring-1 focus:ring-sidebar-border/50"
              onChange={(event) => setSearchValue(event.target.value)}
              onClick={(event) => event.stopPropagation()}
              placeholder={searchPlaceholder}
              ref={searchInputRef}
              type="text"
              value={searchValue}
            />
          </div>
        </div>

        {/* Options List */}
        <div
          className="max-h-[240px] overflow-y-auto overscroll-contain p-1.5"
          role="group"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "hsl(var(--border) / 0.4) transparent",
          }}
        >
          {filteredOptions.length === 0 ? (
            <div className="py-4 text-center text-sm text-sidebar-foreground/50">
              No results found
            </div>
          ) : (
            filteredOptions.map((option) => {
              const isSelected = selectedValues.includes(option.value);
              const optionId = `${idPrefix}-${uniqueId}-option-${option.value}`;

              return (
                <label
                  aria-selected={isSelected}
                  className={cn(
                    "group flex cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 transition-all duration-150",
                    "hover:bg-sidebar-accent/40",
                    isSelected && "bg-sidebar-accent/25"
                  )}
                  htmlFor={optionId}
                  key={option.value}
                  role="option"
                >
                  {/* Custom Checkbox */}
                  <div
                    className={cn(
                      "relative flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all duration-200",
                      isSelected
                        ? "border-primary bg-primary"
                        : "border-sidebar-border/70 bg-background group-hover:border-sidebar-border"
                    )}
                  >
                    <Check
                      className={cn(
                        "h-3 w-3 text-primary-foreground transition-all duration-200",
                        isSelected ? "scale-100 opacity-100" : "scale-50 opacity-0"
                      )}
                      strokeWidth={3}
                    />
                  </div>

                  <input
                    checked={isSelected}
                    className="sr-only"
                    id={optionId}
                    onChange={() => toggleOption(option.value)}
                    type="checkbox"
                  />

                  <span
                    className={cn(
                      "text-sm font-medium leading-none transition-colors duration-150",
                      isSelected
                        ? "text-sidebar-foreground"
                        : "text-sidebar-foreground/70 group-hover:text-sidebar-foreground/90"
                    )}
                  >
                    {option.label}
                  </span>
                </label>
              );
            })
          )}
        </div>

        {/* Selection Summary Footer */}
        {hasSelection && (
          <div className="border-t border-sidebar-border/40 bg-sidebar-accent/20 px-3 py-2 text-xs text-sidebar-foreground/60">
            {selectedValues.length} selected
          </div>
        )}
      </div>
    </div>
  );
}
