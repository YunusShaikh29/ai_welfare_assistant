import { Skeleton } from "@/components/ui/skeleton"

export function ChatSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-hidden>
      <div className="flex items-end gap-3">
        <Skeleton className="size-6 rounded-full" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-52" />
          <Skeleton className="h-4 w-72" />
          <Skeleton className="h-4 w-40" />
        </div>
      </div>

      <div className="flex items-end justify-end gap-3">
        <div className="flex flex-col items-end gap-2">
          <Skeleton className="h-4 w-44" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="size-6 rounded-full" />
      </div>

      <div className="flex items-end gap-3">
        <Skeleton className="size-6 rounded-full" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-4 w-56" />
        </div>
      </div>
    </div>
  )
}
