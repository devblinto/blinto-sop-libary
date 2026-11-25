# Blinto SOP Library

**The operating system for how we work at Blinto.**

This private repository is the canonical source of truth for Blinto's operational knowledge. It contains SOPs, checklists, templates, policies, guides, and references as interconnected Markdown documents.

## Core Principles

1. **One process, one canonical document.** Never create a second document for the same process.
2. **Search before creating.** Update an existing document when the knowledge belongs there.
3. **Link, don't duplicate.** Reuse existing procedures, checklists, templates, policies, guides, and references by linking to them.
4. **Markdown is the source.** The internal website and backups are downstream representations of this repository.
5. **Changes are reviewed.** Published operational knowledge should reach `main` through the agreed review and approval workflow.
6. **Keep it maintainable.** Prefer clear, concise, executable documentation over long narrative documentation.
7. **AI assists; humans own operational truth.** AI may structure, search, link, and draft, but must not invent material company rules.

## Document Types

| Type | Purpose |
| --- | --- |
| `sop` | A repeatable process: how work is performed |
| `checklist` | A set of items that must be completed or verified |
| `template` | Reusable content or structure used to perform work |
| `policy` | Rules, requirements, boundaries, and decision constraints |
| `guide` | Helpful instructions or knowledge that are not a strict process |
| `reference` | Standards, definitions, conventions, and quick-look-up information |

## Repository Layout

```text
docs/<department>/        Every library document, filed under its owning department
docs/_document-templates/ Starter skeletons for each document type
AI-INSTRUCTIONS.md        Protocol for AI systems working in this repository
app/ components/ lib/     Internal website, generated from docs/
scripts/                  Library validation (npm run validate:library)
```

Department folders: `people-and-culture`, `operations-and-finance`, `growth`, `development`, `design`, `project-management`, `product`, `ceos-office`. A folder appears once it holds its first document.

Document type is metadata, not a folder. Within a department, documents stay flat and are found through search, metadata, and links. See [Library Standard → Repository Structure](./docs/operations-and-finance/library-standard.md#repository-structure) for the full rules.

## Start Here

- [Library Standard](./docs/operations-and-finance/library-standard.md) — document model, metadata, naming, linking, and duplication rules
- [Contribution & Approval](./docs/operations-and-finance/contribution-and-approval.md) — how to request, create, improve, review, and publish documents
- [AI Authoring Instructions](./AI-INSTRUCTIONS.md) — vendor-neutral protocol for AI systems creating, improving, migrating, or reviewing library content
- [AI-Assisted SOP Authoring Workflow](./docs/operations-and-finance/ai-authoring-workflow.md) — team-facing guide for creating or improving documentation through an AI assistant
- [Migration Register](./docs/operations-and-finance/migration-register.md) — control list for reviewing and consolidating existing Blinto SOPs and operational documents
- [Document Templates](./docs/_document-templates/) — starter Markdown skeletons for SOPs, checklists, templates, policies, guides, and references

## AI-Assisted Contributions

A team member does not need to know Markdown or the library taxonomy. They may describe a process naturally to an AI system that has access to this repository and follows `AI-INSTRUCTIONS.md`.

The AI should search first, reuse canonical knowledge, ask only for missing operational truth, draft to the library standard, and submit the proposed change for human review.

## Source of Truth

GitHub `main` is authoritative. The future internal website is generated from this repository. Google Drive copies are backups only and must not become an editable second source of truth.

## Working on the Website

```bash
npm install
npm run dev       # local preview
npm run check     # validate library, typecheck and build (same as CI)
```
