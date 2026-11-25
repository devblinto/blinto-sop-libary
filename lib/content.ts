import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkHtml from "remark-html";
import { DEPARTMENTS, sortDepartments } from "./departments";

export type SopDocument = {
  slug: string;
  /** Repository-relative path, e.g. docs/people-and-culture/hiring.md */
  filePath: string;
  title: string;
  type: string;
  department: string;
  supportingDepartments: string[];
  owner: string;
  status: string;
  version: string;
  lastReviewed: string;
  reviewCycle: string;
  tags: string[];
  related: string[];
  excerpt: string;
  searchText: string;
};

export type DocumentHeading = {
  id: string;
  text: string;
  depth: 2 | 3;
};

const ROOT = process.cwd();
// All operational documents live under docs/<department-folder>/<slug>.md.
// Folders starting with "_" or "." (e.g. docs/_document-templates) are not library documents.
export const DOCS_DIR = "docs";
export const REPOSITORY_URL = "https://github.com/hifazlerabbi/Blinto-SOP-Library";

function normalizeList(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(String);
  return [String(value)];
}

function plainText(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[([^\]]*)\]\([^\)]+\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^>\s?/gm, "")
    .replace(/^[-*+]\s+/gm, "")
    .replace(/^\d+\.\s+/gm, "")
    .replace(/[|*_~]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanExcerpt(markdown: string): string {
  return plainText(markdown).slice(0, 180);
}

function buildDocument(filePath: string): SopDocument {
  const raw = fs.readFileSync(path.join(ROOT, filePath), "utf8");
  const parsed = matter(raw);
  const data = parsed.data;
  const bodyText = plainText(parsed.content);
  const slug = path.posix.basename(filePath, ".md");

  return {
    slug,
    filePath,
    title: String(data.title || slug),
    type: String(data.type || "reference"),
    department: String(data.department || "Unassigned"),
    supportingDepartments: normalizeList(data.supporting_departments),
    owner: String(data.owner || "Unassigned"),
    status: String(data.status || "draft"),
    version: String(data.version || ""),
    lastReviewed: String(data.last_reviewed || ""),
    reviewCycle: String(data.review_cycle || ""),
    tags: normalizeList(data.tags),
    related: normalizeList(data.related),
    excerpt: cleanExcerpt(parsed.content),
    searchText: bodyText,
  };
}

function walkMarkdown(dir: string): string[] {
  return fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true }).flatMap((entry) => {
    if (entry.name.startsWith("_") || entry.name.startsWith(".")) return [];
    const relative = path.posix.join(dir, entry.name);
    if (entry.isDirectory()) return walkMarkdown(relative);
    return entry.name.endsWith(".md") ? [relative] : [];
  });
}

/** Repository-relative paths of every library document under docs/. */
export function getDocumentFiles(): string[] {
  return walkMarkdown(DOCS_DIR);
}

let slugIndex: Map<string, string> | undefined;

/** Slugs are filenames without ".md"; they are unique across department folders. */
function getSlugIndex(): Map<string, string> {
  slugIndex ??= new Map(getDocumentFiles().map((filePath) => [path.posix.basename(filePath, ".md"), filePath]));
  return slugIndex;
}

export function getAllDocuments(): SopDocument[] {
  return getDocumentFiles()
    .map(buildDocument)
    .filter((doc) => doc.status !== "deprecated")
    .sort((a, b) => a.title.localeCompare(b.title));
}

export function getDocument(slug: string) {
  const filePath = getSlugIndex().get(slug);
  if (!filePath) return null;

  const raw = fs.readFileSync(path.join(ROOT, filePath), "utf8");
  const parsed = matter(raw);
  return { document: buildDocument(filePath), markdown: parsed.content };
}

function headingSlug(value: string): string {
  const cleaned = plainText(value)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return cleaned || "section";
}

export function getDocumentHeadings(markdown: string): DocumentHeading[] {
  const seen = new Map<string, number>();
  const headings: DocumentHeading[] = [];

  for (const line of markdown.split("\n")) {
    const match = line.match(/^(#{2,3})\s+(.+?)\s*#*\s*$/);
    if (!match) continue;

    const depth = match[1].length as 2 | 3;
    const text = plainText(match[2]);
    if (!text) continue;

    const base = headingSlug(text);
    const occurrence = seen.get(base) ?? 0;
    seen.set(base, occurrence + 1);
    const id = occurrence === 0 ? base : `${base}-${occurrence + 1}`;

    headings.push({ id, text, depth });
  }

  return headings;
}

// Relative Markdown links are written for GitHub (e.g. ../growth/seo-client-intake-and-routing.md).
// Links to library documents become site routes; links to other repository files
// (e.g. ../../AI-INSTRUCTIONS.md) point at the file on GitHub.
function rewriteInternalMarkdownLinks(html: string, sourcePath: string): string {
  const slugs = getSlugIndex();
  return html.replace(/href="([^":#]+\.md)(#[^"]*)?"/gi, (match, target: string, hash = "") => {
    const slug = path.posix.basename(target, ".md");
    if (slugs.has(slug)) return `href="/sop/${slug}/${hash}"`;
    const repoPath = path.posix.normalize(path.posix.join(path.posix.dirname(sourcePath), target));
    if (repoPath.startsWith("..")) return match;
    return `href="${REPOSITORY_URL}/blob/main/${repoPath}${hash}"`;
  });
}

function addHeadingIds(html: string, markdown: string): string {
  const headings = getDocumentHeadings(markdown);
  let index = 0;

  return html.replace(/<h([23])>([\s\S]*?)<\/h\1>/g, (match, depth: string, content: string) => {
    const heading = headings[index++];
    if (!heading) return match;
    return `<h${depth} id="${heading.id}">${content}</h${depth}>`;
  });
}

function wrapTables(html: string): string {
  return html
    .replace(/<table>/g, '<div class="table-scroll"><table>')
    .replace(/<\/table>/g, "</table></div>");
}

export async function renderMarkdown(markdown: string, sourcePath: string): Promise<string> {
  const result = await remark().use(remarkGfm).use(remarkHtml).process(markdown);
  const withLinks = rewriteInternalMarkdownLinks(result.toString(), sourcePath);
  const withHeadingIds = addHeadingIds(withLinks, markdown);
  return wrapTables(withHeadingIds);
}

export function getFacetValues(documents: SopDocument[]) {
  const unique = (values: string[]) => [...new Set(values.filter(Boolean))].sort();
  return {
    types: unique(documents.map((doc) => doc.type)),
    departments: sortDepartments(unique([...DEPARTMENTS, ...documents.map((doc) => doc.department)])),
    owners: unique(documents.map((doc) => doc.owner)),
    statuses: unique(documents.map((doc) => doc.status)),
  };
}
