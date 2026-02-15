import { type NextRequest } from 'next/server';

// Mock @supabase/ssr before importing updateSession
const mockGetUser = vi.fn();

vi.mock('@supabase/ssr', () => ({
  createServerClient: () => ({
    auth: {
      getUser: mockGetUser,
    },
  }),
}));

// Mock next/server
const mockRedirect = vi.fn((url: URL) => ({
  type: 'redirect',
  url: url.toString(),
  cookies: { set: vi.fn() },
}));

vi.mock('next/server', () => ({
  NextResponse: {
    next: ({ request }: any) => ({
      type: 'next',
      cookies: { set: vi.fn() },
      request,
    }),
    redirect: (url: URL) => mockRedirect(url),
  },
}));

import { updateSession } from '@/lib/supabase/middleware';

function mockRequest(pathname: string): NextRequest {
  const url = new URL(`http://localhost:3000${pathname}`);
  // NextRequest.nextUrl has a clone() method — plain URL does too
  return {
    nextUrl: Object.assign(url, {
      clone: () => new URL(url.toString()),
    }),
    cookies: {
      getAll: () => [],
      set: vi.fn(),
    },
  } as unknown as NextRequest;
}

describe('updateSession', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
  });

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  });

  it('redirects unauthenticated user on protected path to /login', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const result = await updateSession(mockRequest('/dashboard'));
    expect(mockRedirect).toHaveBeenCalled();
    const redirectUrl = mockRedirect.mock.calls[0][0];
    expect(redirectUrl.pathname).toBe('/login');
  });

  it('passes through unauthenticated user on public paths', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    for (const path of ['/login', '/privacy', '/terms', '/delete-account']) {
      mockRedirect.mockClear();
      const result: any = await updateSession(mockRequest(path));
      expect(mockRedirect).not.toHaveBeenCalled();
      expect(result.type).toBe('next');
    }
  });

  it('redirects authenticated user on /login to /', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });

    await updateSession(mockRequest('/login'));
    expect(mockRedirect).toHaveBeenCalled();
    const redirectUrl = mockRedirect.mock.calls[0][0];
    expect(redirectUrl.pathname).toBe('/');
  });

  it('passes through authenticated user on protected path', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });

    const result: any = await updateSession(mockRequest('/dashboard'));
    expect(mockRedirect).not.toHaveBeenCalled();
    expect(result.type).toBe('next');
  });

  it('passes through when env vars are missing', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const result: any = await updateSession(mockRequest('/dashboard'));
    expect(mockRedirect).not.toHaveBeenCalled();
    expect(result.type).toBe('next');
  });
});
