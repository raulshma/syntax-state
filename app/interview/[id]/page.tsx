import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { interviewRepository } from "@/lib/db/repositories/interview-repository";
import { userRepository } from "@/lib/db/repositories/user-repository";
import { InterviewWorkspace } from "@/components/interview/interview-workspace";
import type { Interview } from "@/lib/db/schemas/interview";
import type { UserPlan } from "@/lib/db/schemas/user";

interface InterviewPageProps {
  params: Promise<{ id: string }>;
}

interface InterviewPageData {
  interview: Interview;
  userPlan: UserPlan;
}

async function getInterviewData(
  interviewId: string
): Promise<InterviewPageData | null> {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    redirect("/login");
  }

  // Parallel fetch: user and interview at the same time
  const [user, interview] = await Promise.all([
    userRepository.findByClerkId(clerkId),
    interviewRepository.findById(interviewId),
  ]);

  if (!user) {
    redirect("/onboarding");
  }

  if (!interview) {
    return null;
  }

  // Verify ownership (unless public)
  if (interview.userId !== user._id && !interview.isPublic) {
    return null;
  }

  return {
    interview,
    userPlan: user.plan,
  };
}

export default async function InterviewPage({ params }: InterviewPageProps) {
  const { id } = await params;
  const data = await getInterviewData(id);

  if (!data) {
    notFound();
  }

  return <InterviewWorkspace interview={data.interview} userPlan={data.userPlan} />;
}
