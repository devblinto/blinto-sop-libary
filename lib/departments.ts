import departments from "./departments.json";

// Canonical SOP Library departments, in display order. Each department owns one
// folder under docs/. Edit lib/departments.json (the single source of truth,
// also read by scripts/validate-library.mjs) to add or rename a department.
export const DEPARTMENTS: readonly string[] = departments.map((department) => department.name);

export function departmentRank(department: string): number {
  const index = DEPARTMENTS.indexOf(department);
  return index === -1 ? DEPARTMENTS.length : index;
}

export function sortDepartments(departments: string[]): string[] {
  return [...departments].sort((a, b) => departmentRank(a) - departmentRank(b) || a.localeCompare(b));
}
