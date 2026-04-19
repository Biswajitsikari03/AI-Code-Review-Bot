import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { setupWebhooks } from "./webhook.js";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Chaseot AI Code Review Bot is running ??");
});

setupWebhooks(app);

const server = createServer(app);

server.listen(process.env.PORT || 3000, () => {
  console.log(`Bot running on port ${process.env.PORT || 3000}`);

  if (process.env.WEBHOOK_PROXY_URL) {
    import("smee-client").then(({ default: SmeeClient }) => {
      const smee = new SmeeClient({
        source: process.env.WEBHOOK_PROXY_URL,
        target: `http://localhost:${process.env.PORT || 3000}/api/webhook`,
        logger: console
      });
      smee.start();
      console.log("Smee client started (dev mode)");
    });
  }
});
