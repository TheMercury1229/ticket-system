import { createAgent, gemini } from "@inngest/agent";
const SYSTEM_PROMPT = `You are an expert AI assistant that processes technical support tickets. 

Your job is to:
1. Summarize the issue.
2. Estimate its priority.
3. Provide helpful notes and resource links for human moderators.
4. List relevant technical skills required.

IMPORTANT:
- Respond with *only* valid raw JSON.
- Do NOT include markdown, code fences, comments, or any extra formatting.
- The format must be a raw JSON object.

Repeat: Do not wrap your output in markdown or code fences.`;
const USER_PROMPT = `You are a ticket triage agent. Only return a strict JSON object with no extra text, headers, or markdown.
        
Analyze the following support ticket and provide a JSON object with:

- summary: A short 1-2 sentence summary of the issue.
- priority: One of "low", "medium", or "high".
- helpfulNotes: A detailed technical explanation that a moderator can use to solve this issue. Include useful external links or resources if possible.
- relatedSkills: An array of relevant skills required to solve the issue (e.g., ["React", "MongoDB"]).

Respond ONLY in this JSON format and do not include any other text or markdown in the answer:

{
"summary": "Short summary of the ticket",
"priority": "high",
"helpfulNotes": "Here are useful tips...",
"relatedSkills": ["React", "Node.js"]
}

---

Ticket information:

- Title: ${ticket.title}
- Description: ${ticket.description}`;
const analyzeTicket = async (ticket) => {
  const agent = createAgent({
    name: "ai-ticket-triage-assistant",
    system: SYSTEM_PROMPT,
    model: gemini({
      model: "gemini-2.0-flash",
      apiKey: process.env.GEMINI_API_KEY,
    }),
  });

  const result = await agent.run(USER_PROMPT);
  const res = result.output[0].context;
  //  make sure we sanitise the response
  try {
    // removing the ```json and ```
    const match = res.match(/```json\s*([\s\S]*?)\s*```/i);
    const jsonString = match ? match[1] : res.trim();
    return JSON.parse(jsonString);
  } catch (e) {
    console.log("Failed to parse JSON from AI response" + e.message);
    return null;
  }
};

export default analyzeTicket;
