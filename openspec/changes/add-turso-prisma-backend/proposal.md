## Why

The Bytic Attendance application currently stores student records and attendance in transient client-side memory (`useState` / mock data), which causes state loss on page reloads and prevents multi-user synchronization across class sessions. Integrating a serverless backend with Turso (libSQL/SQLite) and Prisma ORM on Vercel provides zero-cost, persistent, fast, and type-safe data management while keeping the lightweight Vite frontend structure.

## What Changes

- Add Prisma ORM schema and database migrations configured with `@prisma/adapter-libsql` and `@libsql/client` for Turso (and local SQLite for offline development).
- Add initial seed script to populate default Bytic students and courses.
- Implement type-safe Vercel Serverless Functions in `/api` for:
  - `GET /api/students` & `POST /api/students` (student roster management)
  - `PATCH /api/attendance` & `POST /api/attendance/mark-all` (attendance status recording)
  - `GET /api/stats` (live summary statistics)
- Implement a type-safe client API wrapper and React hook with optimistic UI updates in the frontend.
- Configure local development Vite proxy and Vercel routing (`vercel.json`) for seamless local DX and production deployment.

## Capabilities

### New Capabilities
- `attendance-api`: Type-safe Vercel serverless API endpoints backed by Prisma ORM and Turso libSQL/SQLite database for student roster and attendance record operations.

### Modified Capabilities
- `attendance-system`: Transition frontend data management from static in-memory mock state to persistent backend API queries with optimistic UI updates.

## Impact

- **Dependencies**: Adds `@prisma/client`, `@prisma/adapter-libsql`, `@libsql/client`, `zod`, and `prisma` dev dependency.
- **APIs**: Introduces `/api/students`, `/api/attendance`, `/api/stats`.
- **Frontend**: Connects `App.tsx` and attendance components to the type-safe API client instead of local static state.
- **Deployment**: Enables zero-configuration deployment to Vercel with Turso environment variables.
