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
        "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
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

    // ASIN Fallback for Images
    // If Amazon blocks the fetch (e.g., Captcha page), we can still construct the official Affiliate Image URL using the ASIN!
    let finalImage = image.trim();
    if (!finalImage || html.includes("api-services-support@amazon.com")) {
      const asinMatch = url.match(/(?:dp|o|asin|il|product)\/([a-zA-Z0-9]{10})/i);
      const asin = asinMatch ? asinMatch[1] : null;
      if (asin) {
        finalImage = `https://ws-na.amazon-adsystem.com/widgets/q?_encoding=UTF8&Format=_SL500_&ASIN=${asin}&MarketPlace=US&ID=AsinImage&WS=1&ServiceVersion=20070822`;
      }
    }

    return NextResponse.json({
      title: title.trim(),
      description: description.trim(),
      image: finalImage,
      price: price.trim(),
      url: canonicalUrl.trim(),
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    
    // Extract ASIN as an absolute last resort if fetch completely fails
    let fallbackImage = "";
    try {
      const { url } = await req.clone().json();
      const asinMatch = url.match(/(?:dp|o|asin|il|product)\/([a-zA-Z0-9]{10})/i);
      const asin = asinMatch ? asinMatch[1] : null;
      if (asin) {
        fallbackImage = `https://ws-na.amazon-adsystem.com/widgets/q?_encoding=UTF8&Format=_SL500_&ASIN=${asin}&MarketPlace=US&ID=AsinImage&WS=1&ServiceVersion=20070822`;
      }
    } catch(e) {}

    // Never crash, return empty fields but try to salvage the image
    return NextResponse.json({
      title: "",
      description: "",
      image: fallbackImage,
      price: "",
      url: "",
    });
  }
}
