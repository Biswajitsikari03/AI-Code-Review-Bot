import "dotenv/config";
import express from "express";
import { createServer } from "http";
import SmeeClient from "smee-client";
import { setupWebhooks } from "./webhook.js";

const app = express();
app.use(express.json());

setupWebhooks(app);

const server = createServer(app);

server.listen(process.env.PORT, () => {
  console.log(`Bot running on port ${process.env.PORT}`);
  
  const smee = new SmeeClient({
    source: process.env.WEBHOOK_PROXY_URL,
    target: `http://localhost:${process.env.PORT}/api/webhook`,
    logger: console
  });
  
  const events = smee.start();
  console.log("Smee client started");
});
