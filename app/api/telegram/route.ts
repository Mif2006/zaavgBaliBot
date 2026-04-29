import { NextResponse } from 'next/server';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// CORS Helper
const corsHeaders = (origin: string) => ({
  'Access-Control-Allow-Origin': origin,
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
});

export async function OPTIONS(request: Request) {
  const origin = request.headers.get('origin') || '*';
  return new NextResponse(null, { status: 204, headers: corsHeaders(origin) });
}

export async function POST(request: Request) {
  const origin = request.headers.get('origin') || '*';

  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    return NextResponse.json(
      { error: 'Missing Telegram credentials' },
      { status: 500, headers: corsHeaders(origin) }
    );
  }

  try {
    const body = await request.json();
    const message = body.message || '⚠️ No message provided';
    const parseMode = body.parseMode || 'Markdown';

    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    
    const telegramRes = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: parseMode,
      }),
    });

    const data = await telegramRes.json();

    if (!telegramRes.ok) {
      console.error('Telegram API Error:', data);
      return NextResponse.json(
        { error: 'Failed to send message', details: data.description },
        { status: telegramRes.status, headers: corsHeaders(origin) }
      );
    }

    return NextResponse.json(
      { success: true, telegramResponse: data },
      { status: 200, headers: corsHeaders(origin) }
    );
  } catch (error) {
    console.error('Route Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders(origin) }
    );
  }
}