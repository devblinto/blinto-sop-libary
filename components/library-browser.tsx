"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { SopDocument } from "@/lib/content";
import { departmentRank } from "@/lib/departments";

type Facets = {
  types: string[];
  departments: string[];
  owners: string[];
  statuses: string[];
};

type IndexedDocument = {
  doc: SopDocument;
  title: string;
  tags: string;
  metadata: string;
  body: string;
};

type MatchTier = "primary" | "body";

function normalizeSearch(value: string) {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/\p{Diacritic}/gu, "")
    .replace(/&/g, " and ")
    .replace(/[^\p{L}\p{M}\p{N}]+/gu, " ")
    .trim();
}

const pad = (value: string) => ` ${normalizeSearch(value)} `;

function indexDocument(doc: SopDocument): IndexedDocument {
  return {
    doc,
    title: pad(`${doc.title} ${doc.slug.replace(/-/g, " ")}`),
    tags: pad(doc.tags.join(" ")),
    metadata: pad([doc.type, doc.department, doc.owner].join(" ")),
    body: pad(doc.searchText),
  };
}

// Whole-word match that also accepts simple "-s"/"-es" plurals (e.g. "checklist" finds "checklists").
function hasWord(field: string, term: string) {
  return field.includes(` ${term} `) || field.includes(` ${term}s `) || field.includes(` ${term}es `);
}

// Word-start match, used only for short curated fields so partially typed words still find titles.
function hasPrefix(field: string, term: string) {
  return field.includes(` ${term}`);
}

/**
 * Primary match: every term must appear in the title, tags or department/type/owner metadata.
 * Returns 0 when any term is missing so unrelated documents never appear.
 */
function primaryScore(entry: IndexedDocument, phrase: string, terms: string[]) {
  let score = 0;
  for (const term of terms) {
    if (hasWord(entry.title, term)) score += 12;
    else if (hasPrefix(entry.title, term)) score += 8;
    else if (hasWord(entry.tags, term)) score += 6;
    else if (hasPrefix(entry.tags, term)) score += 4;
    else if (hasWord(entry.metadata, term)) score += 3;
    else return 0;
  }

  if (entry.title.trim().startsWith(phrase)) score += 24;
  else if (entry.title.includes(` ${phrase} `)) score += 16;
  else if (entry.title.includes(` ${phrase}`)) score += 8;
  return score;
}

/** Fallback match: every term must appear as a whole word in the document body. */
function bodyScore(entry: IndexedDocument, phrase: string, terms: string[]) {
  let score = 0;
  for (const term of terms) {
    if (!hasWord(entry.body, term)) return 0;
    score += entry.body.split(` ${term}`).length - 1;
  }
  if (terms.length > 1 && entry.body.includes(` ${phrase} `)) score += 20;
  return score;
}

function readInitialParams() {
  if (typeof window === "undefined") return { q: "", department: "" };
  const params = new URLSearchParams(window.location.search);
  return { q: params.get("q") ?? "", department: params.get("department") ?? "" };
}

export function LibraryBrowser({ documents, facets }: { documents: SopDocument[]; facets: Facets }) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("");
  const [department, setDepartment] = useState("");
  const [owner, setOwner] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    const initial = readInitialParams();
    if (initial.q) setQuery(initial.q);
    if (initial.department && facets.departments.includes(initial.department)) setDepartment(initial.department);
  }, [facets.departments]);

  const searchIndex = useMemo(() => documents.map(indexDocument), [documents]);

  const facetMatches = useMemo(
    () => searchIndex.filter(({ doc }) =>
      (!type || doc.type === type) &&
      (!owner || doc.owner === owner) &&
      (!status || doc.status === status)
    ),
    [searchIndex, type, owner, status],
  );

  const { results, tier } = useMemo(() => {
    const phrase = normalizeSearch(query);
    if (!phrase) {
      return { results: facetMatches.map(({ doc }) => ({ doc, score: 0 })), tier: "primary" as MatchTier };
    }

    const terms = [...new Set(phrase.split(" "))];
    const rank = (scorer: typeof primaryScore) => facetMatches
      .map((entry) => ({ doc: entry.doc, score: scorer(entry, phrase, terms) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score || a.doc.title.localeCompare(b.doc.title));

    const primary = rank(primaryScore);
    if (primary.length > 0) return { results: primary, tier: "primary" as MatchTier };
    return { results: rank(bodyScore), tier: "body" as MatchTier };
  }, [facetMatches, query]);

  const departmentCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const { doc } of results) counts.set(doc.department, (counts.get(doc.department) ?? 0) + 1);
    return counts;
  }, [results]);

  const visible = department ? results.filter(({ doc }) => doc.department === department) : results;

  const groups = useMemo(() => {
    const byDepartment = new Map<string, { doc: SopDocument; score: number }[]>();
    for (const result of visible) {
      const list = byDepartment.get(result.doc.department) ?? [];
      list.push(result);
      byDepartment.set(result.doc.department, list);
    }
    const searching = Boolean(normalizeSearch(query));
    return [...byDepartment.entries()]
      .map(([name, items]) => ({ name, items, best: items[0]?.score ?? 0 }))
      .sort((a, b) =>
        (searching ? b.best - a.best : 0) ||
        departmentRank(a.name) - departmentRank(b.name) ||
        a.name.localeCompare(b.name)
      );
  }, [visible, query]);

  const clear = () => {
    setQuery("");
    setType("");
    setDepartment("");
    setOwner("");
    setStatus("");
  };

  const trimmedQuery = query.trim();

  return (
    <section className="library-browser">
      <div className="browser-toolbar">
        <label className="search-field">
          <span>Search the library</span>
          <input
            type="search"
            autoComplete="off"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by SOP title, topic, tag or department…"
          />
        </label>

        <div className="department-chips" role="group" aria-label="Filter by department">
          <button
            type="button"
            className={department === "" ? "chip active" : "chip"}
            aria-pressed={department === ""}
            onClick={() => setDepartment("")}
          >
            All departments <span>{results.length}</span>
          </button>
          {facets.departments.map((name) => (
            <button
              key={name}
              type="button"
              className={department === name ? "chip active" : "chip"}
              aria-pressed={department === name}
              disabled={!departmentCounts.get(name) && department !== name}
              onClick={() => setDepartment(department === name ? "" : name)}
            >
              {name} <span>{departmentCounts.get(name) ?? 0}</span>
            </button>
          ))}
        </div>

        <div className="filters" aria-label="Library filters">
          <Filter label="Type" value={type} values={facets.types} onChange={setType} />
          <Filter label="Owner" value={owner} values={facets.owners} onChange={setOwner} />
          <Filter label="Status" value={status} values={facets.statuses} onChange={setStatus} />
          <button type="button" className="clear-button" onClick={clear}>Clear</button>
        </div>
      </div>

      <div className="results-heading">
        <div>
          <p className="eyebrow">{department || "Library"}</p>
          <h2 aria-live="polite">
            {visible.length} document{visible.length === 1 ? "" : "s"}
            {trimmedQuery && <> for “{trimmedQuery}”</>}
          </h2>
          {trimmedQuery && tier === "body" && visible.length > 0 && (
            <p className="results-note">No titles or tags match, so these are documents that mention “{trimmedQuery}” in their content.</p>
          )}
        </div>
        <a
          className="contribute-link"
          href="https://github.com/hifazlerabbi/Blinto-SOP-Library/issues/new"
          target="_blank"
          rel="noreferrer"
        >
          Suggest update
        </a>
      </div>

      {groups.map((group) => (
        <section key={group.name} className="department-group" aria-labelledby={`dept-${slugify(group.name)}`}>
          <div className="department-heading">
            <h3 id={`dept-${slugify(group.name)}`}>{group.name}</h3>
            <span>{group.items.length} document{group.items.length === 1 ? "" : "s"}</span>
          </div>
          <div className="document-grid">
            {group.items.map(({ doc }) => (
              <Link key={doc.slug} href={`/sop/${doc.slug}`} prefetch={false} className="document-card">
                <div className="card-topline">
                  <span className={`type-badge type-${doc.type}`}>{doc.type}</span>
                  <span className={`status-dot status-${doc.status}`}>{doc.status}</span>
                </div>
                <h3>{doc.title}</h3>
                <p>{doc.excerpt || "Open this document to view the full operating guidance."}</p>
                <div className="card-meta">
                  <span>{doc.owner}</span>
                  {doc.supportingDepartments.length > 0 && (
                    <span>Supported by {doc.supportingDepartments.join(", ")}</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}

      {visible.length === 0 && (
        <div className="empty-state">
          <h3>No matching documents</h3>
          <p>{trimmedQuery ? `Nothing in the library matches “${trimmedQuery}”. Try a different word or clear the filters.` : "Try clearing the filters."}</p>
          <button type="button" className="clear-button" onClick={clear}>Clear search and filters</button>
        </div>
      )}
    </section>
  );
}

function slugify(value: string) {
  return value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function Filter({ label, value, values, onChange }: { label: string; value: string; values: string[]; onChange: (value: string) => void }) {
  return (
    <label>
      <span className="sr-only">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">All {label.toLowerCase()}s</option>
        {values.map((item) => <option key={item} value={item}>{item}</option>)}
      </select>
    </label>
  );
}
