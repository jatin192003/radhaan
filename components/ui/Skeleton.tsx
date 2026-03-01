import { cn } from "@/lib/utils";

interface SkeletonProps { className?: string; style?: React.CSSProperties }

export function Skeleton({ className }: SkeletonProps) {
    return <div className={cn("skeleton", className)} />;
}

export function ProductCardSkeleton() {
    return (
        <div className="card overflow-hidden">
            <Skeleton className="w-full rounded-none" style={{ aspectRatio: "3/4" }} />
            <div className="p-3.5 space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="flex gap-2 pt-1">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                </div>
            </div>
        </div>
    );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {Array.from({ length: count }).map((_, i) => (
                <ProductCardSkeleton key={i} />
            ))}
        </div>
    );
}

export function OrderCardSkeleton() {
    return (
        <div className="card p-5 space-y-4">
            <div className="flex justify-between">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <div className="flex gap-4">
                <Skeleton className="w-16 h-20 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-5 w-20" />
                </div>
            </div>
        </div>
    );
}
