## ADDED Requirements

### Requirement: Weekly and monthly reports SHALL use independent report entities
The system MUST create independent weekly and monthly report entities, rather than storing reports only as raw progress or status records.

#### Scenario: Create weekly report entity
- **WHEN** a user starts a weekly report for a project and period
- **THEN** the system creates or loads a weekly report entity for that project-period key

#### Scenario: Create monthly report entity
- **WHEN** a user starts a monthly report for a project and period
- **THEN** the system creates or loads a monthly report entity for that project-period key

### Requirement: Report drafting SHALL support automatic generation from project data
The system MUST support auto-generated report drafts derived from existing project data (including progress records, status assessments, risks, changes, milestones, and WBS summary metrics).

#### Scenario: Generate weekly draft
- **WHEN** a user requests weekly report draft generation
- **THEN** the system generates a draft populated from available project data sources

#### Scenario: Generate monthly draft
- **WHEN** a user requests monthly report draft generation
- **THEN** the system generates a draft populated from available project data sources

### Requirement: Auto-generated content SHALL remain editable with provenance trace
Users MUST be able to edit generated report content before submission, and the system MUST retain source provenance for generated sections.

#### Scenario: Edit generated draft
- **WHEN** a user edits an auto-generated report draft
- **THEN** the system saves user edits and does not force regeneration overwrite

#### Scenario: View source provenance
- **WHEN** a user inspects generated report sections
- **THEN** the system can identify the source category used for generation

### Requirement: Report entry points SHALL be available in both monitoring flow and Mission Control status cards
The system MUST provide full report management in 监控 process pages and MUST provide report status cards plus quick entry in Mission Control.

#### Scenario: Open report from monitoring process
- **WHEN** a user navigates to monitoring report pages
- **THEN** the system provides create/edit/submit report operations

#### Scenario: Open report from Mission Control card
- **WHEN** a user clicks a report status card in Mission Control
- **THEN** the system opens the related weekly or monthly report draft for the current project context
