/**
 * Journey Data Index
 * Export all predefined journeys for seeding
 */

export { frontendJourney } from './frontend-journey';
export { javascriptJourney } from './javascript-journey';
export { dotnetJourney } from './dotnet-journey';
export { sqlJourney } from './sql-journey';
export { efCoreJourney } from './ef-core-journey';

// Add more journeys here as they are created:
// export { backendJourney } from './backend-journey';
// export { devopsJourney } from './devops-journey';

import { frontendJourney } from './frontend-journey';
import { javascriptJourney } from './javascript-journey';
import { dotnetJourney } from './dotnet-journey';
import { sqlJourney } from './sql-journey';
import { efCoreJourney } from './ef-core-journey';
import type { CreateJourney } from '@/lib/db/schemas/journey';

// All journeys for bulk seeding
export const allJourneys: CreateJourney[] = [
  frontendJourney,
  javascriptJourney,
  dotnetJourney,
  sqlJourney,
  efCoreJourney,
  // Add more here
];

