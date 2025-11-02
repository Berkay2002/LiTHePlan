"use client";

import { useEffect, useState } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandList,
} from "@/components/ui/command";
import type { Course } from "@/types/course";
import { CourseCommandItem } from "./CourseCommandItem";

export function CourseCommandSearch() {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Handle keyboard shortcut (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        setOpen((currentOpen) => !currentOpen);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Debounced search with API
  useEffect(() => {
    if (!searchQuery.trim()) {
      setCourses([]);
      return;
    }

    setIsLoading(true);

    // Debounce timer
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/courses?search=${encodeURIComponent(searchQuery)}&limit=10`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch courses");
        }

        const data = await response.json();
        setCourses(data.data?.courses || []);
      } catch (error) {
        console.error("Error searching courses:", error);
        setCourses([]);
      } finally {
        setIsLoading(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset search when dialog closes
  useEffect(() => {
    if (!open) {
      setSearchQuery("");
      setCourses([]);
    }
  }, [open]);

  return (
    <CommandDialog
      description="Search through 339 curated courses"
      onOpenChange={setOpen}
      open={open}
      title="Search Courses"
    >
      <CommandInput
        onValueChange={setSearchQuery}
        placeholder="Type course code or name..."
        value={searchQuery}
      />
      <CommandList>
        {isLoading ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            Searching courses...
          </div>
        ) : searchQuery.trim() === "" ? (
          <CommandEmpty>Type to search through courses</CommandEmpty>
        ) : courses.length === 0 ? (
          <CommandEmpty>No courses found for "{searchQuery}"</CommandEmpty>
        ) : (
          <CommandGroup
            heading={`Found ${courses.length} course${courses.length === 1 ? "" : "s"}`}
          >
            {courses.map((course) => (
              <CourseCommandItem
                course={course}
                key={course.id}
                onSelect={() => setOpen(false)}
              />
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
