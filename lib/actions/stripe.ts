'use server';

import { auth, currentUser } from '@clerk/nextjs/server';
import { createCheckoutSession, createCustomerPortalSession } from '@/lib/services/stripe';
import { userRepository } from '@/lib/db/repositories/user-repository';

export type SubscriptionPlan = 'PRO' | 'MAX';

export interface CheckoutResult {
  success: boolean;
  url?: string;
  error?: string;
}

export async function createCheckout(plan: SubscriptionPlan): Promise<CheckoutResult> {
  try {
    const { userId: clerkId } = await auth();
    const user = await currentUser();

    if (!clerkId || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Get or create user in our database
    let dbUser = await userRepository.findByClerkId(clerkId);
    if (!dbUser) {
      dbUser = await userRepository.create({
        clerkId,
        plan: 'FREE',
        preferences: {
          theme: 'dark',
          defaultAnalogy: 'professional',
        },
      });
    }

    const email = user.emailAddresses[0]?.emailAddress;
    if (!email) {
      return { success: false, error: 'No email address found' };
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    const url = await createCheckoutSession({
      userId: dbUser._id,
      clerkId,
      email,
      plan,
      successUrl: `${appUrl}/dashboard?checkout=success`,
      cancelUrl: `${appUrl}/pricing?checkout=cancelled`,
    });

    return { success: true, url };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    const message = error instanceof Error ? error.message : 'Failed to create checkout session';
    return { success: false, error: message };
  }
}


export async function createPortalSession(): Promise<CheckoutResult> {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return { success: false, error: 'Not authenticated' };
    }

    const dbUser = await userRepository.findByClerkId(clerkId);
    if (!dbUser?.stripeCustomerId) {
      return { success: false, error: 'No subscription found' };
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    const url = await createCustomerPortalSession(
      dbUser.stripeCustomerId,
      `${appUrl}/settings`
    );

    return { success: true, url };
  } catch (error) {
    console.error('Error creating portal session:', error);
    const message = error instanceof Error ? error.message : 'Failed to create portal session';
    return { success: false, error: message };
  }
}

export async function getUserSubscriptionStatus() {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return { plan: 'FREE' as const, hasSubscription: false };
    }

    const dbUser = await userRepository.findByClerkId(clerkId);
    if (!dbUser) {
      return { plan: 'FREE' as const, hasSubscription: false };
    }

    return {
      plan: dbUser.plan,
      hasSubscription: !!dbUser.stripeCustomerId,
      iterations: dbUser.iterations,
    };
  } catch (error) {
    console.error('Error getting subscription status:', error);
    return { plan: 'FREE' as const, hasSubscription: false };
  }
}
