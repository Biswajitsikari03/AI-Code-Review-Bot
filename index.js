import 'dotenv/config';
import express from 'express';
import SmeeClient from 'smee-client';
import { setupWebhooks } from './webhook.js';

const app = express();
app.use(express.json());

// Start Smee proxy
const smee = new SmeeClient({
  source: process.env.WEBHOOK_PROXY_URL,
  target: `http://localhost:${process.env.PORT}/api/webhook`,
  logger: console
});
smee.start();

// Setup webhook handler
setupWebhooks(app);

app.listen(process.env.PORT, () => {
  console.log(`Bot running on port ${process.env.PORT}`);
});