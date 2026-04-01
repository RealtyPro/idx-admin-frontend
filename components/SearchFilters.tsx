"use client";

import React, { useEffect, useRef, useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export type SearchFiltersProps = {
  keyword: string;
  isKeywordValid: boolean;
  hasActiveFilters: boolean;
  isLoading: boolean;
  onKeywordChange: (value: string) => void;
  onKeywordClear: () => void;
  onSearch: () => void;
  onClear: () => void;
  renderFields: () => React.ReactNode;
  className?: string;
};

export default function SearchFilters({
  keyword,
  isKeywordValid,
  hasActiveFilters,
  isLoading,
  onKeywordChange,
  onKeywordClear,
  onSearch,
  onClear,
  renderFields,
  className = "",
}: SearchFiltersProps) {
  const [open, setOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const showKeywordActions = Boolean(keyword && keyword.trim().length > 0);
  const fields = renderFields();
  const showFilterToggle = Boolean(fields);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      // Don't close if clicking on any Radix Select component
      if (
        target?.closest("[data-radix-select-content]") ||
        target?.closest("[data-radix-select-trigger]") ||
        target?.closest("[data-radix-select-item]") ||
        target?.closest("[data-radix-select-viewport]")
      ) {
        return;
      }
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative w-full ${className}`} ref={popoverRef}>
      <div className={`relative w-full ${className}`}>
        <Input
          type="text"
          placeholder="Search by keyword... (minimum 3 characters)"
          value={keyword || ""}
          onChange={(e) => onKeywordChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && isKeywordValid && onSearch()}
          className={`pr-24 rounded-xl ${!isKeywordValid ? "border-red-500" : ""}`}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {showKeywordActions && (
            <>
              <button
                type="button"
                onClick={onSearch}
                className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-white text-slate-600 hover:bg-slate-50"
                aria-label="Search"
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </button>
              <button
                type="button"
                onClick={onKeywordClear}
                className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-white text-slate-600 hover:bg-slate-50"
                aria-label="Clear keyword"
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18" />
                  <path d="M6 6 18 18" />
                </svg>
              </button>
            </>
          )}
          {showFilterToggle && (
            <button
              type="button"
              onClick={() => setOpen((prev) => !prev)}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-white text-slate-600 hover:bg-slate-50"
              aria-label="Toggle filters"
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 5h18" />
                <path d="M6 12h12" />
                <path d="M10 19h4" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* {!isKeywordValid && (
        <p className="text-xs text-red-500 mt-1">
          Please enter at least 3 characters to search
        </p>
      )} */}

      {open && showFilterToggle && (
        <Card className="absolute z-20 mt-2 w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-lg">Search Filters</CardTitle>
          </CardHeader>
          <div className="px-6 pb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              {fields}
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <Button
                  onClick={onSearch}
                  disabled={isLoading || !isKeywordValid}
                >
                  Search
                </Button>
                <Button
                  variant="outline"
                  onClick={onClear}
                  disabled={!hasActiveFilters || isLoading}
                >
                  Clear Filters
                </Button>
              </div>
              <div className="flex items-center gap-2">
                {hasActiveFilters && (
                  <span className="flex items-center text-sm text-muted-foreground">
                    Active filters applied
                  </span>
                )}
                {!isKeywordValid && (
                  <span className="flex items-center text-xs text-red-500">
                    ⚠️ Keyword must be at least 3 characters
                  </span>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
