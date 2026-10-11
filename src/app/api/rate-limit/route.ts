import { NextResponse } from "next/server";
import { fetchRateLimit } from "@/lib/github";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rateLimit = await fetchRateLimit();
    return NextResponse.json(rateLimit);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch rate limit" },
      { status: 500 }
    );
  }
}
