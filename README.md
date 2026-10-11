# KALYX

> **Smart Classroom and Timetable Disruption Scheduling Engine**  
> Developed by **Team WEBSMITHS**

---

## Executive Summary

University and college timetable management is inherently fragile. When an unexpected disruption strikes (such as an HVAC leak in a lecture hall, specialized laboratory power failure, equipment shortages, or sudden faculty illness), traditional campus management tools force administrators into an impossible dilemma: manually scramble through spreadsheets under intense time pressure, or trigger a full timetable reshuffle that causes a massive butterfly effect across dozens of unaffected courses, faculty members, and student cohorts.

**KALYX**, engineered by **Team WEBSMITHS**, solves this problem with an intelligent, constraint-aware disruption repair engine. Rather than re-planning the entire institution from scratch, KALYX isolates the failure, freezes unaffected schedules, and evaluates viable alternatives to compute repair proposals that minimize unnecessary changes.

Every proposed repair is explainable, fully audited, verified against hard physical constraints by an independent validation guard, and subject to administrator approval before being published to the live campus schedule.

---

## The Core Challenge: The Timetable Butterfly Effect

In modern higher education, academic timetables balance hundreds of interdependent constraints:

1. **Room Physical Capacity:** Class attendance must never exceed safe seating limits.
2. **Equipment and Room Types:** Courses requiring hardware (such as GPU clusters, audio systems, or digital projectors) cannot simply move into standard seminar rooms.
3. **Faculty Timelines:** Instructors cannot be double-booked across simultaneous sessions.
4. **Shared Equipment Pools:** Limited mobile assets (such as VR rigs and mobile AV carts) cannot exceed physical inventory counts.
5. **Human Predictability:** Students and faculty plan their weeks around published schedules. A single room closure should not alter the schedules of five hundred uninvolved students.

When disruptions occur, conventional algorithms that wipe the board clean create unacceptable scheduling churn. KALYX treats existing, published timetables as a baseline commitment, applying localized graph and interval repairs to guarantee minimal disruption.

---

## Core System Architecture and Principles

```
  +-------------------------------------------------------------+
  |                   KALYX ARCHITECTURE                        |
  |               Built by Team WEBSMITHS                       |
  +-------------------------------------------------------------+
                               |
        +----------------------+----------------------+
        |                                             |
        v                                             v
  [ Published Timetable ]                    [ Disruption Event ]
   (Baseline Version v1)                      (Room / Resource / Faculty)
        |                                             |
        +----------------------+----------------------+
                               |
                               v
               +-------------------------------+
               |   Impact Analysis Engine      |
               |  - Identify directly affected |
               |  - Lock & freeze unaffected   |
               +-------------------------------+
                               |
                               v
               +-------------------------------+
               |    Disruption Repair Engine   |
               |  - Bounded heuristic search   |
               |  - Lexicographic objective    |
               |  - Honest solver status       |
               +-------------------------------+
                               |
                               v
               +-------------------------------+
               |   Repair Proposals Generated  |
               |   (OPTIMAL / FEASIBLE /       |
               |    INFEASIBLE + Causal Reason)|
               +-------------------------------+
                               |
                               v
               +-------------------------------+
               |  Independent Validator Guard  |
               |  - Zero false-positive checks |
               |  - Blocks invalid publication |
               +-------------------------------+
                               |
                               v
               +-------------------------------+
               | Administrator Decision Gate   |
               |  - Side-by-side diff review   |
               |  - Approve or Reject proposal |
               +-------------------------------+
                               |
                               v
               +-------------------------------+
               | Immutable Version Tree & Audit|
               |  - Optimistic concurrency     |
               |  - Version increment (v1->v2) |
               |  - Tamper-evident audit log   |
               +-------------------------------+
```

---

## Key Features

### 1. Minimal Disruption Repair Engine
- **Targeted Repairs:** The solver isolates solely those bookings directly invalidated by the disruption. Unaffected sessions are strictly locked and preserved.
- **Lexicographic Optimization:** Objective scores penalize room migrations, time shifts, and secondary moves. The engine always favors keeping classes at their original scheduled times in adjacent matching rooms.
- **Deterministic and Bounded:** Fast execution ensures instant response times during emergency morning room closures.

### 2. Transparent and Honest Solver Status
- Unlike systems that invent invalid assignments or crash silently when no slot is available, KALYX explicitly categorizes outcomes into `OPTIMAL`, `FEASIBLE`, or `INFEASIBLE`.
- When a room with unique, irreplaceable equipment closes and no alternate facility exists, KALYX immediately flags the event as `INFEASIBLE`, explains why (for example: "No alternate room meets GPU cluster requirement"), and prevents invalid schedules from being created.

### 3. Clear Causal Explanations
- Every change in a repair proposal includes human-readable causal reasoning.
- Administrators can see exactly why a course was relocated (e.g., "Moved from Lecture Hall 101 to Lecture Hall 102 due to HVAC closure. Preserved original 09:00 - 10:30 time window. Satisfies 75-seat capacity and projector requirement").

### 4. Independent Publication Safety Guard
- Before any repair proposal can be published, it passes through an independent validation engine.
- This gate checks all hard constraints (room double-bookings, faculty conflicts, capacity thresholds, equipment mismatches, and shared resource limits). If a single blocking conflict exists, publication is halted.

### 5. Immutable Schedule Versioning and Stale Proposal Protection
- Timetable changes are never performed as destructive in-place updates. Every approved repair generates an immutable new schedule version (`v1` -> `v2` -> `v3`).
- **Optimistic Concurrency Control:** If two administrators review proposals simultaneously or a base schedule changes in the interim, stale proposals are rejected to avoid race conditions.

### 6. Role-Based Access Control and Complete Audit Trail
- **Role Gating:** Viewers (students and faculty) enjoy clean read-only timetable views. Only verified Administrators can inject disruptions, trigger solvers, approve proposals, and publish revisions.
- **Audit Logging:** Every user action (disruption creation, solver execution, proposal approval, version publication, and system reset) is logged with timestamps, actor emails, and entity IDs.

### 7. High-Contrast Neo-Brutalist Interface
- Purpose-built academic dashboard designed for high-stress operational clarity.
- Utilizes crisp structural borders, unmistakable alert signals, tactile physical shadows, and distinct color codes for room types, booking states, and conflict severities.

---

## Mathematical and Constraint Model

### Interval Semantics
All class intervals and disruption windows use half-open intervals: `[start_datetime, end_datetime)`.
Two intervals `A` and `B` overlap if and only if:
$$\max(start_A, start_B) < \min(end_A, end_B)$$
This standard formulation ensures that a 09:00 to 10:00 class and a 10:00 to 11:00 class in the same room are recognized as perfectly valid and non-conflicting.

### Hard Constraints (Must Never Be Violated)
1. **Room Exclusivity:** No single room may host more than one booking during any overlapping timestamp.
2. **Faculty Exclusivity:** No instructor may be scheduled in more than one room simultaneously.
3. **Capacity Threshold:** For any booking $b$ assigned to room $r$, $Capacity(r) \ge Attendance(Class(b))$.
4. **Equipment Compatibility:** $RequiredEquipment(Class(b)) \subseteq AvailableEquipment(r)$.
5. **Room Type Matching:** If a class specifies a mandatory room type (e.g., `lab` or `lecture_hall`), $Type(r) = RequiredType(Class(b))$.
6. **Shared Resource Caps:** For any shared physical resource $k$ and time interval $t$, $\sum Allocations(k, t) \le TotalQuantity(k)$.
7. **Disruption Quarantine:** No booking may occupy an entity during an active disruption window affecting that entity.

### Soft Objectives (Lexicographically Minimized)
When evaluating candidate rooms and time slots for an affected booking, the engine computes a penalty cost function:
$$\text{Cost} = (w_{room} \times \Delta_{room}) + (w_{time} \times \Delta_{time}) + (w_{cap} \times \text{WastedCapacity})$$
- Minimizing time changes has the highest priority to avoid disrupting student routines.
- Minimizing room migrations preserves predictable navigation across campus.
- Minimizing wasted capacity prevents assigning small 20-student seminars into 200-seat lecture halls when suitable smaller rooms are free.

---

## Preconfigured Demonstration Scenarios

KALYX includes three deterministic demonstration scenarios accessible directly from the dashboard:

### Scenario 1: Primary Solvable Room Disruption
- **Incident:** Lecture Hall 101 ceiling HVAC leak emergency closure from 08:30 to 12:00.
- **Impact:** Computer Science CS-301 (75 students) is displaced during its 09:00 to 10:30 slot. Unaffected classes across campus remain locked in place.
- **Solver Action:** Evaluates available alternatives, identifies Lecture Hall 102 (capacity 90, equipped with projector and sound system), and moves CS-301 into LH-102 at the exact same scheduled time.
- **Outcome:** 1 changed booking, 3 unaffected bookings untouched, 0 time shifts, solver status `OPTIMAL`.

### Scenario 2: Shared Equipment Shortage
- **Incident:** 4K Mobile AV carts recalled for emergency bulb replacement.
- **Impact:** Detects overlapping resource allocations that exceed available stock.
- **Solver Action:** Reallocates sessions or reschedules conflicting usage to stay within capacity.

### Scenario 3: Hard Infeasible Case
- **Incident:** Power outage in Advanced Systems Lab 204 from 09:30 to 13:00.
- **Challenge:** Course SE-410 requires specialized GPU clusters and oscilloscopes present only in Lab 204.
- **Outcome:** The engine reports `INFEASIBLE` with clear explanations. It refuses to invent an invalid room assignment that would fail laboratory course requirements.

---

## Test Suite and Verification

The scheduling engine is backed by an automated test suite implemented in Vitest (`tests/scheduling.test.ts`), covering core constraint logic and scenarios:

| Test Case | Description | Expected Result |
| :--- | :--- | :--- |
| **Interval Semantics** | Half-open intervals `[start, end)` | Overlaps flagged; adjacent slots allowed |
| **Case A** | Simple room closure | Affected booking relocated; unaffected preserved |
| **Case B** | Room capacity mismatch | Under-capacity rooms rejected |
| **Case C** | Missing equipment | Rooms missing specialized hardware rejected |
| **Case D** | Faculty overlap | Double-booked instructors flagged as BLOCKING |
| **Case E** | Shared resource shortage | Allocations exceeding inventory detected |
| **Case F** | Infeasible repair | Honest `INFEASIBLE` status returned |
| **Case G** | Minimal disruption | Change count minimized |
| **Case H** | Accurate solver mapping | States mapped strictly to standard statuses |
| **Case I** | Stale proposal guard | Publishing on outdated base versions blocked |
| **Case J** | Publication safety guard | Independent validator blocks invalid schedules |

To execute the test suite:
```bash
npm run test
```

---

## Technology Stack

- **Framework:** Next.js 15 (App Router)
- **Frontend Library:** React 19
- **Type Safety:** TypeScript 5.8
- **Styling:** Tailwind CSS with custom Neo-Brutalist design tokens (`#D83A32`, `#163B75`, `#F5EBD8`, `#20201D`)
- **Icons:** Lucide React
- **Testing:** Vitest 3.0
- **State and Concurrency:** In-memory deterministic transaction store with immutable version trees and optimistic concurrency controls

---

## Project Structure

```
kalyx/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/session/          # User authentication and role switching
│   │   │   ├── classes/               # Course catalog and class session records
│   │   │   ├── demo/reset/            # Deterministic baseline data reset
│   │   │   ├── disruptions/           # Disruption management and impact checks
│   │   │   ├── faculty/               # Faculty roster and availability
│   │   │   ├── history/               # Version log and tamper-evident audit trail
│   │   │   ├── repairs/               # Disruption repair solver and proposals
│   │   │   ├── resources/             # Shared equipment inventory
│   │   │   ├── rooms/                 # Campus facilities and equipment specs
│   │   │   └── schedule/              # Active published schedule and validator
│   │   ├── dashboard/
│   │   │   ├── classes/               # Curriculum requirements view
│   │   │   ├── conflicts/             # Active conflict monitor
│   │   │   ├── disruptions/           # Live disruption control panel
│   │   │   ├── faculty/               # Instructor availability matrix
│   │   │   ├── history/               # Version diffs and audit trail
│   │   │   ├── repair/                # Side-by-side proposal review and approval
│   │   │   ├── resources/             # Shared equipment management
│   │   │   ├── rooms/                 # Facility capacity and hardware browser
│   │   │   ├── settings/              # System settings and demo reset
│   │   │   ├── timetable/             # Grid view of campus schedule
│   │   │   └── page.tsx               # Main dashboard overview
│   │   ├── globals.css                # Neo-brutalist custom styling and utility classes
│   │   ├── layout.tsx                 # Root layout configuration
│   │   └── page.tsx                   # Public landing page with live engine preview
│   ├── components/
│   │   ├── brand/                     # KALYX brand badges and logos
│   │   ├── disruptions/               # Disruption creation modals and impact widgets
│   │   ├── layout/                    # Dashboard navigation, headers, and shells
│   │   ├── repair/                    # Diff inspectors and proposal cards
│   │   └── timetable/                 # Interactive timetable grid and filters
│   └── lib/
│       └── scheduling/
│           ├── conflicts.ts           # Conflict detection and severity categorization
│           ├── constraints.ts         # Hard constraint validation functions
│           ├── demoData.ts            # Baseline demo rooms, classes, and disruptions
│           ├── intervals.ts           # Half-open time interval calculations
│           ├── repairEngine.ts        # Heuristic disruption repair solver
│           ├── store.ts               # Versioning, audit log, and state management
│           ├── types.ts               # Core domain TypeScript models
│           └── validation.ts          # Independent publication validation gate
├── tests/
│   └── scheduling.test.ts             # Vitest test suite covering Cases A through J
├── test_e2e.mjs                       # End-to-end integration test script
├── tailwind.config.js                 # Custom color palette and shadow definitions
├── tsconfig.json                      # TypeScript strict compiler configuration
└── package.json                       # Project dependencies and script shortcuts
```

---

## API Specification

### Schedule and Validation
- `GET /api/schedule/current` - Returns active published schedule version, bookings, and active conflicts.
- `POST /api/schedule/validate` - Runs independent validation checks across candidate booking sets.

### Disruptions
- `GET /api/disruptions` - Retrieves all logged disruption events.
- `POST /api/disruptions` - Logs a new room, resource, or faculty disruption.
- `GET /api/disruptions/[id]/impact` - Returns lists of directly affected versus unaffected bookings.

### Repair Proposals
- `POST /api/repairs` - Triggers the repair engine for an active disruption and returns proposals.
- `PATCH /api/repairs/[id]` - Approves or rejects a candidate proposal (Administrator only).
- `POST /api/repairs/[id]/publish` - Validates and publishes an approved proposal as a new version.

### Facilities and Assets
- `GET /api/rooms` - Returns list of rooms, capacities, equipment, and current availability status.
- `GET /api/classes` - Returns course catalog and technical requirements.
- `GET /api/faculty` - Returns faculty members and status.
- `GET /api/resources` - Returns shared equipment inventory and current allocations.

### Audit and History
- `GET /api/history` - Returns the immutable schedule version history and audit log trail.
- `POST /api/demo/reset` - Restores system to the initial baseline dataset.
- `GET /api/auth/session` - Returns the current user profile, role, and permission scope.

---

## Getting Started

### Prerequisites
- Node.js 18.17.0 or higher
- npm 9.0.0 or higher

### Installation
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd kalyx
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env.local
   ```
   The application works out of the box with default local settings.

4. Start the development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. Run unit and integration tests:
   ```bash
   npm run test
   ```

6. Run the end-to-end integration verification script:
   ```bash
   node test_e2e.mjs
   ```

---

## Security and Production Readiness

- **No Hardcoded Secrets:** Configuration keys are sourced from environment variables.
- **Fail-Safe Publication Gate:** Solvers cannot write directly to published timetables. Every change requires validation passes and administrator approval.
- **Stale State Defense:** Concurrency tokens prevent out-of-sequence updates from overwriting intervening schedule publications.
- **Audit Logging:** Every state transition is preserved with timestamps and actor metadata.

---

## Team WEBSMITHS

**KALYX** was designed, built, and tested by **Team WEBSMITHS**.

- **Focus:** Resilient higher-education infrastructure, constraint-satisfaction algorithms, and human-centered design.
- **Philosophy:** Software serving educational institutions should never produce unexpected surprises. When changes occur, they must be minimal, transparent, and completely explainable.
