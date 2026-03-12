## ADDED Requirements

### Requirement: Rule-based requirement planning output
The system SHALL accept a project, an item type, a requirement description, and a planned date range, then generate a rule-based planning result that includes a requirement summary, candidate to-do items, light-weight WBS drafts, and an explanation of the applied rule path.

#### Scenario: Generate planning result from a requirement description
- **WHEN** a user submits a valid project ID, item type, requirement description, planned start date, and planned end date through the WBS quick planning entry
- **THEN** the system returns a structured result containing `requirementSummary`, `todos`, `wbsDrafts`, and `reason`

#### Scenario: Reject invalid planning input
- **WHEN** a user submits an empty requirement description, an unknown project ID, a missing item type, or an invalid date range
- **THEN** the system rejects the request with a validation or business error and does not generate drafts

### Requirement: To-do items bridge requirement text and WBS drafts
The system SHALL expose candidate to-do items as an explicit intermediate layer between the original requirement description and the generated WBS drafts.

#### Scenario: To-do items are included in the planning result
- **WHEN** the system generates a planning result
- **THEN** each result includes one or more candidate to-do items expressed as executable action statements that users can understand without knowing WBS terminology

#### Scenario: To-do items explain generated WBS drafts
- **WHEN** a planning result contains WBS drafts
- **THEN** the generated drafts correspond to the candidate to-do items rather than being produced as opaque template rows

### Requirement: Light-weight WBS drafts follow item-type-specific package rules
The system SHALL map candidate to-do items into light-weight WBS drafts using work package and stage rules that are selected by item type and match the team's lightweight working patterns.

#### Scenario: Functional development uses development work packages
- **WHEN** a user selects the functional development item type and generates a planning result
- **THEN** the generated WBS drafts use the development-oriented work packages defined for that item type

#### Scenario: Data or document work does not generate software implementation packages by default
- **WHEN** a user selects a non-development item type such as data processing or document drafting
- **THEN** the generated WBS drafts do not include frontend or backend implementation work packages unless the selected type explicitly supports them

#### Scenario: Planning tasks are mapped to the matched stages
- **WHEN** a WBS draft is generated for a supported work package
- **THEN** the system assigns the stage according to the configured mapping for the selected item type instead of requiring the user to pick the stage from scratch

### Requirement: Rule mode must generate a stable baseline skeleton per item type
The system SHALL generate a stable baseline planning skeleton for the selected item type, and then add conditional tasks based on requirement content.

#### Scenario: Baseline tasks follow the selected item type
- **WHEN** the system receives a requirement description in rule mode
- **THEN** the result includes the baseline planning coverage defined for the selected item type instead of always using the software development skeleton

#### Scenario: Conditional implementation tasks are added by content cues
- **WHEN** the selected item type supports conditional technical tasks and the requirement description contains cues about data structure changes, backend logic, or frontend interaction
- **THEN** the system adds the corresponding work package drafts instead of relying only on a fully manual supplement step

### Requirement: Planned date range must drive default draft scheduling
The system SHALL use the user-provided planned start date and planned end date to assign default dates to generated draft rows.

#### Scenario: Generated drafts inherit the selected planning window
- **WHEN** a user provides a valid planned date range and generates a planning result
- **THEN** each generated draft row includes default planned dates derived from that date range

#### Scenario: Invalid planning window is rejected
- **WHEN** a user provides a planned end date earlier than the planned start date
- **THEN** the system rejects the request and does not generate drafts

### Requirement: Quick planning UI must prioritize concise editing over verbose explanation
The system SHALL present quick planning as a concise input flow and a draft table-driven review experience.

#### Scenario: Input controls are limited to the minimum required fields
- **WHEN** a user opens the quick planning area
- **THEN** the primary input controls are item type, requirement description, planned start date, planned end date, and the generate action

#### Scenario: Drafts are the primary review surface
- **WHEN** the planning result is displayed
- **THEN** the draft table is the primary review surface and explanatory to-do content is shown in a secondary, compact form rather than as the dominant page block

### Requirement: Generated planning results remain draft-only until user confirmation
The system SHALL treat generated to-do items and light-weight WBS rows as drafts that require user confirmation before they enter the WBS decomposition list.

#### Scenario: Generated drafts are not auto-committed
- **WHEN** the system returns a planning result
- **THEN** the generated rows remain in a draft state and are not directly written into the formal WBS list

#### Scenario: Users can refine generated drafts before inclusion
- **WHEN** a user reviews generated drafts in the planning UI
- **THEN** the user can select, edit, delete, or supplement rows before adding them to the WBS decomposition list

### Requirement: Rule mode output must remain compatible with future AI planning
The system SHALL use a stable planning result schema in rule mode so that a future AI-based planner can produce the same output contract without requiring frontend redesign.

#### Scenario: Rule and future AI modes share one result contract
- **WHEN** the planning capability is later extended with AI-based generation
- **THEN** the rule mode response structure remains the compatibility baseline for the newer planner implementation
