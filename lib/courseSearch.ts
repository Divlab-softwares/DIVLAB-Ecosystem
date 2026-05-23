type SearchableCourse = {
  title?: string | null;
  description?: string | null;
  domain?: string | null;
  language?: string | null;
  state?: string | null;
  trainer?: {
    user?: {
      name?: string | null;
      email?: string | null;
    } | null;
  } | null;
};

function normalizeValue(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[-_.]/g, " ")
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeCourseSearchValue(value: string | null | undefined) {
  return normalizeValue(value);
}

export function filterCoursesByQuery<T extends SearchableCourse>(
  courses: T[],
  query: string,
  getExtraValues?: (course: T) => Array<string | null | undefined>,
) {
  const normalizedQuery = normalizeValue(query);

  if (!normalizedQuery) {
    return courses;
  }

  return courses.filter((course) => {
    const values = [
      course.title,
      course.description,
      course.domain,
      course.language,
      course.state,
      course.trainer?.user?.name,
      course.trainer?.user?.email,
      ...(getExtraValues ? getExtraValues(course) : []),
    ];

    return normalizeValue(values.join(" ")).includes(normalizedQuery);
  });
}
