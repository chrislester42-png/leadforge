import Anthropic from "@anthropic-ai/sdk";

export async function generatePersonalization(
  prompt: string,
  lead: { firstname: string; lastname: string; title: string; company: string; location: string },
  apiKey: string
): Promise<string> {
  const client = new Anthropic({ apiKey });
  const filledPrompt = prompt
    .replace(/\{\{firstname\}\}/g, lead.firstname)
    .replace(/\{\{lastname\}\}/g, lead.lastname)
    .replace(/\{\{title\}\}/g, lead.title)
    .replace(/\{\{company\}\}/g, lead.company)
    .replace(/\{\{location\}\}/g, lead.location);

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 150,
    messages: [{ role: "user", content: filledPrompt }],
  });
  return (message.content[0] as { type: string; text: string }).text.trim();
}
