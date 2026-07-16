import Anthropic from "@anthropic-ai/sdk";

export interface PersonalizationResult {
  verdict: boolean;
  icebreaker: string;
  shortenedCompanyName: string;
}

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
    max_tokens: 300,
    messages: [{ role: "user", content: filledPrompt }],
  });
  const raw = (message.content[0] as { type: string; text: string }).text.trim();

  // Try to parse as JSON icebreaker format; fall back to raw text
  try {
    const parsed: PersonalizationResult = JSON.parse(raw);
    if (parsed.verdict === false || parsed.verdict === "false" as unknown as boolean) return "";
    return parsed.icebreaker ?? raw;
  } catch {
    return raw;
  }
}
