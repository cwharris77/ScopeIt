const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:8081',
  'https://scopedin.app',
  'https://www.scopedin.app',
  'https://scoped-in-ckb6azbez-cwharris77s-projects.vercel.app',
];

export function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('Origin') ?? '';
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : '';

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin',
  };
}
