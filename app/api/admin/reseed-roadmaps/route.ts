import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth/get-user';
import { seedRoadmaps } from '@/lib/actions/seed-roadmaps';

export async function POST() {
  const userIsAdmin = await isAdmin();
  
  if (!userIsAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const result = await seedRoadmaps();
    return NextResponse.json({ 
      success: true, 
      message: `Re-seeded ${result.seeded} roadmaps`,
      slugs: result.slugs 
    });
  } catch (error) {
    console.error('Failed to reseed roadmaps:', error);
    return NextResponse.json({ error: 'Failed to reseed' }, { status: 500 });
  }
}
