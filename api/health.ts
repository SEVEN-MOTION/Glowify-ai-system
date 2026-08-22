export default function handler(_req: unknown, res: { status: (code: number) => { json: (body: unknown) => void } }) {
  res.status(200).json({
    status: 'ok',
    service: 'glowify-api',
    environment: 'vercel',
    timestamp: new Date().toISOString(),
  });
}
