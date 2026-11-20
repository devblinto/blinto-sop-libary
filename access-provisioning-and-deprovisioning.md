---
title: Access Provisioning & Deprovisioning
type: sop
department: Operations & Finance
owner: Operations & Finance
supporting_departments:
  - People & Culture
status: approved
version: 1.2
last_reviewed: 2026-11-02
review_cycle: 6-months
tags:
  - access
  - security
  - onboarding
  - offboarding
  - least-privilege
  - access-register
related:
  - credential-and-password-management-policy
  - employee-onboarding
  - employee-offboarding
  - employee-onboarding-checklist
  - employee-offboarding-checklist
  - wordpress-security-standard
  - client-access-collection
---

# Access Provisioning & Deprovisioning

## Purpose

Define how Blinto requests, approves, grants, reviews, changes, suspends, and removes access to company and client systems throughout a person's working relationship with Blinto.

This SOP governs **access lifecycle**. Password creation, password-manager configuration, credential sharing, recovery, and compromise handling are governed by [Credential & Password Management Policy](./credential-and-password-management-policy.md).

## Scope

Applies to employees, interns, contractors, consultants, and other authorized collaborators who require access to company or client systems, infrastructure, repositories, communication/project-management platforms, hosting/domain/DNS systems, business/administrative systems, data stores, or other digital resources controlled or accessed by Blinto.

Where a client's security/access requirements are stricter than this SOP, follow the stricter client requirement.

## Core Principles

- **Least privilege:** grant only the minimum access required for current responsibilities.
- **Individual identity:** use individual named accounts whenever supported.
- **No unmanaged credential sharing:** shared credentials, where unavoidable, must follow the canonical credential policy.
- **MFA:** enable/require MFA where applicable, especially for privileged/sensitive access.
- **Access has an owner:** every material grant has an identifiable business/system owner and reason.
- **Register before you share:** nothing is shared with a person (tool seat, shared login, client account, admin role, password-manager vault) until it is recorded in the [Access Register](#access-register). If it is not in the register, it must not be shared.
- **Temporary access is time-bound:** contractor, consultant, intern, project-specific, and emergency access should have an expiry/review point where supported.

## Roles

### Requester
Normally the Team Lead, Project/Delivery Lead, or another authorized owner requests privileged, client, or material access.

### System / Data Owner
Determines whether access is appropriate and what permission level is required.

### Team Lead / Project Lead
Confirms the business need and fit with actual responsibilities.

### People Operations / HR
Coordinates onboarding, role change, contract change, and offboarding triggers and ensures required actions are tracked. Maintains the [Access Register](#access-register) and records baseline access on day one.

### Department Head
Requests or approves access for their own department and keeps their team's register rows accurate. Confirms revocation of their team's access at offboarding.

### CEO / Executive Owner
Approves only highly sensitive or material company-level access where designated. CEO approval is not routine for ordinary operational access.

## Access Classification

### Standard Access
Routine operational access with limited administrative/security impact.

**Approval:** appropriate system/data owner or authorized operational owner.

### Privileged / Administrative Access
Access that can materially change configuration, users, permissions, production systems, security settings, billing, sensitive data, or other high-impact resources.

**Approval:** Team/Project Lead business confirmation + system/data owner approval.

### Highly Sensitive Access
Ownership/root/super-admin or equivalent access where misuse or loss could create material financial, security, legal, organizational, or business-continuity risk.

**Approval:** designated system/executive owner and any required company-level approval.

Specific tools should be classified in the authoritative access register/system rather than hard-coded here.

## Provisioning Workflow

Follow this order every time access is granted, at onboarding or mid-employment. Recording comes **before** sharing.

### 1. Request and establish business need
The Department Head (or Team/Project Lead) requests the access and states the person, system/resource, reason, permission level, permanent/temporary status, and expiry/review date where applicable.

### 2. Obtain approval
Apply the approval level appropriate to the access classification. The Department Head approves standard access for their own department.

### 3. Record the grant in the Access Register
People Operations (or the approving Department Head) adds the row to the [Access Register](#access-register) **before** any invite, seat, or credential is shared.

### 4. Create/invite individual account
Use the authorized work identity/email, minimum required role, and applicable MFA. Do not transfer another person's account.

Prefer, in this order:

1. **Google sign-in (SSO) with the company account** wherever the tool supports it, so suspending the company account removes access.
2. **An individual invite/seat** with the company email.
3. **A shared credential only through the department's password-manager vault** (1Password or the approved equivalent), following [Credential & Password Management Policy](./credential-and-password-management-policy.md).

Never send passwords, codes, or login links through Telegram, WhatsApp, email, ClickUp comments, or any other chat.

### 5. Verify access and confirm the row
Confirm the person can access what is required without unnecessary additional privileges, then mark the register row as active with the grant date.

The SOP Library must not become a duplicate access register.

## Onboarding

Provision access as part of [Employee Onboarding](./employee-onboarding.md), based on actual role requirements rather than cloning another employee's access profile. Highly sensitive access should be granted only when actually required.

On day one, People Operations records the new joiner's baseline access (company email, ClickUp, Google Drive, communication tools, password-manager vaults, department tools) in the Access Register. Anything added later follows the [Provisioning Workflow](#provisioning-workflow).

## Contractors, Consultants & Interns

Access should be narrower and time-bound by default. Grant only required systems, set expiry/review dates where possible, avoid persistent privileged access without justification, and remove access when the assignment/engagement ends.

## Role, Team, Project or Responsibility Change

A responsibility change triggers an access review. Add newly required access and remove/reduce access that is no longer justified. Do not allow access to accumulate indefinitely across old projects or roles.

The old and new Department Heads update the person's register rows: new rows are added before access is shared, and access no longer needed is revoked and closed in the register.

## Temporary & Emergency Access

Temporary elevated access must have a specific purpose, minimum necessary privilege, expiry/review point where possible, and post-use review. Emergency access does not waive accountability.

## Periodic Access Review

### Monthly register check
Each Department Head reviews their team's Access Register rows **monthly**, adds anything missing, and revokes and closes anything no longer needed.

### Privileged and client access
Review at least **quarterly**.

### Routine company access
Review at least **every 6 months**, or sooner when a lifecycle event occurs.

Do not wait for the scheduled review to remove access known to be unnecessary.

## Deprovisioning / Offboarding

Access removal is a mandatory part of [Employee Offboarding](./employee-offboarding.md).

Before the effective exit time, transfer required ownership of files, repositories, client assets, automations/integrations, administrative ownership, and other continuity-critical resources.

The person's open Access Register rows are the revocation checklist. People Operations copies them into the offboarding record; the Department Head adds anything the register is missing (then registers it so the gap is closed).

At or before the effective exit time, remove/suspend access according to the approved plan. Verify revocation, invalidate relevant sessions/tokens, and rotate shared credentials only when individual revocation cannot adequately protect them, following [Credential & Password Management Policy](./credential-and-password-management-policy.md).

Access removal is complete only when every open register row for the person is closed, each confirmed by both People Operations and the Department Head, as part of the [Employee Offboarding Checklist](./employee-offboarding-checklist.md).

## Emergency Suspension / Revocation

Where there is a credible security, employment, client, or business-continuity risk, an authorized Team Lead, People Operations representative, system/security owner, or executive owner may trigger immediate suspension/revocation. Actions should be proportionate and documented as soon as practical.

## Access Register

The Access Register is the single, authoritative record of who can reach which company and client systems.

### Where it lives
- **Target:** the Access Register module in Blinto HRMS (hrms.blinto.co), once released.
- **Until then:** an interim register maintained by People Operations in ClickUp. Do not keep parallel copies in sheets, chats, or documents.

### What each row records
- person;
- tool, system, or account, and whether it is an internal tool or a client account;
- login method: Google sign-in, password-manager vault, or a separate individual password;
- access level: admin, editor, or viewer (or the system's equivalent);
- reason and owning Department Head / approver;
- granted by and date; revoked by and date;
- last reviewed date;
- whether temporary, and when it expires.

Revoked rows are closed, not deleted, so history is kept.

Do not store passwords/secrets in the access register unless the approved credential-management system itself is serving that function.

### Who maintains it
- **People Operations** owns the register, records baseline access at onboarding, and drives closure at offboarding.
- **Department Heads** request and approve access for their department and keep their team's rows accurate.

### Client accounts
Client systems are registered like any other access, marked as client accounts. Collect client access through [Client Access Collection](./client-access-collection.md), then register each person's access before sharing it with them. Remove it at project end or when the person leaves the project.

## Completion Record

Access work is complete when:

- every grant has a register row created **before** the access was shared;
- every change of role or project has updated rows;
- each Department Head has completed the monthly check of their team's rows;
- at offboarding, every open row is closed and confirmed by People Operations and the Department Head.

## Exceptions

Exceptions must be justified, time-bound where possible, approved by the appropriate owner, and supported by compensating controls when a system limitation prevents the normal control.

## Related Resources

- [Credential & Password Management Policy](./credential-and-password-management-policy.md)
- [Employee Onboarding](./employee-onboarding.md)
- [Employee Onboarding Checklist](./employee-onboarding-checklist.md)
- [Employee Offboarding](./employee-offboarding.md)
- [Employee Offboarding Checklist](./employee-offboarding-checklist.md)
- [WordPress Security Standard](./wordpress-security-standard.md)
- [Client Access Collection](./client-access-collection.md)
