'use client';

import { createClient } from '@/lib/supabase/client';
import { Tag } from '@shared/types';
import { PROJECT_COLORS } from '@shared/constants';
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

export default function TagsPage() {
  const supabase = createClient();
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState<string>(PROJECT_COLORS[0]);

  const fetchTags = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('tags').select('*').eq('user_id', user.id).order('name');
    setTags(data || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const resetForm = () => {
    setName('');
    setSelectedColor(PROJECT_COLORS[0]);
    setEditingId(null);
    setShowForm(false);
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    if (editingId) {
      await supabase
        .from('tags')
        .update({ name: name.trim(), color: selectedColor })
        .eq('id', editingId);
    } else {
      await supabase
        .from('tags')
        .insert({ name: name.trim(), color: selectedColor, user_id: user.id });
    }
    resetForm();
    fetchTags();
  };

  const handleEdit = (tag: Tag) => {
    setEditingId(tag.id);
    setName(tag.name);
    setSelectedColor(tag.color || PROJECT_COLORS[0]);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this tag? It will be removed from all tasks.')) return;
    await supabase.from('tags').delete().eq('id', id);
    fetchTags();
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Tags</h1>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="hover:bg-primary-light flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition">
            <Plus size={18} />
            Add Tag
          </button>
        )}
      </div>

      {/* Create / Edit Form */}
      {showForm && (
        <div className="bg-background-secondary mb-6 rounded-xl p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">
            {editingId ? 'Edit Tag' : 'New Tag'}
          </h2>

          <div className="space-y-4">
            {/* Name input */}
            <div>
              <label className="text-text-secondary mb-1.5 block text-sm font-medium">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tag name"
                className="border-border placeholder-text-muted w-full rounded-lg border bg-background px-3 py-2 text-sm text-white outline-none focus:border-primary"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSave();
                  if (e.key === 'Escape') resetForm();
                }}
              />
            </div>

            {/* Color swatches */}
            <div>
              <label className="text-text-secondary mb-1.5 block text-sm font-medium">Color</label>
              <div className="flex flex-wrap gap-2">
                {PROJECT_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className="flex h-8 w-8 items-center justify-center rounded-full transition hover:scale-110"
                    style={{ backgroundColor: color }}>
                    {selectedColor === color && <Check size={16} className="text-white" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Form actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSave}
                disabled={!name.trim()}
                className="hover:bg-primary-light rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white transition disabled:opacity-50">
                {editingId ? 'Save Changes' : 'Create Tag'}
              </button>
              <button
                onClick={resetForm}
                className="border-border text-text-secondary rounded-lg border px-5 py-2 text-sm transition hover:text-white">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tag list */}
      {tags.length === 0 ? (
        <div className="bg-background-secondary rounded-xl p-8 text-center">
          <p className="text-text-muted">No tags yet. Create one to organize your tasks!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {tags.map((tag) => (
            <div
              key={tag.id}
              className="bg-background-secondary hover:bg-background-tertiary flex items-center justify-between rounded-xl p-4 transition">
              <div className="flex items-center gap-3">
                <div
                  className="h-4 w-4 shrink-0 rounded-full"
                  style={{ backgroundColor: tag.color || '#6b7280' }}
                />
                <span className="font-medium text-white">{tag.name}</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleEdit(tag)}
                  className="text-text-secondary rounded-lg p-2 transition hover:bg-background hover:text-primary"
                  title="Edit">
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => handleDelete(tag.id)}
                  className="text-text-secondary rounded-lg p-2 transition hover:bg-background hover:text-danger"
                  title="Delete">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
