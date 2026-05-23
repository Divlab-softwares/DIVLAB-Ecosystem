type PageSkeletonProps = {
  variant?: "default" | "courses";
};

export default function PageSkeleton({ variant = "default" }: PageSkeletonProps) {
  const itemCount = variant === "courses" ? 4 : 6;

  return (
    <main className="space-y-6 p-4 md:p-6">
      <section className="dashboard-panel dashboard-grid-background animate-pulse px-5 py-5">
        <div className="mb-4 h-6 w-28 rounded-full bg-slate-200 dark:bg-slate-800" />
        <div className="h-8 w-64 max-w-full rounded-full bg-slate-200 dark:bg-slate-800" />
      </section>
      <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        {Array.from({ length: itemCount }).map((_, index) => (
          <div
            key={index}
            className="dashboard-panel dashboard-grid-background animate-pulse p-5"
          >
            <div className="h-40 rounded-2xl bg-slate-200/80 dark:bg-slate-800" />
            <div className="mt-5 h-4 w-3/4 rounded-full bg-slate-200 dark:bg-slate-800" />
            <div className="mt-3 h-4 w-1/2 rounded-full bg-slate-200 dark:bg-slate-800" />
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="h-10 rounded-lg bg-slate-200 dark:bg-slate-800" />
              <div className="h-10 rounded-lg bg-slate-200 dark:bg-slate-800" />
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
