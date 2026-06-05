import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { body, products } = await req.json();

    if (!body) {
      return NextResponse.json({ error: "Blog body is required" }, { status: 400 });
    }

    if (!process.env.GROQ_API_KEY) {
      console.warn("GROQ_API_KEY not found. Returning original blog.");
      return NextResponse.json({ enhancedBody: body });
    }

    // Prepare a simplified product list to send to the AI
    const productList = products.map((p: any) => ({
      title: p.title,
      url: `/product/${p.id}`,
      category: p.category
    }));

    const systemPrompt = `You are an expert affiliate marketing blog editor.
Your task is to take an existing blog post (Markdown format) and seamlessly weave in affiliate links to the user's available products.
You will be provided with the current blog text and a list of available products (Title + URL).

Rules:
1. Do NOT change the core meaning, tone, or structure of the blog post.
2. Find natural opportunities to mention the available products and turn those mentions into Markdown links.
   Example: If the blog mentions "getting a new jersey" and you have a jersey product, change it to "getting a [new jersey](/product/slug)".
3. Do NOT just dump a list of links at the end. Weave them naturally into sentences.
4. Only use the products provided in the list. Do NOT hallucinate URLs.
5. Return ONLY the enhanced Markdown text. No introductions, no explanations, no wrapping JSON, just the raw Markdown.`;

    const userPrompt = `Available Products:\n${JSON.stringify(productList, null, 2)}\n\nBlog Content to Enhance:\n${body}`;

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
        temperature: 0.5,
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    const enhancedBody = data.choices[0].message.content;

    return NextResponse.json({ enhancedBody });
  } catch (error) {
    console.error("Error enhancing blog:", error);
    // On failure, just return original to prevent data loss
    return NextResponse.json({ error: "Failed to enhance", enhancedBody: null }, { status: 500 });
  }
}
