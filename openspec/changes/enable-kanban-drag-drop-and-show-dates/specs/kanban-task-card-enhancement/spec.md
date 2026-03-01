## ADDED Requirements

### Requirement: Kanban task card displays stage information
The system SHALL display the task stage (level1Stage) on each Kanban task card so users can quickly identify which phase the task belongs to.

#### Scenario: Task card shows stage
- **WHEN** a task with a stage is displayed in the Kanban board
- **THEN** the task card SHALL display the stage value next to the task name

#### Scenario: Task card with no stage
- **WHEN** a task has no stage (null/empty)
- **THEN** the task card SHALL display "-" as a placeholder

### Requirement: Kanban task card displays planned dates
The system SHALL display the planned start and end dates on each Kanban task card so users can see the task timeline at a glance.

#### Scenario: Task card shows both dates
- **WHEN** a task has both plannedStartDate and plannedEndDate
- **THEN** the task card SHALL display them in "MM-DD" format as "计划：MM-DD 至 MM-DD"

#### Scenario: Task card with only start date
- **WHEN** a task has only plannedStartDate
- **THEN** the task card SHALL display "计划：MM-DD 至 待定"

#### Scenario: Task card with only end date
- **WHEN** a task has only plannedEndDate
- **THEN** the task card SHALL display "计划：待定 至 MM-DD"

#### Scenario: Task card with no dates
- **WHEN** a task has neither plannedStartDate nor plannedEndDate
- **THEN** the task card SHALL display "计划：待定"

### Requirement: Drag and drop updates task status
The system SHALL allow users to drag a task card to a different status column and persist the new status via API.

#### Scenario: Successfully drag task to new status
- **WHEN** user drags a task card to a different status column and drops it
- **THEN** the system SHALL call the API to update the task status
- **AND** the task SHALL move to the new column
- **AND** show success message "任务已更新为「{status}」"

#### Scenario: API call fails during drag
- **WHEN** user drags a task but the API call fails
- **THEN** the system SHALL revert the task to its original column
- **AND** display an error message with the failure reason
