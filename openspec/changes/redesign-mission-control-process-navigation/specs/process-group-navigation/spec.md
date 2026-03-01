## ADDED Requirements

### Requirement: Project-space navigation SHALL follow mission-control-plus-five-process structure
Within project space, the system MUST provide the following stable navigation order: Mission Control, 启动, 规划, 执行, 监控, 收尾.

#### Scenario: Render project-space main navigation
- **WHEN** a user enters project space
- **THEN** the system renders Mission Control and all five process groups as primary project-space navigation items

#### Scenario: Keep navigation stable across pages
- **WHEN** a user switches between project-space pages
- **THEN** the navigation structure and ordering remain unchanged

### Requirement: Existing functional pages SHALL be mapped into process groups
The system MUST map existing operational pages into one of the five process groups and MUST NOT leave process-relevant pages as isolated top-level project-space entries.

#### Scenario: Open a process group page
- **WHEN** a user enters a process group
- **THEN** the user can access all mapped pages for that process within the group context

#### Scenario: Prevent isolated process pages
- **WHEN** navigation is generated
- **THEN** pages related to planning, execution, monitoring, or closure are placed under their corresponding process group

### Requirement: Workspace SHALL be preserved as cross-project entry with three sub-items
The system MUST preserve a top-level cross-project workspace and MUST provide exactly these baseline sub-items: 我的项目, 待办/风险预警, 里程碑日历.

#### Scenario: Open workspace menu
- **WHEN** a user opens the workspace menu
- **THEN** the system shows 我的项目, 待办/风险预警, and 里程碑日历 as available sub-items

#### Scenario: Use workspace as cross-project view
- **WHEN** a user is in workspace sub-pages
- **THEN** the system provides cross-project information without forcing a single-project mode
