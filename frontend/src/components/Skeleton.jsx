export function Skeleton({ className = '' }) {
  return (
    <div className={`animate-skeleton rounded-lg bg-gradient-to-r from-white/[0.03] via-white/[0.06] via-50% to-white/[0.03] bg-[length:200%_100%] ${className}`} />
  )
}

export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-3 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`}
        />
      ))}
    </div>
  )
}

export function SkeletonCard({ className = '' }) {
  return (
    <div className={`rounded-xl border border-white/[0.04] bg-white/[0.02] p-5 space-y-4 ${className}`}>
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <SkeletonText lines={2} />
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-white/[0.04] bg-white/[0.02] p-5 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
            </div>
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-2 w-full" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-white/[0.04] bg-white/[0.02] p-5 space-y-4">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-48 w-full rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function TaskListSkeleton({ count = 6 }) {
  return (
    <div className="space-y-3 animate-fade-in">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-xl border border-white/[0.04] bg-white/[0.02] p-4">
          <Skeleton className="w-5 h-5 rounded-md shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <div className="flex gap-2">
              <Skeleton className="h-3 w-16 rounded-full" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="w-20 h-8 rounded-lg shrink-0" />
        </div>
      ))}
    </div>
  )
}

export function CategoryCardSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl border border-white/[0.04] bg-white/[0.02] overflow-hidden">
          <Skeleton className="h-20 w-full rounded-none" />
          <div className="p-4 space-y-2">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function TagSkeleton({ count = 8 }) {
  return (
    <div className="flex flex-wrap gap-3 animate-fade-in">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-24 rounded-xl" />
      ))}
    </div>
  )
}

export function NotesSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl border border-white/[0.04] bg-white/[0.02] overflow-hidden">
          <Skeleton className="h-16 w-full rounded-none" />
          <div className="p-4 space-y-3">
            <Skeleton className="h-5 w-3/4" />
            <SkeletonText lines={3} />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      <Skeleton className="h-40 w-full rounded-2xl" />
      <div className="flex flex-col items-center -mt-16 space-y-3">
        <Skeleton className="w-24 h-24 rounded-full shrink-0" />
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-56" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-white/[0.04] bg-white/[0.02] p-4 space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-5 w-40" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function AiChatSkeleton() {
  return (
    <div className="space-y-4 p-4 animate-fade-in">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className={`flex gap-3 ${i % 2 === 0 ? '' : 'justify-end'}`}>
          {i % 2 === 0 && <Skeleton className="w-8 h-8 rounded-lg shrink-0" />}
          <div className={`max-w-[75%] space-y-2 ${i % 2 === 0 ? '' : 'order-first'}`}>
            <Skeleton className={`h-12 rounded-2xl ${i % 2 === 0 ? 'rounded-bl-md w-full' : 'rounded-br-md w-4/5'}`} />
          </div>
          {i % 2 !== 0 && <Skeleton className="w-8 h-8 rounded-lg shrink-0" />}
        </div>
      ))}
    </div>
  )
}
