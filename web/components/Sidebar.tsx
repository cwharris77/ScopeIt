'use client';

import { createClient } from '@/lib/supabase/client';
import { BarChart3, LayoutDashboard, LogOut, Settings, Tag } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const navItems = [
  { href: '/', label: 'Tasks', icon: LayoutDashboard },
  { href: '/tags', label: 'Tags', icon: Tag },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState<string>('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? '');
    });
  }, [supabase.auth]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <aside className="border-border bg-background-secondary fixed left-0 top-0 flex h-screen w-64 flex-col overflow-y-auto border-r">
      <div className="p-6">
        <h1 className="text-xl font-bold text-white">
          Scoped<span className="text-primary">In</span>
        </h1>
      </div>

      <nav className="flex-1 px-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-text-secondary hover:bg-background-tertiary hover:text-white'
              }`}>
              <item.icon size={20} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-border border-t p-4">
        <p className="text-text-muted mb-3 truncate text-xs">{email}</p>
        <button
          onClick={handleSignOut}
          className="text-text-secondary flex items-center gap-2 text-sm transition hover:text-danger">
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
