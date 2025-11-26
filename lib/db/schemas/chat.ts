import { z } from "zod";

/**
 * Chat Message Schema
 */
export const ChatMessageSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "assistant"]),
  content: z.string(),
  createdAt: z.date(),
});

/**
 * Topic Chat Conversation Schema
 * Stores chat history for a specific topic
 */
export const TopicChatSchema = z.object({
  _id: z.string(),
  interviewId: z.string(),
  topicId: z.string(),
  userId: z.string(),
  messages: z.array(ChatMessageSchema).default([]),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateTopicChatSchema = TopicChatSchema.omit({
  _id: true,
  createdAt: true,
  updatedAt: true,
});

export type ChatMessage = z.infer<typeof ChatMessageSchema>;
export type TopicChat = z.infer<typeof TopicChatSchema>;
export type CreateTopicChat = z.infer<typeof CreateTopicChatSchema>;
