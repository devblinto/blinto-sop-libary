import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const ROOT = process.cwd();
const DOCS_DIR = "docs";
const REQUIRED_FIELDS = [
  "title",
  "type",
  "department",
  "owner",
  "status",
  "version",
  "last_reviewed",
  "review_cycle",
  "tags",
  "related",
];
const TYPES = new Set(["sop", "checklist", "template", "policy", "guide", "reference"]);
const STATUSES = new Set(["draft", "in-review", "approved", "deprecated"]);
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// Single source of truth for departments and their docs/ folders.
const DEPARTMENTS = JSON.parse(fs.readFileSync(path.join(ROOT, "lib/departments.json"), "utf8"));
const FOLDER_BY_DEPARTMENT = new Map(DEPARTMENTS.map(({ name, folder }) => [name, folder]));
const KNOWN_FOLDERS = new Set(FOLDER_BY_DEPARTMENT.values());

// Folders starting with "_" or "." (e.g. docs/_document-templates) are not library documents.
function walk(dir) {
  return fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true }).flatMap((entry) => {
    if (entry.name.startsWith("_") || entry.name.startsWith(".")) return [];
    const relative = path.posix.join(dir, entry.name);
    return entry.isDirectory() ? walk(relative) : [relative];
  });
}

const errors = [];
const allFiles = walk(DOCS_DIR);
const files = allFiles.filter((file) => file.endsWith(".md"));

for (const file of allFiles) {
  if (!file.endsWith(".md")) errors.push(`${file}: only Markdown documents belong in ${DOCS_DIR}/`);
}

// Slugs (filenames) must be unique across department folders: they are the website URL
// and the value used in `related`.
const slugToFile = new Map();
for (const file of files) {
  const slug = path.posix.basename(file, ".md");
  if (slugToFile.has(slug)) errors.push(`${file}: duplicate slug '${slug}' (also ${slugToFile.get(slug)})`);
  else slugToFile.set(slug, file);
  if (!SLUG_PATTERN.test(slug)) errors.push(`${file}: filename must be lowercase kebab-case`);
}

// Every repository Markdown file that may contain relative links.
const linkSources = [...files, "README.md", "AI-INSTRUCTIONS.md"];

for (const file of files) {
  const parsed = matter(fs.readFileSync(path.join(ROOT, file), "utf8"));
  const data = parsed.data;
  const segments = file.split("/");

  for (const field of REQUIRED_FIELDS) {
    if (!(field in data)) errors.push(`${file}: missing frontmatter field '${field}'`);
  }

  if ("type" in data && !TYPES.has(String(data.type))) {
    errors.push(`${file}: unknown type '${data.type}' (allowed: ${[...TYPES].join(", ")})`);
  }
  if ("status" in data && !STATUSES.has(String(data.status))) {
    errors.push(`${file}: unknown status '${data.status}' (allowed: ${[...STATUSES].join(", ")})`);
  }

  if (segments.length !== 3 || !KNOWN_FOLDERS.has(segments[1])) {
    errors.push(`${file}: documents must live directly in ${DOCS_DIR}/<department-folder>/ (folders: ${[...KNOWN_FOLDERS].join(", ")})`);
  }

  if ("department" in data) {
    const department = String(data.department);
    const expectedFolder = FOLDER_BY_DEPARTMENT.get(department);
    if (!expectedFolder) {
      errors.push(`${file}: unknown department '${department}' (allowed: ${[...FOLDER_BY_DEPARTMENT.keys()].join(", ")})`);
    } else if (segments[1] !== expectedFolder) {
      errors.push(`${file}: department '${department}' must live in ${DOCS_DIR}/${expectedFolder}/`);
    }
  }

  for (const slug of [data.related ?? []].flat()) {
    if (!slugToFile.has(String(slug))) errors.push(`${file}: related slug '${slug}' does not match any document`);
  }
}

for (const file of linkSources) {
  // Ignore fenced code blocks: they hold illustrative examples, not real links.
  const content = matter(fs.readFileSync(path.join(ROOT, file), "utf8")).content.replace(/```[\s\S]*?```/g, "");
  for (const match of content.matchAll(/\]\(([^)\s]+)\)/g)) {
    const href = match[1];
    if (/^[a-z][a-z0-9+.-]*:|^#|^\//i.test(href)) continue; // external, anchor-only or absolute
    const target = path.posix.normalize(path.posix.join(path.posix.dirname(file), href.split("#")[0]));
    if (!fs.existsSync(path.join(ROOT, target))) {
      errors.push(`${file}: broken relative link -> ${href}`);
    }
  }
}

if (errors.length > 0) {
  console.error("Library validation failed:\n");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Library validation passed for ${files.length} documents in ${DOCS_DIR}/.`);
