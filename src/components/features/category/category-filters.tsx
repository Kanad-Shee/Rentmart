import { SlidersHorizontal } from "lucide-react";
import type { CategoryFilter } from "./category-data";

type CategoryFiltersProps = {
  filters: CategoryFilter[];
  onChange: (label: string, value: string) => void;
};

export function CategoryFilters({ filters, onChange }: CategoryFiltersProps) {
  return (
    <div className="grid gap-4 border-t border-border pt-6 md:grid-cols-[repeat(3,minmax(0,180px))_1fr]">
      {filters.map((filter) => (
        <label key={filter.label} className="space-y-2">
          <span className="block text-sm font-medium text-[#5d6f8f]">
            {filter.label}
          </span>
          <select
            value={filter.value}
            onChange={(event) => onChange(filter.label, event.target.value)}
            className="w-full rounded-sm border border-[#dfe4eb] bg-white px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary"
          >
            {(filter.options ?? [filter.value]).map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      ))}

      <div className="flex items-end md:justify-end">
        <button
          type="button"
          className="inline-flex h-11 items-center gap-2 rounded-sm border border-[#dfe4eb] bg-white px-5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Advanced Filters
        </button>
      </div>
    </div>
  );
}
