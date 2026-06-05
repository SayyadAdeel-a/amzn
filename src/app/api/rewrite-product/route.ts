import { NextResponse } from "next/server";

export async function POST(req: Request) {
  let title = "";
  let description = "";
  
  try {
    const body = await req.json();
    title = body.title || "";
    description = body.description || "";
    const category = body.category || "";

    if (!process.env.GROQ_API_KEY) {
      console.warn("GROQ_API_KEY is not set. Returning original content.");
      return NextResponse.json({ title, description });
    }

    const systemPrompt = `You are a Pinterest content writer for a FIFA 2026 affiliate store.
Your job is to rewrite raw Amazon product data into content that
performs well on Pinterest — punchy, emotional, scroll-stopping.
Always return ONLY valid JSON with no extra text, no markdown,
no code blocks. Just raw JSON.`;

    const userPrompt = `Rewrite this Amazon product for Pinterest:
Title: ${title}
Description: ${description}
Category: ${category}

Rules:
- Pinterest Title: max 100 characters, punchy, include 1-2
  relevant emojis, mention FIFA 2026 or World Cup where natural
- Pinterest Description: max 500 characters, conversational tone,
  2-3 sentences that make someone want to click, end with 4-5
  hashtags: always include #FIFA2026 #WorldCup2026 plus
  2-3 category-relevant tags
- Return ONLY this JSON structure, nothing else:
  { "title": "", "description": "" }`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Groq API error:", errorText);
      throw new Error(`Groq API returned ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    try {
      const parsed = JSON.parse(content);
      if (typeof parsed.title === 'string' && typeof parsed.description === 'string') {
        return NextResponse.json({
          title: parsed.title,
          description: parsed.description
        });
      }
      throw new Error("Invalid JSON structure from Groq");
    } catch (parseError) {
      console.error("Failed to parse Groq JSON response:", content);
      throw parseError;
    }

  } catch (error) {
    console.error("Error in rewrite-product API:", error);
    // Safe fallback to original content as requested
    return NextResponse.json({ title, description });
  }
}
