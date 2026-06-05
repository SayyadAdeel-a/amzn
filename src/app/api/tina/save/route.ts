import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  try {
    const payload = await req.json();

    if (!payload.title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // Generate a safe slug from the title
    const slug = payload.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    const filePath = path.join(process.cwd(), "content/products", `${slug}.json`);

    // Ensure the payload matches the TinaCMS schema format
    const tinaPayload = {
      title: payload.title,
      description: payload.description,
      price: payload.price,
      originalPrice: payload.originalPrice,
      affiliateLink: payload.affiliateLink,
      image: payload.image,
      category: payload.category,
      badge: payload.badge,
      rating: payload.rating,
      reviewCount: payload.reviewCount,
      featured: payload.featured,
      publishedAt: payload.publishedAt,
    };

    await fs.writeFile(filePath, JSON.stringify(tinaPayload, null, 2), "utf-8");

    return NextResponse.json({ success: true, slug });
  } catch (error) {
    console.error("Error saving to TinaCMS file system:", error);
    return NextResponse.json({ error: "Failed to save product" }, { status: 500 });
  }
}
