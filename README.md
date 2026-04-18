# AI Code Review Bot

A GitHub App that automatically reviews pull requests using AI (Groq LLaMA 3.3 70B).

## What it does

When a pull request is opened, the bot:
1. Fetches the PR diff
2. Sends it to Groq LLM for analysis
3. Posts a review comment covering bugs, security issues, code quality, and performance

## Tech Stack

- Node.js + Express
- GitHub Apps API + Octokit
- Groq API (LLaMA 3.3 70B)
- Smee.io (webhook proxy for local dev)

## Setup

1. Clone the repo
2. Install dependencies: `npm install`
3. Create a GitHub App with Pull Request read/write permissions
4. Add `.env` file:

```env
APP_ID=your_app_id
PRIVATE_KEY_PATH=./your-key.pem
WEBHOOK_SECRET=your_secret
WEBHOOK_PROXY_URL=https://smee.io/your_channel
GROQ_API_KEY=your_groq_key
PORT=3000
```

5. Run: `node src/index.js`

## Demo

Bot automatically reviews PRs and posts structured feedback:

- Bugs and potential errors
- Security issues  
- Code quality and best practices
- Performance concerns
