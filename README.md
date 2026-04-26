# CureRays Clinical Workflow System

CureRays Clinical Workflow System (CWS) is planned as a production-level clinical workflow dashboard for coordinating patient treatment operations with clarity, security, and speed.

The goal is to replace spreadsheet-driven patient tracking with a centralized, API-driven system where workflow state is explicit, auditable, and easy for clinical teams to scan. The dashboard should feel like the place where the clinic runs its daily operation: calm, precise, and designed around the work clinicians and operations staff actually need to complete.

## Product Overview

CureRays CWS is intended to simplify complex clinical workflows by turning manual tracking into a structured, state-driven experience.

The interface should support:

- Fast patient visibility across treatment phases
- Clear ownership of next actions
- Operational awareness without visual clutter
- Role-aware access to sensitive clinical information
- Audit-ready workflow history
- Modular iteration as more clinical source documents are reviewed

This README is an initial product, design, architecture, and implementation brief. It does not describe a completed application yet.

## Current Frontend Prototype

This repository now includes the initial frontend implementation for the CureRays CWS dashboard.

Implemented frontend scope:

- Next.js App Router project at the repository root
- React and TypeScript components
- Custom Tailwind CSS theme aligned with CureRays branding
- Dashboard, Master Records, Upcoming, On Treatment, Post, Reports, and Audit Logs pages
- Typed anonymized mock data for patient workflows
- Phase-driven filtered views over a single patient dataset
- HIPAA-aware UI cues for role visibility, audit posture, and sensitive-data minimization

Run commands:

```bash
npm install
npm run dev
npm run build
```

The backend, database, real authentication, Prisma schema, and production audit logging are not implemented in this frontend phase.

## Current-State Problem

The current workflow is based on Google Sheets with multiple tabs and manual movement of patient rows between workflow views.

That approach creates several risks:

- Patient rows can be copied, moved, or edited inconsistently
- Workflow visibility depends on manual sheet maintenance
- Audit history is limited or absent
- Operational status can become fragmented across tabs
- Checklist completion and flags are harder to validate centrally
- Sensitive information can be exposed without strong role-based controls

The new system should remove manual row handling and make workflow visibility a result of structured patient state.

## Target Workflow Model

The target model uses one centralized database as the source of truth.

Patients are stored once. Their workflow visibility is determined by data fields, especially `Phase`, rather than by copying records between locations.

Initial workflow phases:

- `Upcoming`
- `On Treatment`
- `Post`

Initial patient status values:

- `Active`
- `On Hold`
- `Paused`

Views in the UI should be filtered outputs of the same underlying patient records. A patient appearing in the Upcoming, On Treatment, or Post view should be the result of their current phase, not a separate duplicated record.

## Core Design Principle: Phase-Driven Visibility

The core workflow rule is:

**Phase is state, not location.**

Updating a patient's `Phase` automatically determines where that patient appears in the product. There should be no manual copying or moving of rows.

This principle should guide the data model, API design, UI filters, audit trail, and future workflow automation.

Expected behavior:

- A patient record exists once in the database
- Phase changes update visibility across dashboard views
- Phase changes are auditable
- Filtered views derive from patient state
- Staff actions focus on updating structured fields, not managing spreadsheet placement

## Technology Stack

The planned system uses the following stack:

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS with a custom CureRays design system

### Backend

- NestJS for APIs, authentication, authorization, and business logic

### Database

- PostgreSQL as the primary database
- Prisma ORM for schema modeling and data access

### Architecture

- API-driven frontend/backend separation
- Secure authentication and role-based access control
- Modular clinical workflow services
- Audit-aware data mutations
- Scalable structure for future forms, worksheets, reports, and operational workflows

## Initial Dashboard Scope

The dashboard should provide a high-end clinical operations workspace with clear hierarchy and minimal clutter.

### Sidebar Navigation

Initial navigation areas:

- Dashboard
- Master Records
- Upcoming
- On Treatment
- Post
- Reports
- Audit Logs

### Header

The header should include:

- Welcome message
- Global search
- Notifications
- User profile access
- Add Patient action

### KPI Cards

Initial KPI cards:

- Total Patients
- Upcoming
- On Treatment
- Post
- Flags

### Patient Workflow Table

The main table should support fast scanning of operational state.

Initial columns:

- Patient ID
- Name
- Diagnosis
- Phase
- Status
- Assigned Staff
- Next Action
- Checklist Progress
- Flags
- Last Updated

### Right Panel

The right panel should surface immediate operational context:

- Appointments
- Priority Flags
- Recent Activity

### Bottom Section

The lower dashboard area should summarize broader operational health:

- Checklist Progress Overview
- Operational Snapshot

## Initial Patient Data Fields

The initial patient model should account for:

- Patient ID
- Name
- Diagnosis
- Location
- MD
- Phase
- Status
- Start Date
- End Date
- Assigned Staff
- Next Action
- Flags / Issues
- Notes

Initial checklist fields:

- TX Summary Complete
- Follow-Up Scheduled
- Billing Complete

These fields are provisional and should be refined after additional source documents are uploaded and analyzed.

## Design System Direction

CureRays CWS should feel like a polished, modern clinical SaaS product rather than a generic admin template.

The visual direction should emphasize:

- Apple macOS-level polish
- Liquid glass and restrained glassmorphism
- Soft pastel gradients
- Smooth depth and layering
- Clean whitespace
- Minimal clinical clutter
- Clear hierarchy for fast scanning
- Calm interaction states
- Dense but readable operational surfaces

The UI should avoid harsh colors, overcrowded panels, and decorative elements that reduce clinical clarity.

### Brand Palette

Primary colors:

- Orange: `#FF671F`
- Blue: `#0033A0`

Accent colors:

- Amber: `#FFC701`
- Plum: `#725784`
- Light Yellow: `#FFD54F`

Neutral colors:

- Air White: `#F5F5F5`
- Dark Plum: `#2E1A47`

Supporting colors:

- Indigo: `#3D5A80`
- Light Indigo: `#7DA0CA`

Tailwind should be customized around this palette rather than relying on default styling.

## Security And Compliance Posture

CureRays CWS should be designed with HIPAA-aligned security thinking from the start.

The UI and architecture should account for:

- Role-based access cues and permission-aware navigation
- Audit visibility for sensitive workflow changes
- Sensitive data minimization in dashboard surfaces
- Clear separation between operational summaries and detailed patient records
- Authentication and authorization enforced by backend APIs
- Least-privilege access patterns
- No unnecessary exposure of critical patient information
- Secure handling of clinical notes, flags, and audit logs

Security must not be treated as a later visual layer. It should shape routing, API contracts, data visibility, logging, and user experience.

## Architecture Principles

Implementation should stay modular and flexible because the clinical workflow is expected to evolve.

Guiding principles:

- Build component-based UI surfaces that can be rearranged or extended
- Keep workflow state in structured fields rather than view-specific copies
- Treat filtered views as projections of centralized patient data
- Keep business rules in backend services, not only in frontend components
- Use typed API contracts between frontend and backend
- Preserve audit context for important patient updates
- Design RBAC as a first-class architecture concern
- Avoid hardcoding final workflow assumptions before source documents are fully reviewed

## Iteration Note: Workflow Subject To Change

The current workflow, data fields, dashboard structure, and UI logic are based on initial documentation only.

They are subject to change after additional source documents are uploaded and analyzed, including:

- Manual worksheets
- Clinical forms
- Operational files
- Existing treatment coordination documents
- Billing and follow-up workflows

The system should therefore be designed for iteration. Early implementation should prioritize flexible foundations over rigid clinical assumptions.

## Planned Implementation Phases

### Phase 1: Foundation

- Create the Next.js, React, TypeScript, and Tailwind frontend foundation
- Establish custom CureRays theme tokens
- Create base layout, navigation, and dashboard shell
- Define initial mock data structures for dashboard design validation

### Phase 2: Dashboard Experience

- Build KPI cards, patient workflow table, right panel, and operational overview
- Add phase-driven filtered dashboard views
- Create reusable components for status, phase, checklist progress, flags, and activity
- Validate responsive layout and visual hierarchy

### Phase 3: Backend And Data Model

- Create NestJS API foundation
- Model initial patient workflow entities with Prisma
- Connect PostgreSQL as the source of truth
- Implement patient list, filtering, phase updates, and checklist persistence

### Phase 4: Security And Auditability

- Add authentication and role-based access control
- Implement audit logging for sensitive patient workflow changes
- Add permission-aware UI states
- Review dashboard surfaces for sensitive-data minimization

### Phase 5: Source Document Refinement

- Analyze uploaded worksheets, forms, and operational files
- Refine workflow phases, statuses, fields, reports, and checklist logic
- Adjust UI structure and backend models based on real clinical operations
- Prepare the system for production hardening and deployment planning
