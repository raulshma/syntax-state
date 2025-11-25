import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { WebhookEvent } from '@clerk/nextjs/server';
import { userRepository } from '@/lib/db/repositories/user-repository';

export async function POST(request: NextRequest) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error('Missing CLERK_WEBHOOK_SECRET environment variable');
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 }
    );
  }

  // Get the headers
  const svix_id = request.headers.get('svix-id');
  const svix_timestamp = request.headers.get('svix-timestamp');
  const svix_signature = request.headers.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json(
      { error: 'Missing svix headers' },
      { status: 400 }
    );
  }

  // Get the body
  const body = await request.text();

  // Create a new Svix instance with your secret
  const wh = new Webhook(WEBHOOK_SECRET);

  let event: WebhookEvent;

  // Verify the payload with the headers
  try {
    event = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Webhook signature verification failed:', message);
    return NextResponse.json(
      { error: `Webhook Error: ${message}` },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'user.created':
        await handleUserCreated(event);
        break;

      default:
        console.log(`Unhandled Clerk event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Error processing Clerk webhook:', message);
    return NextResponse.json(
      { error: `Webhook handler error: ${message}` },
      { status: 500 }
    );
  }
}

async function handleUserCreated(event: WebhookEvent) {
  if (event.type !== 'user.created') return;

  const { id: clerkId } = event.data;

  // Check if user already exists (idempotency)
  const existingUser = await userRepository.findByClerkId(clerkId);
  if (existingUser) {
    console.log(`User ${clerkId} already exists, skipping creation`);
    return;
  }

  // Create user with default FREE plan settings
  // Requirements 1.2: default FREE plan, iteration count 0, limit 5
  const user = await userRepository.create({
    clerkId,
    plan: 'FREE',
    preferences: {
      theme: 'dark',
      defaultAnalogy: 'professional',
    },
  });

  console.log(`Created new user ${clerkId} with FREE plan`);
  return user;
}
