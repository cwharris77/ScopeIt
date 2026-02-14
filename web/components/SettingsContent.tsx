'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function SettingsContent() {
  const supabase = createClient();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? '');
    });
  }, [supabase.auth]);

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        alert('You must be signed in to delete your account.');
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/delete-account`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete account');
      }

      await supabase.auth.signOut();
      router.push('/login');
      router.refresh();
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Something went wrong';
      alert(msg);
    } finally {
      setDeleting(false);
      setShowConfirm(false);
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-white">Settings</h1>

      <div className="rounded-xl bg-background-secondary p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Account</h2>
        <div className="flex items-center gap-3 text-text-secondary">
          <span className="text-sm">Email:</span>
          <span className="text-sm text-white">{email}</span>
        </div>
      </div>

      <div className="rounded-xl bg-background-secondary p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Legal</h2>
        <div className="space-y-3">
          <a
            href="/privacy"
            target="_blank"
            className="flex items-center gap-2 text-sm text-text-secondary hover:text-white transition"
          >
            Privacy Policy
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
          <a
            href="/terms"
            target="_blank"
            className="flex items-center gap-2 text-sm text-text-secondary hover:text-white transition"
          >
            Terms of Service
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        </div>
      </div>

      <div className="rounded-xl bg-background-secondary p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Danger Zone</h2>
        <p className="text-sm text-text-muted mb-4">
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>
        {!showConfirm ? (
          <button
            onClick={() => setShowConfirm(true)}
            className="rounded-lg bg-danger/10 px-4 py-2 text-sm font-medium text-danger hover:bg-danger/20 transition"
          >
            Delete Account
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={handleDeleteAccount}
              disabled={deleting}
              className="rounded-lg bg-danger px-4 py-2 text-sm font-medium text-white hover:bg-danger/80 transition disabled:opacity-50"
            >
              {deleting ? 'Deleting...' : 'Yes, delete my account'}
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              className="rounded-lg px-4 py-2 text-sm font-medium text-text-secondary hover:text-white transition"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
