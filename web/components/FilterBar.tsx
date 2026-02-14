'use client';

import {
  CATEGORIES,
  CATEGORY_ALL,
  SORT_OPTIONS,
  type SortOption,
} from '@shared/constants';

interface FilterBarProps {
  categories: readonly string[];
  selectedCategories: Set<string>;
  onCategoryToggle: (category: string) => void;
  onClearFilters: () => void;
  sortOption: SortOption;
  onSortChange: (sort: SortOption) => void;
}

export function FilterBar({
  categories,
  selectedCategories,
  onCategoryToggle,
  onClearFilters,
  sortOption,
  onSortChange,
}: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={onClearFilters}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
            selectedCategories.size === 0
              ? 'bg-primary text-white'
              : 'bg-background-tertiary text-text-secondary hover:text-white'
          }`}
        >
          {CATEGORY_ALL}
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onCategoryToggle(cat)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize transition ${
              selectedCategories.has(cat)
                ? 'bg-primary text-white'
                : 'bg-background-tertiary text-text-secondary hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <select
        value={sortOption}
        onChange={(e) => onSortChange(e.target.value as SortOption)}
        className="rounded-lg border border-border bg-background-secondary px-3 py-1.5 text-sm text-text-primary outline-none focus:border-primary"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
