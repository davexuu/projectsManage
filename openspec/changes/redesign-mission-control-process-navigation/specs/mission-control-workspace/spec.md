## ADDED Requirements

### Requirement: Mission Control SHALL be a standalone project-space page
The system MUST provide Mission Control as a standalone page inside project space, separate from process work pages, and MUST keep the current project context visible at all times.

#### Scenario: Enter Mission Control from project space
- **WHEN** a user enters project space and clicks Mission Control
- **THEN** the system opens a standalone Mission Control page under the selected project context

#### Scenario: Keep project context visible
- **WHEN** the user views any section in Mission Control
- **THEN** the system shows the current project identity and applies it to all Mission Control data blocks

### Requirement: Mission Control SHALL provide high-frequency command modules
Mission Control MUST include KPI overview cards, report status cards, and quick actions that minimize navigation hops for common project management actions.

#### Scenario: View required modules
- **WHEN** a user opens Mission Control
- **THEN** the page contains KPI cards, weekly/monthly report status cards, and quick action entry points

#### Scenario: Quick action use
- **WHEN** a user triggers a quick action from Mission Control
- **THEN** the system navigates directly to the target flow without requiring redundant project selection

### Requirement: Mission Control interaction SHALL prioritize operability over decoration
Mission Control MUST avoid long animations, complex 3D interactions, and hidden primary operations.

#### Scenario: Primary actions remain visible
- **WHEN** Mission Control loads
- **THEN** all primary actions are directly visible without extra reveal interactions

#### Scenario: Motion constraints
- **WHEN** transitions occur inside Mission Control
- **THEN** the system uses short, non-blocking transitions and does not use long animation sequences
