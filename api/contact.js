export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ error: 'Method not allowed' });
  }

  const accessKey = process.env.STATIC_FORMS_ACCESS_KEY;
  const endpoint = process.env.STATIC_FORMS_ENDPOINT || 'https://api.staticforms.xyz/submit';
  const to = process.env.GADAR_CONTACT_EMAIL || 'hello@gadarsolutions.com';

  if (!accessKey) {
    return response.status(503).json({ error: 'STATIC_FORMS_ACCESS_KEY is not configured' });
  }

  try {
    const payload = {
      ...request.body,
      accessKey,
      subject: 'New Gadar Global website inquiry',
      replyTo: request.body?.email,
      email: to,
    };
    const submit = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!submit.ok) throw new Error(`Static Forms returned ${submit.status}`);
    return response.status(200).json({ ok: true });
  } catch {
    return response.status(502).json({ error: 'Unable to submit contact form' });
  }
}
