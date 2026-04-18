import { createHmac } from "crypto";
import { App } from "@octokit/app";
import { reviewCode } from "./reviewer.js";

const app = new App({
  appId: process.env.APP_ID,
  privateKey: process.env.PRIVATE_KEY,
  webhooks: { secret: process.env.WEBHOOK_SECRET }
});

function verifySignature(req) {
  const sig = req.headers["x-hub-signature-256"];
  const hmac = createHmac("sha256", process.env.WEBHOOK_SECRET);
  hmac.update(JSON.stringify(req.body));
  const digest = `sha256=${hmac.digest("hex")}`;
  return sig === digest;
}

export function setupWebhooks(expressApp) {
  expressApp.post("/api/webhook", async (req, res) => {
    if (!verifySignature(req)) {
      console.log("Invalid signature");
      return res.status(401).send("Unauthorized");
    }

    const event = req.headers["x-github-event"];
    const payload = req.body;

    console.log(`Received event: ${event}, action: ${payload.action}`);

    if (event === "pull_request" && payload.action === "opened") {
      console.log(`New PR: ${payload.pull_request.title}`);
      res.status(200).send("OK");

      try {
        const installationId = payload.installation.id;
        const octokit = await app.getInstallationOctokit(installationId);

        const owner = payload.repository.owner.login;
        const repo = payload.repository.name;
        const pull_number = payload.number;

        console.log(`Fetching diff for ${owner}/${repo} PR#${pull_number}`);
        const { data: files } = await octokit.request(
          "GET /repos/{owner}/{repo}/pulls/{pull_number}/files",
          { owner, repo, pull_number }
        );
        console.log(`Got ${files.length} files`);

        const diff = files
          .map(f => `File: ${f.filename}\n${f.patch || ""}`)
          .join("\n\n");

        console.log("Sending to Groq...");
        const review = await reviewCode(diff, payload.pull_request.title);
        console.log("Got review from Groq");

        console.log("Posting comment...");
        await octokit.request(
          "POST /repos/{owner}/{repo}/issues/{issue_number}/comments",
          {
            owner,
            repo,
            issue_number: pull_number,
            body: `## ?? AI Code Review\n\n${review}`
          }
        );
        console.log("Comment posted successfully!");

      } catch (err) {
        console.error("FULL ERROR:", err);
      }
    } else {
      res.status(200).send("OK");
    }
  });
}
