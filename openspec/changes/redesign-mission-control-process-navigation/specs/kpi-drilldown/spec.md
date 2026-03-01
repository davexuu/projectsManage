## ADDED Requirements

### Requirement: Every KPI card SHALL support direct drilldown
Each KPI card shown in Mission Control MUST be clickable and MUST open a drilldown detail view tied to that KPI definition.

#### Scenario: Click KPI card
- **WHEN** a user clicks any KPI card in Mission Control
- **THEN** the system opens the KPI-specific drilldown detail view

#### Scenario: No non-drilldown KPI cards
- **WHEN** KPI cards are rendered
- **THEN** each KPI card has an active interaction path to detailed records

### Requirement: KPI drilldown SHALL preserve context and reduce steps
KPI drilldown MUST inherit current project context and filter conditions, and MUST support a short path from summary to detailed list.

#### Scenario: Inherit project and KPI filters
- **WHEN** a user drills down from a KPI card
- **THEN** the detail view uses the same project context and applies KPI-derived default filters automatically

#### Scenario: Continue from detail summary to full list
- **WHEN** a user chooses to view full details from drilldown
- **THEN** the system opens the corresponding full list while preserving inherited filters

### Requirement: KPI presentation SHALL support role-based differentiation
Mission Control KPI composition MUST support role-specific definitions for ADMIN, PM, and MEMBER, including visible KPIs and default ordering.

#### Scenario: ADMIN view
- **WHEN** an ADMIN user opens Mission Control
- **THEN** the system displays the ADMIN KPI set and default order

#### Scenario: PM view
- **WHEN** a PM user opens Mission Control
- **THEN** the system displays the PM KPI set and default order

#### Scenario: MEMBER view
- **WHEN** a MEMBER user opens Mission Control
- **THEN** the system displays the MEMBER KPI set and default order
