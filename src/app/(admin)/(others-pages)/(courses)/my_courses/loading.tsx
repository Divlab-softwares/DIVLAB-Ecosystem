import CourseSkeleton from "@/components/skeletons/courses/CourseSkeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="dashboard-panel dashboard-grid-background animate-pulse px-5 py-5">
        <div className="mb-4 h-6 w-28 rounded-full bg-slate-200 dark:bg-slate-800" />
        <div className="h-8 w-64 max-w-full rounded-full bg-slate-200 dark:bg-slate-800" />
      </div>
      <CourseSkeleton />
    </div>
  );
}
