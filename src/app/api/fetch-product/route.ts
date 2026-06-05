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

    // Use ScraperAPI to bypass Amazon Captcha
    let fetchUrl = url;
    if (process.env.SCRAPER_API_KEY) {
      fetchUrl = `http://api.scraperapi.com?api_key=${process.env.SCRAPER_API_KEY}&url=${encodeURIComponent(url)}`;
    }

    const response = await fetch(fetchUrl, {
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

    // Extract Title & Image
    const title = $('meta[property="og:title"]').attr("content") || $('title').text() || "";
    const image = $('meta[property="og:image"]').attr("content") || "";
    const canonicalUrl = $('meta[property="og:url"]').attr("content") || url;

    // Enhance Description Extraction (Amazon often blocks standard bots from seeing og:description)
    let description = "";
    const bullets: string[] = [];
    $('#feature-bullets ul li span.a-list-item').each((i, el) => {
      const text = $(el).text().trim();
      if (text && text.length > 10) bullets.push(text);
    });
    
    if (bullets.length > 0) {
      description = bullets.slice(0, 5).join(" "); // Take top 5 bullets
    } else {
      description = $('#productDescription p').first().text().trim() || $('meta[name="description"]').attr("content") || "";
    }

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

    // Amazon rating, review count, sales volume and actual review text extraction
    let rating = 5;
    let reviewCount = 0;
    let salesVolume = "";
    const reviews: string[] = [];
    try {
      const ratingText = $("span.a-icon-alt").first().text();
      const ratingMatch = ratingText.match(/([0-9.]+)\s*out of/);
      if (ratingMatch) rating = parseFloat(ratingMatch[1]);

      const reviewText = $("#acrCustomerReviewText").first().text();
      const reviewMatch = reviewText.replace(/,/g, "").match(/([0-9]+)/);
      if (reviewMatch) reviewCount = parseInt(reviewMatch[1], 10);
      
      // Extract Sales Volume (e.g. "500+ bought in past month")
      salesVolume = $("#social-proofing-faceout-title-tk_bought span").text().trim() || 
                    $(".social-proofing-faceout-title-text span").first().text().trim();

      // Extract up to 10 actual written reviews from the page
      $(".review-text-content span").each((i, el) => {
        if (i < 10) {
          const rText = $(el).text().trim();
          if (rText.length > 20) reviews.push(rText); // Ensure it's a substantive review
        }
      });
    } catch (e) {
      console.error("Error parsing reviews:", e);
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

    // Use AI to Categorize the Product
    let category = "jerseys";
    let badge = "none";

    if (process.env.GROQ_API_KEY) {
      try {
        const catRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          },
          body: JSON.stringify({
            model: "llama-3.1-8b-instant",
            messages: [
              { 
                role: "system", 
                content: "You are an AI classifier for an affiliate e-commerce store. Categorize the product. Return ONLY raw JSON in this format: { \"category\": \"jerseys\" | \"balls\" | \"footwear\" | \"accessories\", \"badge\": \"none\" | \"hot\" | \"new\" }. Infer 'hot' if the product seems like a trending/popular item, or 'new' if it explicitly mentions 2026/new release. Return ONLY JSON." 
              },
              { 
                role: "user", 
                content: `Title: ${title}\nDescription: ${description}\nSales Volume: ${salesVolume}` 
              }
            ],
            temperature: 0.1,
            response_format: { type: "json_object" }
          })
        });

        if (catRes.ok) {
          const aiData = await catRes.json();
          const parsed = JSON.parse(aiData.choices[0].message.content);
          if (parsed.category) category = parsed.category;
          if (parsed.badge) badge = parsed.badge;
        }
      } catch (err) {
        console.error("AI Categorization failed, using defaults.", err);
      }
    }

    return NextResponse.json({
      title: title.trim(),
      description: description.trim(),
      image: finalImage,
      price: price.trim(),
      url: canonicalUrl.trim(),
      rating,
      reviewCount,
      reviews,
      salesVolume,
      category,
      badge
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
      reviews: [],
      salesVolume: "",
      category: "jerseys",
      badge: "none"
    });
  }
}
