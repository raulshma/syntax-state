/**
 * Concurrency Limiter Utility
 * Limits the number of concurrent async operations
 */

import { DEFAULT_AI_CONCURRENCY_LIMIT } from "../constants";

export interface ConcurrencyLimiterOptions {
  maxConcurrent: number;
}

/**
 * Creates a concurrency limiter that processes tasks with a maximum number of concurrent executions
 * @param tasks Array of async functions to execute
 * @param maxConcurrent Maximum number of concurrent tasks (default: 2)
 * @returns Promise that resolves when all tasks complete
 */
export async function runWithConcurrencyLimit<T>(
  tasks: (() => Promise<T>)[],
  maxConcurrent: number = DEFAULT_AI_CONCURRENCY_LIMIT
): Promise<T[]> {
  const results: T[] = new Array(tasks.length);
  let currentIndex = 0;

  async function runNext(): Promise<void> {
    while (currentIndex < tasks.length) {
      const index = currentIndex++;
      const task = tasks[index];
      try {
        results[index] = await task();
      } catch (error) {
        // Store error but continue with other tasks
        results[index] = error as T;
      }
    }
  }

  // Start up to maxConcurrent workers
  const workers = Array(Math.min(maxConcurrent, tasks.length))
    .fill(null)
    .map(() => runNext());

  await Promise.all(workers);
  return results;
}

/**
 * Creates a semaphore-based concurrency limiter for more granular control
 */
export class ConcurrencySemaphore {
  private running = 0;
  private queue: (() => void)[] = [];

  constructor(private maxConcurrent: number) {}

  async acquire(): Promise<void> {
    if (this.running < this.maxConcurrent) {
      this.running++;
      return;
    }

    return new Promise<void>((resolve) => {
      this.queue.push(resolve);
    });
  }

  release(): void {
    this.running--;
    const next = this.queue.shift();
    if (next) {
      this.running++;
      next();
    }
  }

  async run<T>(fn: () => Promise<T>): Promise<T> {
    await this.acquire();
    try {
      return await fn();
    } finally {
      this.release();
    }
  }
}
