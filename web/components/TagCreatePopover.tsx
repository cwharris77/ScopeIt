'use client';

import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { PROJECT_COLORS } from '@shared/constants';
import { Tag } from '@shared/types';
import { Plus } from 'lucide-react';

interface TagCreatePopoverProps {
  onTagCreated: (tag: Tag) => void;
}

export function TagCreatePopover({ onTagCreated }: TagCreatePopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState<string>('#6b7280');
  const [creating, setCreating] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    setTimeout(() => inputRef.current?.focus(), 50);

    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleCreate = async () => {
    if (!name.trim() || creating) return;
    setCreating(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setCreating(false);
      return;
    }

    const { data, error } = await supabase
      .from('tags')
      .insert({ name: name.trim(), color, user_id: user.id })
      .select()
      .single();

    if (data && !error) {
      onTagCreated(data);
      setName('');
      setColor('#6b7280');
      setIsOpen(false);
    }
    setCreating(false);
  };

  return (
    <div className="relative" ref={popoverRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="bg-background-tertiary text-text-secondary flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium transition hover:text-white">
        <Plus size={14} />
        New
      </button>

      {isOpen && (
        <div className="border-border bg-background-secondary absolute top-full left-0 z-50 mt-2 w-64 rounded-xl border p-4 shadow-xl">
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                void handleCreate();
              }
            }}
            placeholder="Tag name"
            className="border-border placeholder-text-muted w-full rounded-lg border bg-background px-3 py-2 text-sm text-white outline-none focus:border-primary"
          />

          <div className="mt-3 flex gap-2">
            {PROJECT_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`h-6 w-6 rounded-full transition ${
                  color === c
                    ? 'ring-2 ring-white ring-offset-2 ring-offset-background-secondary'
                    : ''
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => void handleCreate()}
            disabled={!name.trim() || creating}
            className="mt-3 w-full rounded-lg bg-primary py-1.5 text-sm font-semibold text-white transition hover:bg-primary-light disabled:opacity-50">
            {creating ? 'Creating...' : 'Create'}
          </button>
        </div>
      )}
    </div>
  );
}
