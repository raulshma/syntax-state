import { Collection, Document } from 'mongodb';
import { getDb } from './client';

// Collection names
export const COLLECTIONS = {
  USERS: 'users',
  INTERVIEWS: 'interviews',
  AI_LOGS: 'ai_logs',
  SETTINGS: 'settings',
} as const;

// Type definitions for documents (will be replaced with Zod inferred types later)
export interface UserDocument extends Document {
  _id: string;
  clerkId: string;
  stripeCustomerId?: string;
  plan: 'FREE' | 'PRO' | 'MAX';
  iterations: {
    count: number;
    limit: number;
    resetDate: Date;
  };
  preferences: {
    theme: 'light' | 'dark';
    defaultAnalogy: 'professional' | 'construction' | 'simple';
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface InterviewDocument extends Document {
  _id: string;
  userId: string;
  isPublic: boolean;
  jobDetails: {
    title: string;
    company: string;
    description: string;
  };
  resumeContext: string;
  modules: {
    openingBrief?: {
      content: string;
      experienceMatch: number;
      keySkills: string[];
      prepTime: string;
      version: number;
    };
    revisionTopics: Array<{
      id: string;
      title: string;
      content: string;
      style: 'professional' | 'construction' | 'simple';
      reason: string;
      confidence: 'low' | 'medium' | 'high';
    }>;
    mcqs: Array<{
      id: string;
      question: string;
      options: string[];
      answer: string;
      explanation: string;
      source: 'ai' | 'search';
    }>;
    rapidFire: Array<{
      id: string;
      question: string;
      answer: string;
    }>;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface AILogDocument extends Document {
  _id: string;
  interviewId: string;
  userId: string;
  action: 'GENERATE_BRIEF' | 'GENERATE_TOPICS' | 'GENERATE_MCQ' | 'GENERATE_RAPID_FIRE' | 'REGENERATE_ANALOGY';
  model: string;
  prompt: string;
  response: string;
  toolsUsed: string[];
  searchQueries: string[];
  tokenUsage: {
    input: number;
    output: number;
  };
  latencyMs: number;
  timestamp: Date;
}

// Typed collection getters
export async function getUsersCollection(): Promise<Collection<UserDocument>> {
  const db = await getDb();
  return db.collection<UserDocument>(COLLECTIONS.USERS);
}

export async function getInterviewsCollection(): Promise<Collection<InterviewDocument>> {
  const db = await getDb();
  return db.collection<InterviewDocument>(COLLECTIONS.INTERVIEWS);
}

export async function getAILogsCollection(): Promise<Collection<AILogDocument>> {
  const db = await getDb();
  return db.collection<AILogDocument>(COLLECTIONS.AI_LOGS);
}

export interface SettingsDocument extends Document {
  _id: string;
  key: string;
  value: unknown;
  updatedAt: Date;
}

export async function getSettingsCollection(): Promise<Collection<SettingsDocument>> {
  const db = await getDb();
  return db.collection<SettingsDocument>(COLLECTIONS.SETTINGS);
}
