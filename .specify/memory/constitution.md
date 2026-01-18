<!--
  SYNC IMPACT REPORT
  ==================
  Version change: Template → 1.0.0
  Modified principles: N/A (initial creation)
  Added sections:
    - I. Code Quality
    - II. Testing Standards
    - III. User Experience Consistency
    - IV. Performance Requirements
    - Governance section
  Removed sections: N/A
  Templates requiring updates:
    ✅ plan-template.md - Constitution Check section uses generic gates (no changes needed)
    ✅ spec-template.md - Generic template (no changes needed)
    ✅ tasks-template.md - Generic template (no changes needed)
    ✅ checklist-template.md - Generic template (no changes needed)
  Follow-up TODOs: None
-->

# Taichimdp Constitution

## Core Principles

### I. Code Quality

All code MUST adhere to established quality standards before merge. Code reviews must verify: clear naming conventions, proper error handling, comprehensive documentation for public APIs, and absence of code smells. Functions and classes MUST have a single, well-defined responsibility. Dead code, commented-out blocks, and unused imports MUST be removed. Linting and formatting tools MUST pass without errors before code review. Refactoring technical debt takes precedence over adding features when debt impedes maintainability.

**Rationale**: High code quality reduces bugs, improves maintainability, and accelerates development velocity. Consistent standards enable team collaboration and reduce cognitive load when reading code.

### II. Testing Standards

All features MUST include appropriate test coverage. Unit tests are required for business logic and critical paths. Integration tests are mandatory for API endpoints, database interactions, and cross-component workflows. Tests MUST be written before or alongside implementation (TDD preferred). Test suites MUST pass before merge. Flaky or unreliable tests MUST be fixed immediately. Test coverage thresholds MUST be maintained as defined in project configuration.

**Rationale**: Comprehensive testing prevents regressions, enables confident refactoring, and serves as executable documentation. Tests validate that features work as intended under both normal and edge conditions.

### III. User Experience Consistency

User-facing features MUST provide consistent interfaces, interactions, and feedback patterns across the application. Design system components MUST be reused rather than creating duplicates. Error messages MUST be user-friendly, actionable, and consistent in tone and format. Loading states, success confirmations, and error handling MUST follow established UX patterns. Accessibility standards MUST be met (WCAG 2.1 Level AA minimum). Breaking changes to user-facing APIs or UIs require deprecation notices and migration paths.

**Rationale**: Consistent UX reduces user confusion, improves learnability, and builds trust. Predictable interfaces enable users to transfer knowledge from one part of the application to another.

### IV. Performance Requirements

Performance is a feature requirement, not an afterthought. Response times, resource consumption, and scalability limits MUST be defined in feature specifications and measured during implementation. Database queries MUST be optimized; N+1 problems and missing indexes are unacceptable. Frontend assets MUST be optimized for size and loading performance. Caching strategies MUST be considered for frequently accessed data. Performance budgets MUST be established and monitored. Degradation under load MUST be graceful, not catastrophic.

**Rationale**: Poor performance directly impacts user satisfaction and business metrics. Performance issues become exponentially harder to fix post-deployment and can limit scalability.

## Governance

**Amendment Procedure**: Constitution changes require documented justification, team review, and approval. Amendments that modify or remove principles (breaking changes) require MAJOR version bump. New principles or substantial additions require MINOR version bump. Clarifications and non-semantic changes require PATCH version bump.

**Versioning Policy**: Follow semantic versioning (MAJOR.MINOR.PATCH):
- MAJOR: Backward incompatible changes (principle removals or redefinitions)
- MINOR: New principles or materially expanded guidance
- PATCH: Clarifications, wording improvements, typo fixes

**Compliance Review**: All pull requests and feature implementations MUST pass constitution compliance checks during code review. Violations must be explicitly justified in the plan.md Complexity Tracking section if unavoidable. Regular constitution reviews should occur quarterly or when project scope significantly changes.

**Version**: 1.0.0 | **Ratified**: 2026-01-15 | **Last Amended**: 2026-01-15
