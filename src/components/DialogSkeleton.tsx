import { Skeleton } from "./ui/skeleton";

/**
 * DialogSkeleton - Loading fallback for lazy-loaded dialogs
 * Used with React.Suspense to show loading state while dialog code is being loaded
 */
export default function DialogSkeleton() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative bg-background border rounded-lg shadow-lg w-full max-w-2xl mx-4 p-6 space-y-4">
        {/* Dialog Title Skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>

        {/* Dialog Content Skeleton */}
        <div className="space-y-4 pt-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>

        {/* Dialog Actions Skeleton */}
        <div className="flex justify-end gap-2 pt-4">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
    </div>
  );
}
