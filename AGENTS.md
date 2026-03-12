# AGENTS.md - Project Manage System

## Project Overview

Monorepo with:
- **Backend**: Express.js + TypeScript + Prisma (SQLite)
- **Frontend**: React 18 + Vite + Ant Design + TypeScript

## Build Commands

### Root Commands
```bash
npm run dev              # Run both backend and frontend
npm run dev:backend      # Run only backend
npm run dev:frontend     # Run only frontend
npm run build            # Build both
npm run test:api-regression  # Run API regression tests
```

### Backend Commands
```bash
cd backend
npm run dev              # Development (tsx watch)
npm run build            # Build TypeScript
npm run start            # Start production server
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run migrations
```

### Frontend Commands
```bash
cd frontend
npm run dev      # Development (Vite)
npm run build    # Build for production
npm run preview  # Preview production build
```

### Running a Single Test

API regression tests run via `node backend/scripts/api-regression.mjs`. To run a single test:
```bash
# Edit backend/scripts/api-regression.mjs and comment out other tests, then:
node backend/scripts/api-regression.mjs
```

### TypeCheck

No separate linting tool. TypeScript provides type checking:
```bash
cd frontend && npm run build  # includes tsc --noEmit
cd backend && npm run build   # strict mode compilation
```

---

## Code Style Guidelines

### TypeScript
- **Backend**: `strict: true`, ES2022 target, NodeNext module
- **Frontend**: `strict: true`, ES2020 target, ESNext modules
- Avoid `any` - use `unknown` and narrow types

### Imports
- **Backend** (ES Modules): Use `.js` extensions: `import { foo } from "./foo.js"`
- **Frontend**: No extensions needed

### Formatting
- 2 spaces indentation
- Single quotes for strings
- Semicolons in JavaScript/TypeScript

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files | kebab-case | `project-member.ts` |
| Types | PascalCase | `UserManageItem` |
| Functions | camelCase | `getToken()` |
| Constants | UPPER_SNAKE_CASE | `API_BASE` |

### Error Handling

**Backend**:
- Throw `BusinessError` for business failures (status 400-409)
- Use `ZodError` for validation (caught globally)
- Wrap async handlers with `ah()` from `modules/shared/http.ts`

```typescript
import { BusinessError } from "./services/errors.js";
import { ah, parse } from "../shared/http.js";

router.post("/endpoint", ah(async (req, res) => {
  const input = parse(schema, req.body);
  if (condition) throw new BusinessError("错误信息", 400);
  res.json(result);
}));
```

**Frontend**: Use `ApiError` from `api/client.ts` and utils in `utils/errors.ts`

### Project Structure
```
backend/src/
├── modules/           # Route handlers (auth/, projects/, shared/)
├── services/          # Business logic (store.ts, validators.ts)
├── middleware/        # Express middleware (auth.ts)
└── server.ts          # Entry point

frontend/src/
├── api/               # API client
├── components/        # Reusable components
├── features/          # Feature components (auth/, charts/, system/)
├── types/             # TypeScript types
└── utils/             # Utility functions
```

### Validation
- Use **Zod** for all backend input validation
- Define schemas in `services/validators.ts` or near routers

### API Design
- RESTful: `/api/{resource}` or `/api/{resource}/{id}`
- Query params for filtering: `?projectId=xxx&status=active`
- Delete returns `{ ok: true }`, POST returns 201 with created resource
- Use Chinese error messages

### Frontend Specific
- Ant Design components + React Router
- API via `api` object in `api/client.ts`
- Token stored in `localStorage` as `pmp_token`

### What to Avoid
- NO `any` - use `unknown` and narrow
- NO `.env` commits
- NO Chinese in code identifiers (variables, functions)
- NO mixing require() and import

---

## Development

- Backend: `http://localhost:4000`
- Frontend: `http://localhost:5173`
- Database: `backend/prisma/dev.db`

### Environment

Create `backend/.env`:
```
PORT=4000
JWT_SECRET=your-secret-key
```

### Common Tasks

| Task | Command |
|------|---------|
| Add Prisma model | Edit schema, then `npm run prisma:generate` |
| Add API endpoint | Create router in `modules/{feature}/router.ts` |
| Add frontend page | Create in `features/{feature}/` |
| Add API method | Add to `frontend/src/api/client.ts` |
