# AGENTS.md

## Project Overview

This project is a Daily Report Dashboard application built with Next.js and TypeScript.

The main purpose of the application is to allow employees to submit daily work reports and allow managers to monitor the reports, progress, and blockers of their team.

The application should have a clean, modern, professional dashboard UI and should be designed so that it can later be deployed using Docker, Jenkins CI/CD, and Kubernetes.

---

## Main Objectives

The application must support:

1. Daily report submission.
2. Viewing daily reports.
3. Editing daily reports.
4. Viewing report history.
5. Monitoring team reports.
6. Identifying blockers quickly.
7. Filtering reports by date and user.
8. Role-based access control.
9. PostgreSQL database integration using Neon.
10. A maintainable architecture suitable for future CI/CD and containerization.

---

# Technology Stack

Use the following technologies unless there is a strong technical reason not to.

### Frontend

* Next.js
* TypeScript
* React
* App Router
* Tailwind CSS
* Lucide React for icons

### Backend

Use Next.js server-side capabilities and Route Handlers where appropriate.

### Database

* PostgreSQL
* Neon PostgreSQL

The database connection must be provided through an environment variable:

```env
DATABASE_URL="postgresql://..."
```

Never hardcode database credentials in source code.

### ORM

* Prisma

### Future Infrastructure

The application is expected to support:

* Docker
* Docker Compose
* Jenkins
* GitHub
* Kubernetes
* Terraform

Do not implement infrastructure prematurely unless explicitly requested.

---

# Project Structure

Prefer the following structure:

```text
project-root/
├── AGENTS.md
├── src/
│   ├── app/
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   │
│   │   ├── laporan/
│   │   │   ├── page.tsx
│   │   │   └── tambah/
│   │   │       └── page.tsx
│   │   │
│   │   ├── api/
│   │   │   └── reports/
│   │   │       └── route.ts
│   │   │
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── Sidebar.tsx
│   │   ├── Navbar.tsx
│   │   ├── StatCard.tsx
│   │   ├── ReportForm.tsx
│   │   ├── ReportCard.tsx
│   │   └── DataTable.tsx
│   │
│   ├── lib/
│   │   ├── prisma.ts
│   │   └── utils.ts
│   │
│   └── types/
│       └── report.ts
│
├── prisma/
│   └── schema.prisma
│
├── public/
├── .env.local
├── package.json
├── tsconfig.json
└── ...
```

Do not create unnecessary folders or files.

---

# Application Roles

The initial application has two roles.

## 1. EMPLOYEE

Employees can:

* View their dashboard.
* Create their daily report.
* View their own reports.
* Edit their own reports.
* View their report history.

Employees must not be able to modify another employee's reports.

## 2. MANAGER

Managers can:

* View their dashboard.
* View reports from all team members.
* Filter reports by date.
* Filter reports by employee.
* Monitor blockers.
* View team reporting status.
* View report history.

Managers should not automatically have unrestricted system administration privileges.

---

# Future Role

A future `SUPER_ADMIN` role may be introduced.

SUPER_ADMIN may manage:

* Users
* Roles
* Departments
* Application configuration

Do not implement SUPER_ADMIN unless explicitly requested.

---

# Daily Report Fields

Each daily report should contain the following fields:

```text
id
date
name
email
today_work
tomorrow_plan
blocker
created_at
updated_at
```

Conceptually:

```text
DailyReport
├── id
├── date
├── name
├── email
├── today_work
├── tomorrow_plan
├── blocker
├── created_at
└── updated_at
```

---

# Daily Report Form

The main report form contains:

### Date

Required.

### Name

Required.

### Email

Required.

### Today's Work

Question:

"What have you done today?"

Required.

### Tomorrow's Plan

Question:

"What is your plan for tomorrow?"

Required.

### Blocker

Question:

"What are your blockers today?"

Required.

If there is no blocker, the user may enter:

```text
Tidak ada
```

The form should provide clear validation messages.

---

# Dashboard Requirements

The dashboard should prioritize useful information instead of visual decoration.

The dashboard should eventually display:

```text
Total Reports
Today's Reports
Missing Reports
Active Blockers
```

Example:

```text
┌─────────────────┐
│ Total Reports   │
│ 86              │
└─────────────────┘

┌─────────────────┐
│ Today's Reports │
│ 12              │
└─────────────────┘

┌─────────────────┐
│ Missing Reports │
│ 3               │
└─────────────────┘

┌─────────────────┐
│ Active Blockers │
│ 4               │
└─────────────────┘
```

The dashboard should also display recent reports.

---

# Report Status

The UI may visually distinguish reports based on blocker status.

Suggested states:

```text
NO_BLOCKER
HAS_BLOCKER
```

Visual indicators may use:

* Green for no blocker.
* Red or warning styling for blocker.

Do not rely solely on color. Include text or icons for accessibility.

---

# UI/UX Guidelines

The UI should be:

* Clean
* Modern
* Professional
* Responsive
* Easy to understand
* Suitable for desktop and tablet
* Accessible

Avoid:

* Excessive animations
* Excessive gradients
* Unnecessary decorative elements
* Very large text
* Overly complicated navigation

Prioritize usability.

---

# Navigation

The main navigation should eventually include:

```text
Dashboard
Laporan
  - Laporan Saya
  - Buat Laporan

For Manager:

Dashboard
Semua Laporan
Monitoring
```

Use Lucide React icons.

Do not manually create SVG icons unless necessary.

---

# Next.js Guidelines

Use the Next.js App Router.

Prefer Server Components by default.

Use `"use client"` only when client-side functionality is required, such as:

* Form interaction
* Browser APIs
* Client-side state
* Interactive charts
* Interactive filters

Do not add `"use client"` to every component.

Use appropriate server-side data fetching where possible.

Avoid unnecessary client-side fetching.

---

# TypeScript Guidelines

Use strict TypeScript.

Avoid:

```ts
any
```

unless absolutely necessary.

Prefer explicit interfaces and types.

Example:

```ts
interface DailyReport {
  id: string;
  date: Date;
  name: string;
  email: string;
  todayWork: string;
  tomorrowPlan: string;
  blocker: string;
}
```

Use meaningful names.

Avoid unclear names such as:

```ts
data
item
obj
x
temp
```

when a more descriptive name is possible.

---

# Component Guidelines

Create reusable components when the same UI pattern appears multiple times.

Examples:

```text
StatCard
ReportCard
DataTable
Button
Input
Textarea
Modal
```

Do not create components for extremely small pieces that are only used once unless doing so significantly improves readability.

Keep components focused on one responsibility.

---

# API Guidelines

Use Next.js Route Handlers for API endpoints when appropriate.

Example:

```text
GET    /api/reports
POST   /api/reports
GET    /api/reports/[id]
PUT    /api/reports/[id]
DELETE /api/reports/[id]
```

API responses should use consistent structures.

Example success:

```json
{
  "success": true,
  "data": {}
}
```

Example error:

```json
{
  "success": false,
  "error": "Unable to create report"
}
```

Validate all incoming data.

Never trust data coming directly from the client.

---

# Database Guidelines

Use Prisma for database access.

Database credentials must come from:

```env
DATABASE_URL
```

Never hardcode:

* Database passwords
* API keys
* Tokens
* Secrets

Never commit:

```text
.env
.env.local
```

to Git.

Before changing the database schema, inspect the existing schema.

If an existing Neon database is provided, prefer inspecting it first rather than blindly creating new tables.

Use Prisma commands appropriately.

For an existing database, consider:

```bash
npx prisma db pull
```

For schema-managed development:

```bash
npx prisma migrate dev
```

Do not run destructive database commands without explicit confirmation.

Never use destructive commands such as:

```bash
prisma migrate reset
```

unless explicitly requested.

---

# Security

Never expose:

```text
DATABASE_URL
database password
API secrets
authentication secrets
```

to the browser.

Never use:

```env
NEXT_PUBLIC_DATABASE_URL
```

for database credentials.

Never commit secrets to GitHub.

Validate and sanitize user input.

Implement authorization checks on the server, not only in the UI.

An employee must never be able to access another employee's report by changing an ID in a URL or API request.

---

# Authentication

Authentication should be implemented later.

When authentication is implemented:

* Users must have an authenticated session.
* User identity must be determined from the server-side session.
* Do not trust `name` or `email` submitted from the client to determine the authenticated user.
* Role authorization must be enforced server-side.

Do not implement authentication unless requested.

---

# Validation

All forms must validate required fields.

Required:

```text
date
name
email
today_work
tomorrow_plan
blocker
```

Email must have a valid email format.

Text fields should have reasonable length limits.

Display validation errors close to the relevant input.

---

# Error Handling

Do not silently ignore errors.

Handle:

* Database connection errors
* Validation errors
* API errors
* Not found errors
* Unauthorized access
* Server errors

User-facing messages should be understandable.

Do not expose sensitive database or server details to users.

---

# Loading States

Interactive pages should provide appropriate loading states.

Examples:

```text
Loading reports...
Submitting report...
Saving...
```

Avoid leaving users uncertain whether an action is running.

---

# Empty States

When there are no reports, display a useful empty state.

Example:

```text
Belum ada laporan.

Buat laporan harian pertama Anda.
```

Do not display an empty table with no explanation.

---

# Accessibility

Use semantic HTML.

Prefer:

```html
<button>
<input>
<label>
<form>
<header>
<nav>
<main>
<section>
```

instead of clickable generic elements.

All form inputs must have labels.

Do not rely only on color to communicate status.

Ensure keyboard accessibility.

---

# Code Quality

Before considering a task complete:

1. Run the development server.
2. Check the affected page.
3. Check TypeScript errors.
4. Check lint errors.
5. Verify the feature works.
6. Check responsive behavior where applicable.

Use:

```bash
npm run dev
```

and appropriate project checks.

Do not claim a feature works if it has not been verified.

---

# Git Guidelines

Use clear commit messages.

Examples:

```text
feat: add daily report form
feat: add report dashboard
feat: connect Neon PostgreSQL
feat: add report API
fix: validate daily report form
refactor: extract report card component
```

Do not commit:

```text
.env
.env.local
node_modules/
.next/
```

---

# Development Workflow

When implementing a feature:

1. Understand the requirement.
2. Inspect the existing project structure.
3. Reuse existing components when possible.
4. Implement the smallest reasonable change.
5. Keep TypeScript types explicit.
6. Validate user input.
7. Test the feature.
8. Check for regressions.
9. Explain important changes.

Do not rewrite unrelated parts of the application.

---

# Important Project Principle

This application is intended to become a real-world DevOps project.

The long-term architecture is:

```text
User
 │
 ▼
Next.js Dashboard
 │
 ▼
Next.js API
 │
 ▼
Prisma
 │
 ▼
Neon PostgreSQL
```

Future deployment:

```text
GitHub
   │
   ▼
Jenkins
   │
   ├── Test
   ├── Build
   └── Docker Build
          │
          ▼
     Docker Image
          │
          ▼
     Kubernetes
          │
          ▼
     Next.js Application
```

Keep the application architecture clean and container-friendly.

Do not introduce unnecessary infrastructure complexity during the initial development phase.

---

# Current Development Priority

Implement features in this order:

## Phase 1 — UI

* Dashboard layout
* Sidebar
* Navbar
* Statistic cards
* Report list
* Daily report form

## Phase 2 — Database

* Connect Neon PostgreSQL
* Configure Prisma
* Inspect existing database
* Create or synchronize required schema

## Phase 3 — API

* Create report
* Get reports
* Get report by ID
* Update report
* Delete report

## Phase 4 — Dashboard Integration

* Display real reports
* Filter reports
* Display statistics
* Display blockers

## Phase 5 — Authentication

* Login
* Employee role
* Manager role
* Authorization


# AI Agent Behavior

When working on this project:

* Read this AGENTS.md before making changes.
* Follow the existing architecture.
* Do not introduce unnecessary dependencies.
* Do not change technologies without justification.
* Do not remove existing functionality without explicit instruction.
* Do not modify database data destructively.
* Do not expose secrets.
* Prefer simple and maintainable solutions.
* Ask for clarification when a requirement is genuinely ambiguous.
* When possible, explain why an architectural decision was made.
* Keep changes focused on the requested task.

The goal is not only to make the application work, but to keep the codebase understandable for developers who are learning Next.js, TypeScript, databases, and DevOps.

---

# Definition of Done

A feature is considered complete when:

* The requested functionality is implemented.
* TypeScript has no relevant errors.
* Linting passes.
* The UI is usable.
* Forms have validation.
* Errors are handled.
* Database operations are safe.
* Authorization is enforced where applicable.
* No secrets are exposed.
* The implementation follows this AGENTS.md.
* Existing functionality is not unnecessarily broken.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
