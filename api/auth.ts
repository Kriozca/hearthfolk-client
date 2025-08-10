import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { sql } from '@vercel/postgres';

function verifyTelegramInitData(initData: string, botToken: string) {
  const secretKey = crypto.createHash('sha256').update(botToken).digest();
  const urlParams = new URLSearchParams(initData);
  const hash = urlParams.get('hash') || '';
  urlParams.delete('hash');

  const dataCheckString = Array.from(urlParams.entries())
    .map(([key, value]) => `${key}=${value}`)
    .sort()
    .join('\n');

  const hmac = crypto.createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  return hmac === hash;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { initData } = (req.body ?? {}) as { initData?: string };
  if (!initData) return res.status(400).json({ error: 'initData required' });

  const botToken = process.env.BOT_TOKEN;
  if (!botToken) return res.status(500).json({ error: 'BOT_TOKEN not set' });

  // 1) Проверяем подпись initData
  const ok = verifyTelegramInitData(initData, botToken);
  if (!ok) return res.status(403).json({ error: 'Invalid initData' });

  // 2) Достаём user из initData
  const params = new URLSearchParams(initData);
  const userRaw = params.get('user');
  let user: { id: number; first_name?: string; username?: string } | null = null;
  try {
    user = userRaw ? JSON.parse(userRaw) : null;
  } catch {
    return res.status(400).json({ error: 'Bad user payload' });
  }
  if (!user?.id) return res.status(400).json({ error: 'No user.id' });

  const telegramId = String(user.id);
  const displayName = user.first_name || user.username || 'Игрок';

  try {
    // 3) Создаём таблицу при необходимости
    await sql/*sql*/`
      CREATE TABLE IF NOT EXISTS players (
        telegram_id TEXT PRIMARY KEY,
        name        TEXT NOT NULL,
        level       INTEGER NOT NULL DEFAULT 1,
        xp          INTEGER NOT NULL DEFAULT 0,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `;

    // 4) Апсерт игрока
    const { rows } = await sql/*sql*/`
      INSERT INTO players (telegram_id, name)
      VALUES (${telegramId}, ${displayName})
      ON CONFLICT (telegram_id) DO UPDATE SET
        name = EXCLUDED.name,
        updated_at = NOW()
      RETURNING telegram_id, name, level, xp;
    `;

    const row = rows[0];
    return res.json({
      id: row.telegram_id as string,
      name: row.name as string,
      level: Number(row.level),
      xp: Number(row.xp),
    });
  } catch (e: any) {
    console.error('DB error', e);
    return res.status(500).json({ error: 'DB failed', details: e?.message });
  }
}
