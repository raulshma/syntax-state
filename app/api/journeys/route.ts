import { NextResponse } from "next/server";
import * as journeyRepo from "@/lib/db/repositories/journey-repository";

/**
 * GET /api/journeys
 * Returns all available journeys (static data, no user progress)
 * This data is cacheable
 */
export async function GET() {
  const journeys = await journeyRepo.findAllJourneys();

  return NextResponse.json(
    { journeys },
    {
      headers: {
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    }
  );
}

// Allow caching - journey list is static
export const revalidate = 3600;
