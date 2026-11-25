# AGENTS.md

## Project
Smart Campus room availability checker. Read-only prototype with fictional rooms (A101, B202, C303) and fictional bookings.
User story: As a student, I want to check a room's availability so I can choose a valid booking time.
Note: the course scope says one fictional room; this project keeps three fictional rooms (A101, B202, C303) from Practice #06 so blocked and empty rooms can be tested. Do not add more rooms.

## Structure
- src/availability.ts – pure booking rules: validateInterval, checkAvailability
- src/data.ts – fictional room fixtures (do not change)
- src/types.ts – Room, Booking, CheckOutcome types
- src/utils.ts – minute/label helpers
- src/components/ – RoomSelector, TimeInput, BookingsList (UI only)
- src/App.tsx – page state and layout
- src/availability.test.ts – Vitest regression tests (T01–T18)

## Accepted rules (must not change)
- AC1: 0 <= start < end <= 1440 and start strictly after current time.
- AC2: reject durations longer than 120 minutes.
- AC3: reject a blocked room.
- AC4: reject overlaps; bookings touching only at endpoints are allowed.
- AC5: do not mutate booking data.
- AC6: keep clear feedback on desktop and mobile.

## Commands
- npm install
- npx vitest run   (all tests must pass)
- npx tsc --noEmit -p tsconfig.app.json
- npm run lint

## Engineering rules
- Prefer pure functions and the smallest change that solves one problem.
- Use at most 2 patterns, and only with a written justification. No Singleton, Factory or class hierarchies.
- Do not change UI text, styling or layout unless asked.
- Do not weaken or delete existing test assertions.

## Forbidden scope changes
- No login, backend, database, external APIs, saving or creating bookings.
- No new pages or features.
- No secrets, API keys, or credentials may be added or committed.
- No external deployments or deploy-target configuration; the prototype stays local/read-only.

## Reporting
After each change, report: changed files, rationale, and the exact test command to run. Do not claim tests pass unless they were run.
- Run npx vitest run, npm run typecheck and npm run lint and report their real output before proposing a change for acceptance.
- A human must review the diff and approve before any change is accepted or merged.
- AGENTS.md takes precedence over .bolt/prompt when they conflict.