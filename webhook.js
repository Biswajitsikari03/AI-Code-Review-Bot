import { createHmac } from 'crypto';

function verifySignature(req) {
  const sig = req.headers['x-hub-signature-256'];
  const hmac = createHmac('sha256', process.env.WEBHOOK_SECRET);
  hmac.update(JSON.stringify(req.body));
  const digest = `sha256=${hmac.digest('hex')}`;
  return sig === digest;
}

export function setupWebhooks(app) {
  app.post('/api/webhook', (req, res) => {
    if (!verifySignature(req)) {
      console.log('Invalid signature');
      return res.status(401).send('Unauthorized');
    }

    const event = req.headers['x-github-event'];
    const payload = req.body;

    console.log(`Received event: ${event}`);

   if (event === "pull_request" && (payload.action === "opened" || payload.action === "synchronize")) {
      console.log(`New PR: ${payload.pull_request.title}`);
      console.log(`Repo: ${payload.repository.full_name}`);
      console.log(`PR Number: ${payload.number}`);
    }

    res.status(200).send('OK');
  });
}