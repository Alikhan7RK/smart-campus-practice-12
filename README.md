# Smart Campus Room Availability Checker

A read-only prototype that checks whether a fictional campus room is free for a requested time window. The deterministic booking rules decide availability, and an optional mock "Explain availability" feature only explains that decision in plain language — it never overrides or changes it.

## Setup

- Node.js 18 or newer.
- Install dependencies:

```
npm install
```

## Run

Start the local dev server:

```
npm run dev
```

## Checks

```
npm test
npm run typecheck
npm run lint
npm run build
```

## Project structure

- `src/availability.ts` — pure booking rules: `validateInterval` and `checkAvailability`.
- `src/explain.ts` — optional mock explanation adapter with input/output validation and timeout handling.
- `src/types.ts` — `Room`, `Booking`, `CheckOutcome`, `ValidationResult`, and `ReasonCode` types.
- `src/data.ts` — fictional room fixtures: three rooms (A101, B202, C303). Do not change.
- `src/utils.ts` — minute/label helpers.
- `src/App.tsx` — page state and layout.
- `src/components/` — `RoomSelector`, `TimeInput`, `BookingsList` (UI only).
- Test files — `src/availability.test.ts`, `src/validation.test.ts`, `src/overlaps.test.ts`, `src/explain.test.ts`.

## Booking rules

- **AC1:** `0 <= start < end <= 1440` and start strictly after the current time.
- **AC2:** Reject durations longer than 120 minutes.
- **AC3:** Reject a blocked room.
- **AC4:** Reject overlaps; bookings touching only at endpoints are allowed.
- **AC5:** Do not mutate booking data.
- **AC6:** Keep clear feedback on desktop and mobile.

## Explanation feature criteria

- The deterministic checker decides availability; the explanation never changes it.
- The explanation agrees with the result and invents no booking details.
- Empty, malformed, or too-long input is rejected.
- Timeout, error, or missing key shows a safe fallback.
- The explanation is labelled separately from the official status.

## Explanation adapter

The explanation adapter is currently a **mock**: no API key, no network calls, no real LLM. It builds a short explanation only from the booking result fields (room label, start, end, availability, reason code).

Demo modes let you exercise the failure paths:

- `normal` — produces a valid explanation.
- `timeout` — never resolves; the 3-second timeout fires and the fallback is shown.
- `error` — the adapter rejects; the fallback is shown.
- `no-key` — simulates a missing API key; the fallback is shown.

A real LLM-backed adapter would need a server-side implementation; **API keys must never be placed in browser code**.

## Known limitations

- No CI pipeline configured.
- No UI component tests (logic is covered by unit tests only).
- Only three rooms are kept deliberately, as noted in `AGENTS.md`, so blocked and empty rooms can be tested.
