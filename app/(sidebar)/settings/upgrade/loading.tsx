import { Skeleton } from "@/components/ui/skeleton";

export default function UpgradeLoading() {
    return (
        <div className="max-w-7xl mx-auto px-4 py-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div
                        key={i}
                        className="relative p-8 rounded-4xl overflow-hidden flex flex-col h-[600px] border border-white/10 bg-card/30"
                    >
                        <div className="mb-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <Skeleton className="h-8 w-32 rounded-lg" />
                                <Skeleton className="h-6 w-20 rounded-full" />
                            </div>
                            <Skeleton className="h-12 w-full rounded-lg" />
                        </div>

                        <div className="flex items-baseline gap-1 mb-8">
                            <Skeleton className="h-10 w-24 rounded-lg" />
                            <Skeleton className="h-6 w-12 rounded-lg" />
                        </div>

                        <div className="space-y-4 mb-8 flex-grow">
                            {Array.from({ length: 6 }).map((_, j) => (
                                <div key={j} className="flex items-start gap-3">
                                    <Skeleton className="w-5 h-5 rounded-full flex-shrink-0" />
                                    <Skeleton className="h-4 w-full rounded-lg" />
                                </div>
                            ))}
                        </div>

                        <div className="mt-auto">
                            <Skeleton className="h-12 w-full rounded-full" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Comparison Table Skeleton */}
            <div className="mt-16 p-8 rounded-4xl bg-card/30 border border-white/5">
                <div className="flex justify-center mb-8">
                    <Skeleton className="h-8 w-48 rounded-lg" />
                </div>
                <div className="space-y-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="flex items-center justify-between py-4 border-b border-white/5">
                            <Skeleton className="h-4 w-48 rounded-lg" />
                            <div className="flex gap-12">
                                <Skeleton className="h-4 w-8 rounded-full" />
                                <Skeleton className="h-4 w-8 rounded-full" />
                                <Skeleton className="h-4 w-8 rounded-full" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
