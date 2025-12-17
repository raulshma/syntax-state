import { NextRequest, NextResponse } from "next/server";
import * as journeyRepo from "@/lib/db/repositories/journey-repository";

/**
 * GET /api/journeys/[slug]
 * Returns static journey data (nodes, edges, milestones, topics, objectives)
 * This data is cacheable as it doesn't include user-specific progress
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const journey = await journeyRepo.findJourneyBySlug(slug);

  if (!journey) {
    return NextResponse.json({ error: "Journey not found" }, { status: 404 });
  }

  // Fetch sub-journeys and parent journey for navigation
  const [subJourneys, parentJourney] = await Promise.all([
    journeyRepo.findSubJourneys(slug),
    journey.parentJourneySlug
      ? journeyRepo.findJourneyBySlug(journey.parentJourneySlug)
      : Promise.resolve(null),
  ]);

  return NextResponse.json(
    {
      journey,
      subJourneys,
      parentJourney,
    },
    {
      headers: {
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    }
  );
}

// Allow caching - journey structure is static
export const revalidate = 3600;
