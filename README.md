# Health & Fitness Tracker

A personal health and weight management web application featuring health data tracking, trend analysis, 3D body comparison, and goal planning.

# 🌐 **[OPEN THE WEBSITE →](https://health-fitness-journal.daringguppy257.chatgpt.site/)**

**👆 Click above to visit the Health & Fitness Tracker website. No account required.**

Select **Try sample journal** to explore a complete example, or start recording your own data.

Guest journals are saved in the visitor's own browser. Existing signed-in accounts retain their separate private database records. Clearing browser storage removes guest entries, so export a JSON backup before changing devices or clearing browser data.

## Features

- **Dashboard:** current weight, total weight lost, weekly exercise, average sleep, recording progress, and goal progress.
- **Weight:** create, edit, and delete entries; explore connected trend charts, time filters, and weekly summaries.
- **Weekly pace:** compare actual weight loss this week with the cumulative average from the first recorded day.
- **Exercise:** track activity type, duration, and intensity, with daily charts and weekly totals.
- **Sleep:** review duration, average, shortest and longest sleep, and consistency based on duration variability.
- **Measurements:** record chest, waist, and hip measurements, with trend charts and an editable waist goal.
- **Body Studio:** customize current and goal 3D avatars, including body proportions, facial features, surface tones, and hair silhouettes.
- **History:** explore monthly and weekly calendars, daily details, recording completeness, and period summaries.
- **Planning:** set weight and waist goals, target dates, exercise and sleep targets, and weekly weight plans.
- **Settings:** update height, manage sample data, and export records and goals as JSON.

The interface uses English throughout, a light monochrome palette, bold system typography, and persistent vertical navigation on the left. Smaller screens use an icon rail.

## Technology

React 19, TypeScript, Tailwind CSS 4, Recharts, Three.js, tRPC 11, Zod, Drizzle ORM, Cloudflare Workers, Cloudflare D1, and Vitest.

## Architecture and storage

The hosted application runs on a Cloudflare Worker. The Worker serves the application, session discovery, static icons, and tRPC account APIs.

- **Guest mode:** validated entries and goals are saved in device-local browser storage. Guest mode does not query or modify signed-in users' database records.
- **Account mode:** records and goals are stored in D1 through tRPC. Every database query and mutation is scoped to the server-provided user identity.
- **Access control:** the website is publicly accessible. Account database APIs continue to reject unauthenticated requests.
- **Deployment metadata:** neutral build configuration is stored in `.hosting/hosting.json`. Production hosting identity is managed separately from this public repository.

This implementation uses Worker/D1 hosting rather than a persistent Express server or a MySQL connection.

## Development

Use a recent Node.js version compatible with the locked dependencies. Node.js 24 was used for the current development environment and tests.

```sh
npm ci
npm run check
npm test
npm run build
```

Available commands:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite front-end development server. |
| `npm run check` | Run TypeScript checks. |
| `npm test` | Run the Vitest suite. |
| `npm run db:generate` | Generate Drizzle database migrations. |
| `npm run build` | Generate app icons and build the client and Worker bundle. |

The Vite server alone does not provide Worker endpoints. A complete local preview requires a Worker-compatible runtime or an API proxy for `/api/session` and `/api/trpc/`. The production Worker provides those routes. Database migrations are stored in `drizzle/` and are applied by the hosting deployment workflow.

There is no hardcoded development account or account-authentication bypass.

## Data model

- `records` stores Zod-validated weight, exercise, sleep, and measurement records, with a record ID, user ID, record type, date, and serialized data.
- `goals` stores user goals, weekly plans, and optional current/target avatar configurations.
- `users` reserves a place for profile metadata; platform identity does not depend on that table.
- The record ID and user ID form a composite primary key.

Each date supports one weight, sleep, and measurement entry. Multiple exercise entries are allowed on the same day. Entries can be created, edited, and deleted. Duplicate daily entries return a clear error.

Sample data is loaded only on request, explicitly marked, and independently removable. JSON exports include records and goals.

## Weight-loss calculations

```text
Total weight lost = first recorded weight - latest recorded weight

Elapsed weeks = (today - first recorded date) / 7

Cumulative weekly average = total weight lost / elapsed weeks

Actual weight loss this week = first weight this week - latest weight this week

Pace difference = actual weight loss this week - cumulative weekly average
```

The week begins on Monday. The weekly result compares the first and latest entries within the current week; it is not prorated to a full week.

- **FASTER:** difference greater than 0.01 kg.
- **SLOWER:** difference less than -0.01 kg.
- **ON TRACK:** difference within ±0.01 kg.
- **NEED DATA:** insufficient entries to calculate a comparison.

No average rate is produced with fewer than two weight entries or zero elapsed days. Weekly comparisons require at least two entries in the current week. Negative weight loss represents weight gain and is not clamped to zero. Missing readings are not filled with zero. Calendar-date arithmetic avoids daylight-saving time shifts.

Estimated goal dates use a linear projection of the cumulative average and are shown only when that average weight-loss rate is positive. They are estimates, not guarantees.

## Body Studio

Body Studio uses original procedural Three.js geometry. Current and goal avatars are independently editable.

Body controls include height, weight, chest, waist, hips, shoulder width, arms, thighs, calves, leg proportion, and muscle definition. Face controls include head size, face width, jaw, chin, cheeks, eye size, eye spacing, nose, and mouth. Surface tones and hair silhouettes are also editable.

Drag to rotate both avatars in place, scroll to zoom, or use the Front, Side, Back, and zoom controls. Face editing switches to a close-up view. Wireframe and measurement guides are optional.

Both avatar configurations are saved as optional `bodyModels` fields, validated with a shared Zod schema. Other goal forms preserve these fields. Avatar edits do not rewrite health entries or actual goals; copying journal measurements into a model is an explicit action.

The models are approximate visualizations, not body scans or predictions of appearance, body fat, or muscle mass. Sleep consistency describes variation in sleep duration, not bedtime regularity. The app does not provide medical diagnoses.

## Health Logo

The approved Health Logo is a bold toothy grin with a beauty spot on its right. It is reused in the interface, browser favicon, and home-screen app icons. Icons are generated from the same source mark by `scripts/generate-icons.mjs`.

## Validation

The current suite contains 24 tests covering:

- Cumulative weight-loss calculations and edge cases.
- Record creation, editing, deletion, validation, and user isolation.
- Avatar parameter bounds, finite geometry, body/face deformation, and persistence.
- Guest journals, device isolation, duplicate-date rules, and storage errors.

TypeScript checks and the production build pass. Anonymous HTTP checks confirm public access to the application and session endpoint, while private account APIs return 401 without authentication. Browser interaction and WebGL rendering have not been verified in the managed environment because the browser-control tool is unavailable.
