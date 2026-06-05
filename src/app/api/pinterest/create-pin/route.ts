import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { title, description, image, affiliateLink, category } = await req.json();

    const token = process.env.PINTEREST_ACCESS_TOKEN;
    const boardId = process.env.PINTEREST_BOARD_ID;

    if (!token || !boardId) {
      return NextResponse.json({
        success: false,
        error: "Pinterest API credentials not configured in .env.local",
      });
    }

    const payload = {
      board_id: boardId,
      title: title.substring(0, 100), // Pinterest strict max 100
      description: description.substring(0, 500), // Max 500
      link: affiliateLink,
      media_source: {
        source_type: "image_url",
        url: image,
      },
    };

    const response = await fetch("https://api.pinterest.com/v5/pins", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (response.status === 403) {
      return NextResponse.json({
        success: false,
        error: "Pinterest token invalid or expired",
      });
    }

    if (response.status === 429) {
      return NextResponse.json({
        success: false,
        error: "Pinterest rate limit hit, try again in 1 hour",
      });
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Pinterest API error:", errorText);
      return NextResponse.json({
        success: false,
        error: `Pinterest API error: ${response.statusText}`,
      });
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      pin_id: data.id,
    });
  } catch (error: any) {
    console.error("Error creating Pinterest pin:", error);
    // Never throw unhandled errors
    return NextResponse.json({
      success: false,
      error: error.message || "Internal server error while creating pin",
    });
  }
}
