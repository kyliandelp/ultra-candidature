export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const webhookUrl = process.env.AIRTABLE_WEBHOOK_URL;
  if (!webhookUrl) {
    res.status(500).json({ error: 'AIRTABLE_WEBHOOK_URL is not configured' });
    return;
  }

  try {
    const body = req.body && typeof req.body === 'object' ? req.body : JSON.parse(req.body || '{}');

    const airtableRes = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!airtableRes.ok) {
      const text = await airtableRes.text().catch(() => '');
      res.status(502).json({ error: 'Airtable webhook error', detail: text });
      return;
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Unexpected error', detail: String(err && err.message || err) });
  }
}
