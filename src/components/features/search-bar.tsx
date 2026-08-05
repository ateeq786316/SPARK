"use client";

import { useRef, useState } from "react";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  defaultValue?: string;
  onSearch: (query: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
  debounceMs?: number;
}

export function SearchBar({
  defaultValue = "",
  onSearch,
  placeholder,
  autoFocus = false,
  className,
  debounceMs = 350,
}: SearchBarProps) {
  const [value, setValue] = useState(defaultValue);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleSearch = (next: string) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => onSearch(next), debounceMs);
  };

  return (
    <form
      role="search"
      className={cn("relative", className)}
      onSubmit={(event) => {
        event.preventDefault();
        onSearch(value);
      }}
    >
      <MagnifyingGlassIcon
        className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        type="search"
        value={value}
        autoFocus={autoFocus}
        aria-label="Search opportunities"
        placeholder={placeholder ?? "Search scholarships, jobs, internships…"}
        onChange={(event) => {
          setValue(event.target.value);
          scheduleSearch(event.target.value);
        }}
        className="h-12 rounded-full bg-card pl-11 pr-28"
      />
      <Button
        type="submit"
        size="sm"
        className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full pr-4 pl-3"
      >
        <MagnifyingGlassIcon className="size-4" aria-hidden />
        Search
      </Button>
    </form>
  );
}
