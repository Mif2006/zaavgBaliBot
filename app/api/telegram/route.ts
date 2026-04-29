import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return NextResponse.json(
      { error: 'Missing Telegram credentials in environment variables' },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const message = body.message || '⚠️ No message provided';

    // Optional: support HTML or Markdown formatting
    const parseMode = body.parseMode || 'Markdown';

    const telegramUrl = `https://api.telegram.org/bot${token}/sendMessage`;
    
    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: parseMode,
        disable_notification: false, // set to true for silent messages
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Telegram API Error:', data);
      return NextResponse.json(
        { error: 'Failed to send message', details: data.description },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true, telegramResponse: data }, { status: 200 });
  } catch (error) {
    console.error('Route Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}