import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateTopics } from './ai-engine';
import { streamObject } from 'ai';

// Mock the ai module
vi.mock('ai', () => ({
    streamObject: vi.fn(() => ({
        toTextStreamResponse: () => { },
        pipeThrough: () => { },
    })),
    tool: vi.fn(),
}));

// Mock db calls
vi.mock('@/lib/db/tier-config', () => ({
    getTierConfigFromDB: vi.fn().mockResolvedValue({
        primaryModel: 'test-model',
        temperature: 0.7,
        maxTokens: 4096,
    }),
}));

describe('ai-engine', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should generate topics with optimized prompt', async () => {
        const ctx = {
            jobTitle: 'Senior React Developer',
            company: 'TechCorp',
            jobDescription: 'We need a React expert.',
            resumeText: 'I am a React expert.',
            planContext: { plan: 'PRO' as const },
        };

        await generateTopics(ctx, 8, {}, 'test-key');

        expect(streamObject).toHaveBeenCalled();
        const callArgs = vi.mocked(streamObject).mock.calls[0][0];

        // Check if prompt contains the new optimizations
        expect(callArgs.prompt).toContain('600-800 words');
        expect(callArgs.prompt).toContain('DETAILED content');
        expect(callArgs.prompt).toContain('How to Explain to an Interviewer');
        expect(callArgs.prompt).toContain('Code / Real-World Examples');

        // Check if old heavy requirements are gone
        expect(callArgs.prompt).not.toContain('800-1200 words');

        // Check if unused fields are gone
        expect(callArgs.prompt).not.toContain('estimatedMinutes');
        expect(callArgs.prompt).not.toContain('prerequisites');
        expect(callArgs.prompt).not.toContain('skillGaps');
        expect(callArgs.prompt).not.toContain('followUpQuestions');
        expect(callArgs.prompt).not.toContain('difficulty');
    });
});
