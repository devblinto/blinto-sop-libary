---
title: Custom Application Development & Deployment
type: sop
department: Engineering
owner: Engineering Lead
status: approved
version: 1.0
last_reviewed: 2026-10-28
review_cycle: 6-months
tags:
  - engineering
  - cloudflare
  - neon
  - postgresql
  - r2
  - github
  - deployment
related:
  - access-provisioning-and-deprovisioning
  - credential-and-password-management-policy
  - incident-escalation
  - deliverable-qa-and-approval
---

# Custom Application Development & Deployment

## Purpose
Standardize how Blinto builds, deploys, stores, operates, and maintains **new custom web applications, internal platforms, and SaaS products** with a portable, cost-conscious default stack. The standard is **GitHub (source code) + Cloudflare (web/app deployment) + Neon PostgreSQL (structured data) + Cloudflare R2 (object/file storage)**.

This is the default, not permission to disrupt already-operating systems. Exceptions require a documented technical rationale and approval by the Engineering Lead; material strategic/cost exceptions escalate to the CEO.

## Scope and when to use
Apply to new Blinto-owned custom web applications (including Web Admin, internal business tools, and SaaS projects) and major rebuilds. Existing Shopify apps, WordPress projects, client-mandated platforms, long-running processes, mobile apps, and unsupported frameworks require a compatibility review rather than forced migration.

## Roles
- **Project Engineer:** writes code, tests, migrations and deployment configuration; documents runbooks.
- **Engineering Lead (owner):** approves architecture, production readiness, access and exceptions; assigns on-call/incident owner.
- **Repository maintainers/reviewers:** review pull requests and protect the production branch.
- **CEO:** approves strategic exceptions or material additional spending.
- **SOP Library Team:** reviews and publishes this SOP under the library governance workflow.

## Default technology decisions
| Layer | Standard | Required boundary |
| --- | --- | --- |
| Source control | GitHub repository per application | GitHub is source of truth for code, migrations, configs and agent instructions |
| Web/UI and APIs | Cloudflare Workers/compatible Cloudflare deployment | Confirm framework/runtime compatibility; do not assume every Node.js feature or background service runs on Workers |
| Relational database | Neon managed PostgreSQL | Separate Neon project for business-critical applications; portable SQL/migrations |
| File/object storage | Cloudflare R2 | Store uploads, documents and media here, not as large PostgreSQL blobs |
| Secrets | Platform secret stores and appropriately controlled CI secrets | Never commit secrets, passwords or private keys |
| DNS/CDN/security | Cloudflare where appropriate | HTTPS, restricted admin access, least privilege |
| CI/CD | GitHub-driven checked deployment to Cloudflare | PR review + automated checks before production |

**Cost discipline:** Use free tiers during development only where limits, recovery and data criticality permit. Monitor Neon compute/storage and Cloudflare Workers/R2 usage. A free plan is never itself a production-readiness guarantee.

## Procedure

### 1. Register and classify the application
Record name, repository, business owner, engineering owner, data classification, expected users/load, uptime/RTO/RPO needs, external integrations, and estimated monthly budget. Identify whether the system will become the authoritative home for invoices, payment records, employee data, or customer transactions. Higher-criticality systems require a recovery and paid-plan assessment **before** live records are entrusted to them.

### 2. Request company-owned access and create the GitHub foundation
All Blinto-owned applications must be created under **Blinto's existing GitHub organization**, never a developer's personal GitHub account. The organization has separate teams (described internally as **Team Blinto** and **Creators**); the project owner must verify their exact GitHub team names and select the correct team for each project. Do not assume a personal profile or similarly named account is the organization.

**Access onboarding — invitations, never shared login credentials:**

1. **GitHub:** Request an organization/repository invitation from the authorized Blinto GitHub administrator. The administrator places the developer in the appropriate existing team and grants only the repository role needed (normally Write for contributors; Maintain/Admin only for designated owners). The developer accepts using their own GitHub account and enables MFA. The application repository is owned by the Blinto organization.
2. **Cloudflare:** Request a membership invitation from the Blinto Cloudflare account administrator to the existing company account. Use an individual login, MFA and the narrowest suitable role/account-resource permissions. Obtain Workers/Pages deployment access and R2 access only when required; do not ask for the account owner's password or unrestricted account token.
3. **Neon:** Request an invitation to Blinto's existing Neon organization/account or specific project from its administrator. Grant appropriate project-level permissions where supported. Use separate least-privilege database credentials for the running application; do not reuse a staff member's Neon sign-in or privileged database credential.
4. **R2/service credentials:** Provision narrowly scoped service tokens or bucket-level credentials through an authorized administrator. Store them in Cloudflare secrets and approved CI secret storage, not in GitHub files, chat, tickets, screenshots or local committed `.env` files.
5. **Access register:** Record requester, approver, GitHub organization/team/repository, Cloudflare account/project, Neon organization/project, role granted, purpose and review/offboarding date. Never record passwords or raw tokens in the register. Remove access promptly on role change or offboarding according to the access SOP.

**Never share master account passwords.** Invitations give each developer their own revocable, auditable access. Follow [Access Provisioning & Deprovisioning](./access-provisioning-and-deprovisioning.md) and [Credential & Password Management Policy](./credential-and-password-management-policy.md).

Create a private repository unless explicitly approved public. Enable protected default branch, PR reviews, CI checks, and appropriate team permissions. Maintain `README.md`, `AGENTS.md` (vendor-neutral guidance), environment variable **names** without secret values, architecture notes, and versioned database migrations. Optional `CLAUDE.md` should reference shared project instructions, not become the only instruction source.

### 3. Provision separated environments
Use **development**, **staging/preview**, and **production** isolation. Never point preview builds or automated tests at production data. Configure independent Neon branches/projects and R2 buckets/prefixes with environment-scoped credentials. For sensitive production applications, prefer distinct projects and buckets rather than relying solely on naming conventions. Avoid copying sensitive production data into previews without approved sanitization.

### 4. Deploy application code to Cloudflare
Select Workers or another Cloudflare deployment pattern that actually supports the framework and features; validate Next.js/SSR compatibility, CPU limits, background jobs and runtime APIs before approval. Configure GitHub-based build and deployment, environment-specific secrets, custom domains, and production rollback to the previous known-good application build. Keep the GitHub repository canonical, not dashboard-only code changes.

### 5. Set up Neon PostgreSQL
Create the appropriate Neon project and database roles. Connect Cloudflare via a **supported** path (for example Hyperdrive or a supported Neon driver); validate TLS, pooling, connection limits, timeouts and credentials. Use least-privilege database roles; do not share superuser credentials with the app. Define schemas and indexes through migrations stored in GitHub. Do not use Neon-only features in core business logic without an explicit portability note.

### 6. Set up Cloudflare R2
Use R2 for images, PDFs, attachments, exports and other objects. Define allowed types, file-size limits, randomized object keys, authorization checks, malware scanning where risk warrants, retention/lifecycle policies and signed URLs for private downloads. Do not expose a public bucket for private CRM, HR or financial attachments. Store only object metadata and R2 keys in PostgreSQL. Use appropriate backup/export controls for R2 objects as well as database data.

### 7. Build and review
Implement authentication, role-based authorization and tenant isolation where applicable. Validate all inputs; protect mutations and payment webhooks; record audit events for sensitive actions. For financial systems, use idempotency keys and verified payment-provider events; do not treat UI status alone as proof of payment. Add unit/integration tests, migrations tests, and security scanning. Every production change goes through pull request, review, tests and a release note.

### 8. Prepare production release
Before going live, the Engineering Lead verifies:
- [ ] Application repository is owned by Blinto's GitHub organization and assigned to the appropriate verified team
- [ ] GitHub, Cloudflare and Neon access provided through individual invitations with least privilege and MFA
- [ ] Access register maintained; no shared passwords, owner logins or plaintext API keys
- [ ] Repository access and branch protections are configured
- [ ] Cloudflare runtime compatibility and deployment/rollback tested
- [ ] Dev/staging/prod environments and secrets isolated
- [ ] Database migrations applied and rollback/forward-fix documented
- [ ] Neon compute, storage, connection and budget alerts enabled
- [ ] Backup and **restore test** passed; RPO/RTO documented
- [ ] R2 bucket privacy, access, lifecycle and backup/export checked
- [ ] Authentication, authorization, audit logging and privacy checks passed
- [ ] Monitoring, error alerts, on-call owner and incident runbook identified
- [ ] Critical financial/customer data workloads have appropriate paid-plan and continuity approval
- [ ] Where upgrade is required, current-cost comparison of Neon paid and DigitalOcean Managed PostgreSQL is documented

### 9. Operate, review and scale
Monitor availability, error rate, Cloudflare request/CPU usage, Neon storage/CU-hours/connection saturation/slow queries, R2 growth and monthly spend. Review alerts weekly and cost/capacity monthly. Evaluate Neon paid versus DigitalOcean Managed PostgreSQL **before** business-critical operations exceed free-tier recovery or compute limits; select a suitable paid/managed option using the criteria in Step 10. Scale or migrate only with measured justification; never assume migration is necessary just because user counts increase.

### 10. Evaluate paid PostgreSQL capacity and provider options
Neon is Blinto's **default starting PostgreSQL provider**, not a permanent exclusive vendor. When free-tier limits, sustained usage, storage, connection demand, recovery objectives, reliability, or compliance requirements make an upgrade necessary, the Engineering Lead must compare **(A) an appropriate paid Neon plan** and **(B) DigitalOcean Managed PostgreSQL** before deciding. Other managed PostgreSQL services may be evaluated when justified.

Create a short written comparison based on the current published prices and Blinto's measured workload, covering:
- **Total monthly cost:** compute (including idle/always-on usage), storage, data transfer, backup/PITR retention, high availability/standby, networking, connection pooling and any required support plan.
- **Operational fit:** query latency from Cloudflare, concurrent connection limits, maintenance, monitoring, extensions, restore testing, uptime requirements, security and regional availability.
- **Migration cost/risk:** testing, export/import or replication compatibility, cutover downtime, application configuration, data validation, rollback and engineering time.
- **Decision and approval:** record the expected cost at current and projected load, selected tier/provider, reasons, owner and approval before purchase or migration.

**Decision rule:** Prefer a Neon paid upgrade if it meets performance, recovery and budget needs with less risk. Choose DigitalOcean Managed PostgreSQL when its verified total cost, consistently provisioned resources, or operational requirements are materially better. Do not assume DigitalOcean's lowest-priced single-node tier provides high availability; compare equivalent reliability tiers. Do not migrate solely because Neon Free is exhausted or because another provider advertises a lower entry price.

### 11. Migrate PostgreSQL providers if justified
Maintain standard PostgreSQL schema and versioned migrations. For a future move from Neon to DigitalOcean/AWS/another managed PostgreSQL service, inventory extensions, roles, storage, dependencies, backups and constraints; rehearse export/import or supported logical replication; test integrity, cutover, secrets rotation and application rollback. Require a maintenance/cutover plan and explicit owner. Do not describe migration as zero-downtime without validation.

## Exceptions and escalation
- **Cloudflare incompatibility:** document required alternative runtime, expected costs and migration implications; Engineering Lead decides.
- **Neon free-limit/recovery risk:** move to suitable paid service before authoritative business operations; Engineering Lead approves.
- **Outage, data-loss or credential compromise:** invoke [Incident Escalation](./incident-escalation.md) and the [Credential & Password Management Policy](./credential-and-password-management-policy.md).
- **Access changes:** follow [Access Provisioning & Deprovisioning](./access-provisioning-and-deprovisioning.md).
- **Client-specific architectures:** honor client requirements subject to security and delivery review; do not silently force the internal standard.

## Records and ownership
Keep architecture decisions, deployment instructions, migration scripts, data classification, RPO/RTO, restore-test evidence, release history, cost estimates, and exception approvals in the application repository or designated controlled records system. The Engineering Lead reviews this SOP at least every six months or when the platform materially changes.

## Related resources
- [Access Provisioning & Deprovisioning](./access-provisioning-and-deprovisioning.md)
- [Credential & Password Management Policy](./credential-and-password-management-policy.md)
- [Incident Escalation](./incident-escalation.md)
- [Deliverable QA & Approval](./deliverable-qa-and-approval.md)
- [Library Standard](./library-standard.md)
