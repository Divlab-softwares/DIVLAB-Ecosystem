type CourseSkeletonProps = {
  count?: number;
};

function SkeletonCard() {
  return (
    <article
      role="status"
      className="dashboard-panel dashboard-grid-background animate-pulse overflow-hidden p-4 sm:p-5"
    >
      <div className="h-56 rounded-[24px] bg-slate-200/80 dark:bg-slate-800" />
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="dashboard-subpanel p-4">
          <div className="mb-3 h-3 w-24 rounded-full bg-slate-200 dark:bg-slate-800" />
          <div className="h-4 w-4/5 rounded-full bg-slate-200 dark:bg-slate-800" />
        </div>
        <div className="dashboard-subpanel p-4">
          <div className="mb-3 h-3 w-20 rounded-full bg-slate-200 dark:bg-slate-800" />
          <div className="h-4 w-2/3 rounded-full bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/70"
          >
            <div className="mb-3 h-3 w-16 rounded-full bg-slate-200 dark:bg-slate-800" />
            <div className="h-4 w-20 rounded-full bg-slate-200 dark:bg-slate-800" />
          </div>
        ))}
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <div className="h-11 rounded-lg bg-slate-200 dark:bg-slate-800" />
        <div className="h-11 rounded-lg bg-slate-200 dark:bg-slate-800" />
      </div>
      <span className="sr-only">Chargement...</span>
    </article>
  );
}

export default function CourseSkeleton({ count = 4 }: CourseSkeletonProps) {
  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
}
