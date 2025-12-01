/**
 * Crawl Service for Crawl4AI
 * Provides web crawling capabilities using the Crawl4AI Docker service
 */

export interface CrawlOptions {
    priority?: number; // 1-10, higher = faster processing
    js_code?: string; // JavaScript to execute on page
    wait_for?: string; // CSS selector to wait for
    timeout?: number; // Max timeout in milliseconds
    include_raw_html?: boolean;
    bypass_cache?: boolean;
}

export interface CrawlMetadata {
    title?: string;
    description?: string;
    keywords?: string[];
    language?: string;
    author?: string;
    published_date?: string;
}

export interface CrawlLink {
    href: string;
    text: string;
    type: string;
}

export interface CrawlMedia {
    images: Array<{ src: string; alt?: string }>;
    videos: Array<{ src: string }>;
}

export interface CrawlResult {
    url: string;
    success: boolean;
    markdown?: string;
    html?: string;
    screenshot?: string; // Base64 encoded
    metadata?: CrawlMetadata;
    links?: CrawlLink[];
    media?: CrawlMedia;
    error?: string;
    crawl_time_ms: number;
}

export interface BatchCrawlResponse {
    task_id?: string; // If async
    results?: CrawlResult[];  // If sync
}

// Admin toggle state
let crawlEnabled = true;

/**
 * Get the Crawl4AI API URL from environment
 */
function getCrawl4AIUrl(): string {
    return process.env.CRAWL4AI_API_URL || 'http://localhost:11235';
}

/**
 * Get the Crawl4AI API token from environment (optional)
 */
function getCrawl4AIToken(): string | undefined {
    return process.env.CRAWL4AI_API_TOKEN;
}

/**
 * Get the default timeout for crawl requests
 */
function getCrawlTimeout(): number {
    return parseInt(process.env.CRAWL4AI_TIMEOUT || '30000', 10);
}

/**
 * Check if crawl service is enabled globally (admin toggle + env var)
 */
export function isCrawlEnabled(): boolean {
    return crawlEnabled && !!process.env.CRAWL4AI_API_URL;
}

/**
 * Enable or disable crawl service globally (admin function)
 */
export function setCrawlEnabled(enabled: boolean): void {
    crawlEnabled = enabled;
}

/**
 * Crawl a single URL and extract content
 * 
 * @param url - The URL to crawl
 * @param options - Crawl options
 * @returns Crawl result with markdown, metadata, links, and media
 */
export async function crawlUrl(
    url: string,
    options?: CrawlOptions
): Promise<CrawlResult> {
    if (!isCrawlEnabled()) {
        return {
            url,
            success: false,
            error: 'Crawl service is not enabled',
            crawl_time_ms: 0,
        };
    }

    const startTime = Date.now();
    const baseUrl = getCrawl4AIUrl();
    const token = getCrawl4AIToken();
    const timeout = options?.timeout || getCrawlTimeout();

    try {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${baseUrl}/crawl`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                urls: [url],
                priority: options?.priority || 5,
                js_code: options?.js_code,
                wait_for: options?.wait_for,
                include_raw_html: options?.include_raw_html || false,
                bypass_cache: options?.bypass_cache || false,
            }),
            signal: AbortSignal.timeout(timeout),
        });

        if (!response.ok) {
            console.error(`Crawl4AI request failed with status: ${response.status}`);
            return {
                url,
                success: false,
                error: `HTTP ${response.status}: ${response.statusText}`,
                crawl_time_ms: Date.now() - startTime,
            };
        }

        const data = await response.json();

        if (data.results && data.results.length > 0) {
            const result = data.results[0];
            return {
                ...result,
                crawl_time_ms: Date.now() - startTime,
            };
        }

        return {
            url,
            success: false,
            error: 'No results returned from crawl service',
            crawl_time_ms: Date.now() - startTime,
        };
    } catch (error) {
        console.error('Crawl4AI error:', error);
        return {
            url,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            crawl_time_ms: Date.now() - startTime,
        };
    }
}

/**
 * Crawl multiple URLs in batch
 * 
 * @param urls - Array of URLs to crawl
 * @param options - Crawl options
 * @returns Batch crawl response with results or task ID
 */
export async function crawlUrls(
    urls: string[],
    options?: CrawlOptions
): Promise<BatchCrawlResponse> {
    if (!isCrawlEnabled()) {
        return {
            results: urls.map((url) => ({
                url,
                success: false,
                error: 'Crawl service is not enabled',
                crawl_time_ms: 0,
            })),
        };
    }

    const baseUrl = getCrawl4AIUrl();
    const token = getCrawl4AIToken();
    const timeout = options?.timeout || getCrawlTimeout();

    try {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${baseUrl}/crawl`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                urls,
                priority: options?.priority || 5,
                js_code: options?.js_code,
                wait_for: options?.wait_for,
                include_raw_html: options?.include_raw_html || false,
                bypass_cache: options?.bypass_cache || false,
            }),
            signal: AbortSignal.timeout(timeout),
        });

        if (!response.ok) {
            console.error(`Crawl4AI batch request failed with status: ${response.status}`);
            return {
                results: urls.map((url) => ({
                    url,
                    success: false,
                    error: `HTTP ${response.status}: ${response.statusText}`,
                    crawl_time_ms: 0,
                })),
            };
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Crawl4AI batch error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return {
            results: urls.map((url) => ({
                url,
                success: false,
                error: errorMessage,
                crawl_time_ms: 0,
            })),
        };
    }
}

/**
 * Quick markdown extraction using the /md/{url} endpoint
 * Faster but less configurable than crawlUrl
 * 
 * @param url - The URL to extract markdown from
 * @returns Markdown content or null on error
 */
export async function crawlUrlMarkdown(url: string): Promise<string | null> {
    if (!isCrawlEnabled()) {
        return null;
    }

    const baseUrl = getCrawl4AIUrl();
    const token = getCrawl4AIToken();
    const timeout = getCrawlTimeout();

    try {
        const headers: Record<string, string> = {};

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        // Encode the URL for the path parameter
        const encodedUrl = encodeURIComponent(url);
        const response = await fetch(`${baseUrl}/md/${encodedUrl}`, {
            method: 'GET',
            headers,
            signal: AbortSignal.timeout(timeout),
        });

        if (!response.ok) {
            console.error(`Crawl4AI markdown request failed with status: ${response.status}`);
            return null;
        }

        const markdown = await response.text();
        return markdown;
    } catch (error) {
        console.error('Crawl4AI markdown error:', error);
        return null;
    }
}

/**
 * Check the health of the Crawl4AI service
 * 
 * @returns true if service is healthy, false otherwise
 */
export async function checkCrawlHealth(): Promise<boolean> {
    const baseUrl = getCrawl4AIUrl();

    try {
        const response = await fetch(`${baseUrl}/health`, {
            method: 'GET',
            signal: AbortSignal.timeout(5000),
        });

        return response.ok;
    } catch (error) {
        console.error('Crawl4AI health check failed:', error);
        return false;
    }
}

/**
 * Crawl service interface for dependency injection
 */
export interface CrawlService {
    crawlUrl(url: string, options?: CrawlOptions): Promise<CrawlResult>;
    crawlUrls(urls: string[], options?: CrawlOptions): Promise<BatchCrawlResponse>;
    crawlUrlMarkdown(url: string): Promise<string | null>;
    checkHealth(): Promise<boolean>;
    isEnabled(): boolean;
}

export const crawlService: CrawlService = {
    crawlUrl: crawlUrl,
    crawlUrls: crawlUrls,
    crawlUrlMarkdown: crawlUrlMarkdown,
    checkHealth: checkCrawlHealth,
    isEnabled: isCrawlEnabled,
};
