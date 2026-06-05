import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Set aggressive timeout using AbortController (8 seconds)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Failed to fetch page: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract OG tags
    const title = $('meta[property="og:title"]').attr("content") || $('title').text() || "";
    const description = $('meta[property="og:description"]').attr("content") || $('meta[name="description"]').attr("content") || "";
    const image = $('meta[property="og:image"]').attr("content") || "";
    const canonicalUrl = $('meta[property="og:url"]').attr("content") || url;

    // Amazon price extraction can be tricky, try multiple selectors
    let price = "";
    const ogPrice = $('meta[property="product:price:amount"]').attr("content");
    if (ogPrice) {
      price = ogPrice;
    } else {
      const priceWhole = $(".a-price-whole").first().text().replace(/[^0-9.]/g, "");
      const priceFraction = $(".a-price-fraction").first().text().replace(/[^0-9]/g, "") || "00";
      if (priceWhole) {
        price = `${priceWhole}.${priceFraction}`;
      }
    }

    return NextResponse.json({
      title: title.trim(),
      description: description.trim(),
      image: image.trim(),
      price: price.trim(),
      url: canonicalUrl.trim(),
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    // Never crash, return empty fields
    return NextResponse.json({
      title: "",
      description: "",
      image: "",
      price: "",
      url: "",
    });
  }
}
