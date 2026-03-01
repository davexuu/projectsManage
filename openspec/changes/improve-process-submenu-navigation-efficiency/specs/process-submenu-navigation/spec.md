## ADDED Requirements

### Requirement: Unified Process Submenu Information Architecture
The system MUST provide a unified information architecture for process submenus across 启动、规划、执行、监控、收尾, and each submenu entry SHALL be defined through a single configuration source rather than scattered UI hardcoding.

#### Scenario: Render submenu from centralized configuration
- **WHEN** user enters any process workspace page
- **THEN** the UI renders submenu groups and entries from the centralized process navigation configuration

#### Scenario: Add a new submenu entry without touching multiple views
- **WHEN** a maintainer adds one new submenu item to the process navigation configuration
- **THEN** the submenu item becomes available in both desktop and mobile process navigation views

### Requirement: Route-Synchronized Active Navigation State
The system MUST derive active submenu state from current route location, and the active state SHALL stay consistent on direct URL access, refresh, and browser back/forward navigation.

#### Scenario: Deep link opens correct active submenu
- **WHEN** user opens a deep link such as `/process/monitor/reports`
- **THEN** the corresponding monitor submenu item is highlighted as active without manual interaction

#### Scenario: Browser back keeps active state consistent
- **WHEN** user navigates between process subpages and then clicks browser back
- **THEN** the highlighted submenu item updates to the route currently displayed

### Requirement: Responsive Submenu Navigation Experience
The system MUST support responsive submenu navigation presentations while preserving the same information architecture, and high-frequency entries SHALL remain quickly reachable on desktop and mobile.

#### Scenario: Desktop shows grouped navigation
- **WHEN** user views process workspace on desktop viewport
- **THEN** submenu entries are displayed in grouped navigation layout with clear grouping labels

#### Scenario: Mobile shows compact navigation container
- **WHEN** user views process workspace on mobile viewport
- **THEN** submenu entries are accessible through a compact navigation container without losing entry coverage

### Requirement: Recent Access Shortcuts in Process Navigation
The system MUST store and display recent process submenu visits within the current session, and users SHALL be able to jump to recent entries in fewer steps than full navigation traversal.

#### Scenario: Recent entries update after navigation
- **WHEN** user visits multiple process submenu pages in one session
- **THEN** the recent access list reflects latest visited entries in recency order

#### Scenario: User reopens a recent process page quickly
- **WHEN** user selects an item in recent access list
- **THEN** the system navigates directly to that target process page
