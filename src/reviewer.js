import Groq from "groq-sdk";

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function reviewCode(diff, prTitle) {
  const message = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `You are an expert code reviewer. Review this pull request and provide specific, actionable feedback.

PR Title: ${prTitle}

Code diff:
${diff}

Provide feedback on:
1. Bugs or potential errors
2. Security issues
3. Code quality and best practices
4. Performance concerns

Be concise and specific. Format as bullet points.`
      }
    ]
  });

  return message.choices[0].message.content;
}
