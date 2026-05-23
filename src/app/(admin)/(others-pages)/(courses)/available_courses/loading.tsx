import CourseSkeleton from "@/components/skeletons/courses/CourseSkeleton";
import PageSkeleton from "@/components/skeletons/PageSkeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <PageSkeleton variant="courses" />
      <div className="px-4 md:px-6">
        <CourseSkeleton />
      </div>
    </div>
  );
}
