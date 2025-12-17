import { Suspense } from 'react';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import type { Metadata } from 'next';
import { learningPathRepository } from '@/lib/db/repositories/learning-path-repository';
import { userRepository } from '@/lib/db/repositories/user-repository';
import { LearningWorkspace } from '@/components/learning/learning-workspace';
import { LearningWorkspaceSkeleton } from './loading';
import type { LearningPath } from '@/lib/db/schemas/learning-path';

interface LearningPageProps {
  params: Promise<{ id: string }>;
}

// Parallel auth check - returns user ID or redirects
async function getAuthenticatedUser() {
  const { userId: clerkId } = await auth();
  
  if (!clerkId) {
    redirect('/login');
  }
  
  const user = await userRepository.findByClerkId(clerkId);
  if (!user) {
    redirect('/onboarding');
  }
  
  return user;
}

// Fetch learning path with ownership verification
async function getLearningPath(pathId: string, userId: string): Promise<LearningPath | null> {
  const learningPath = await learningPathRepository.findById(pathId);
  
  if (!learningPath || learningPath.userId !== userId) {
    return null;
  }
  
  return learningPath;
}

// Generate metadata for SEO and social sharing
export async function generateMetadata({ params }: LearningPageProps): Promise<Metadata> {
  const { id } = await params;
  
  try {
    const learningPath = await learningPathRepository.findById(id);
    
    if (!learningPath) {
      return {
        title: 'Learning Path Not Found',
      };
    }
    
    return {
      title: `${learningPath.goal} | Learning`,
      description: `Learning path for ${learningPath.goal} - Level ${learningPath.currentDifficulty}`,
    };
  } catch {
    return {
      title: 'Learning Path',
    };
  }
}

// Main page component with streaming
export default async function LearningPage({ params }: LearningPageProps) {
  const { id } = await params;
  
  // Parallel fetch: auth and learning path lookup happen simultaneously
  const [user, learningPath] = await Promise.all([
    getAuthenticatedUser(),
    learningPathRepository.findById(id),
  ]);
  
  // Verify ownership after parallel fetch
  if (!learningPath || learningPath.userId !== user._id) {
    notFound();
  }
  
  return (
    <Suspense fallback={<LearningWorkspaceSkeleton />}>
      <LearningWorkspace learningPath={learningPath} />
    </Suspense>
  );
}
