// Canonical SOP Library department categories, in display order.
// Keep in sync with library-standard.md and scripts/validate-library.mjs.
export const DEPARTMENTS = [
  "People & Culture",
  "Operations & Finance",
  "Growth",
  "Development",
  "Design",
  "Project Management",
  "Product",
  "CEO's Office",
] as const;

export function departmentRank(department: string): number {
  const index = (DEPARTMENTS as readonly string[]).indexOf(department);
  return index === -1 ? DEPARTMENTS.length : index;
}

export function sortDepartments(departments: string[]): string[] {
  return [...departments].sort((a, b) => departmentRank(a) - departmentRank(b) || a.localeCompare(b));
}
