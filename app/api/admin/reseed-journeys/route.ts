import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth/get-user';
import { seedJourneys } from '@/lib/actions/seed-journeys';

export async function POST() {
  const userIsAdmin = await isAdmin();
  
  if (!userIsAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const result = await seedJourneys();
    return NextResponse.json({ 
      success: true, 
      message: `Re-seeded ${result.seeded} journeys`,
      slugs: result.slugs 
    });
  } catch (error) {
    console.error('Failed to reseed journeys:', error);
    return NextResponse.json({ error: 'Failed to reseed' }, { status: 500 });
  }
}
