'use client';

import { Tag } from '@shared/types';
import { SORT_OPTIONS, type SortOption } from '@shared/constants';

interface FilterBarProps {
  tags: Tag[];
  selectedTagIds: Set<string>;
  onTagToggle: (tagId: string) => void;
  onClearFilters: () => void;
  sortOption: SortOption;
  onSortChange: (sort: SortOption) => void;
}

export function FilterBar({
  tags,
  selectedTagIds,
  onTagToggle,
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
            selectedTagIds.size === 0
              ? 'bg-primary text-white'
              : 'bg-background-tertiary text-text-secondary hover:text-white'
          }`}>
          All
        </button>
        {tags.map((tag) => {
          const isActive = selectedTagIds.has(tag.id);
          return (
            <button
              key={tag.id}
              onClick={() => onTagToggle(tag.id)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                isActive
                  ? 'text-white'
                  : 'bg-background-tertiary text-text-secondary hover:text-white'
              }`}
              style={isActive ? { backgroundColor: tag.color || '#087f8c' } : undefined}>
              {tag.name}
            </button>
          );
        })}
      </div>

      <select
        value={sortOption}
        onChange={(e) => onSortChange(e.target.value as SortOption)}
        className="border-border bg-background-secondary text-text-primary rounded-lg border px-3 py-1.5 text-sm outline-none focus:border-primary">
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
