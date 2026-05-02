// Cloudflare Pages Function — POST /api/contact
// Validates the form payload and forwards to email via Brevo (set BREVO_API_KEY in env).
// Falls back to logging if BREVO_API_KEY is missing so the form still resolves in preview.

interface Env {
  BREVO_API_KEY?: string;
  CONTACT_TO?: string;
  CONTACT_FROM?: string;
}

type ContactBody = {
  name?: string;
  email?: string;
  company?: string;
  message?: string;
};

const json = (body: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(body), {
    ...init,
    headers: { 'content-type': 'application/json', ...(init?.headers || {}) }
  });

const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let body: ContactBody;
  try {
    body = (await request.json()) as ContactBody;
  } catch {
    return json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  const name = (body.name || '').trim();
  const email = (body.email || '').trim();
  const company = (body.company || '').trim();
  const message = (body.message || '').trim();

  if (!name || name.length < 2) return json({ ok: false, error: 'name_required' }, { status: 400 });
  if (!email || !isEmail(email)) return json({ ok: false, error: 'email_invalid' }, { status: 400 });
  if (!message || message.length < 10) return json({ ok: false, error: 'message_too_short' }, { status: 400 });

  const to = env.CONTACT_TO || 'abdellah.jaize@gmail.com';
  const from = env.CONTACT_FROM || 'noreply@jaizetech.nl';

  const subject = `New inquiry from ${name}${company ? ` (${company})` : ''}`;
  const text = [
    `Name: ${name}`,
    `Email: ${email}`,
    company ? `Company: ${company}` : null,
    '',
    'Message:',
    message
  ]
    .filter(Boolean)
    .join('\n');

  if (!env.BREVO_API_KEY) {
    console.log('[contact] (no BREVO_API_KEY set — would have sent):', subject, text);
    return json({ ok: true, mode: 'logged' });
  }

  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'api-key': env.BREVO_API_KEY,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      sender: { email: from, name: 'jaizetech.nl' },
      to: [{ email: to, name: 'Abdellah Jaize' }],
      replyTo: { email, name },
      subject,
      textContent: text
    })
  });

  if (!res.ok) {
    const errBody = await res.text();
    console.error('[contact] brevo error', res.status, errBody);
    return json({ ok: false, error: 'send_failed' }, { status: 502 });
  }

  return json({ ok: true });
};
