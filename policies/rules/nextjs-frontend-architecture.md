# Next.js Frontend Architecture — Vertical Slice / Port-Adapter / Saga

**Stack assumed:** Next.js 15 (App Router) · TypeScript strict · Redux Toolkit + Redux-Saga · Turborepo + pnpm workspaces · Vitest + RTL + Playwright · GitHub Actions

The core idea: every feature is a **self-contained vertical slice** (domain → ports → adapters → sagas → state → ui), features never import each other directly, and the whole app is assembled from a **central registry** so adding a feature is additive, not invasive.

---

## 1. Monorepo layout

```
my-app/
├── apps/
│   └── web/                                # Next.js shell — routing + composition only
│       ├── app/
│       │   ├── (public)/login/page.tsx
│       │   ├── (protected)/dashboard/page.tsx
│       │   ├── (protected)/wallet/page.tsx
│       │   ├── layout.tsx                  # mounts <StoreProvider>
│       │   ├── providers.tsx
│       │   └── middleware.ts
│       ├── e2e/
│       │   ├── auth.spec.ts
│       │   └── wallet.spec.ts
│       ├── playwright.config.ts
│       └── next.config.ts
│
├── packages/
│   ├── features/
│   │   ├── auth/                           # <- see full anatomy below
│   │   ├── wallet/                         # same anatomy
│   │   └── dashboard/                      # same anatomy
│   │
│   ├── core/
│   │   ├── store/
│   │   │   ├── feature-registry.ts         # <- central scaling point
│   │   │   ├── configure-store.ts
│   │   │   └── root-saga.ts
│   │   ├── http/http-client.ts             # fetch wrapper: retries, tracing headers
│   │   └── testing/{test-store.ts, mock-adapters/}
│   │
│   ├── shared/
│   │   ├── ui/                             # design system
│   │   ├── lib/                            # pure utils
│   │   └── types/                          # cross-feature shared types only
│   │
│   └── config/
│       ├── eslint-boundaries.config.js     # package isolation rules
│       └── env.schema.ts                   # zod-validated env
│
├── .github/workflows/{ci.yml, deploy.yml}
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

## 2. Anatomy of one vertical slice (`auth`)

```
packages/features/auth/
├── domain/
│   ├── entities/user.entity.ts
│   └── value-objects/email.vo.ts
├── ports/
│   ├── auth-repository.port.ts             # contract, no implementation
│   └── token-storage.port.ts
├── adapters/
│   ├── rest/auth-rest.adapter.ts           # real implementation
│   ├── mock/auth-mock.adapter.ts           # test/storybook implementation
│   └── storage/local-token.adapter.ts
├── application/
│   ├── sagas/
│   │   ├── login.saga.ts
│   │   ├── refresh-token.saga.ts
│   │   └── index.ts                        # rootAuthSaga
│   └── use-cases/logout.use-case.ts
├── state/
│   ├── auth.slice.ts
│   └── auth.selectors.ts
├── ui/
│   ├── components/LoginForm.tsx
│   └── hooks/useAuth.ts
├── tests/
│   ├── login.saga.test.ts
│   ├── auth.slice.test.ts
│   └── contract/auth-repository.contract.test.ts
├── feature.config.ts                       # self-registers into the registry
└── index.ts                                # PUBLIC API — the only importable surface
```

Every other feature (`wallet`, `dashboard`, …) mirrors this exactly. **Rule: nothing outside a feature imports past its `index.ts`.** Cross-feature communication happens only through the store (dispatched actions + selectors), never direct imports — this keeps coupling at "connascence of name" instead of algorithm/position.

## 3. Port — the contract

```typescript
// packages/features/auth/ports/auth-repository.port.ts
import type { Credentials, Session } from "../domain/entities/user.entity";

export interface AuthRepositoryPort {
  login(credentials: Credentials): Promise<Session>;
  refresh(refreshToken: string): Promise<Session>;
  logout(): Promise<void>;
}
```

## 4. Adapter — the implementation (with anti-corruption validation)

```typescript
// packages/features/auth/adapters/rest/auth-rest.adapter.ts
import { z } from "zod";
import { httpClient } from "@core/http/http-client";
import type { AuthRepositoryPort } from "../../ports/auth-repository.port";

const SessionSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: z.object({ id: z.string(), email: z.string().email() }),
});

export class AuthRestAdapter implements AuthRepositoryPort {
  async login(credentials) {
    const { data } = await httpClient.post("/auth/login", credentials);
    return SessionSchema.parse(data); // reject malformed backend responses here, not deep in the app
  }
  async refresh(refreshToken) {
    const { data } = await httpClient.post("/auth/refresh", { refreshToken });
    return SessionSchema.parse(data);
  }
  async logout() {
    await httpClient.post("/auth/logout");
  }
}
```

```typescript
// packages/features/auth/adapters/mock/auth-mock.adapter.ts
export class AuthMockAdapter implements AuthRepositoryPort {
  async login() { return fakeSession; }
  async refresh() { return fakeSession; }
  async logout() { /* no-op */ }
}
```

Swapping REST → GraphQL → gRPC-web later means writing one new adapter class. Nothing else in the slice changes.

## 5. Saga — orchestration, with the adapter injected

```typescript
// packages/features/auth/application/sagas/login.saga.ts
import { call, put, takeLatest } from "redux-saga/effects";
import { authSlice } from "../../state/auth.slice";
import type { AuthRepositoryPort } from "../../ports/auth-repository.port";

export function createLoginSaga(authRepository: AuthRepositoryPort) {
  function* loginWorker(action: ReturnType<typeof authSlice.actions.loginRequested>) {
    try {
      const session = yield call([authRepository, authRepository.login], action.payload);
      yield put(authSlice.actions.loginSucceeded(session));
    } catch (err) {
      yield put(authSlice.actions.loginFailed(String(err)));
    }
  }
  return function* loginSaga() {
    yield takeLatest(authSlice.actions.loginRequested.type, loginWorker);
  };
}
```

Because the repository is a constructor/factory argument, every saga is trivially testable and trivially re-wired to a different adapter — this is the dependency-injection seam that makes the port/adapter pattern actually pay off, rather than being ceremony.

## 6. State slice

```typescript
// packages/features/auth/state/auth.slice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Credentials, Session } from "../domain/entities/user.entity";

interface AuthState {
  status: "idle" | "loading" | "authenticated" | "error";
  session?: Session;
  error?: string;
}

export const authSlice = createSlice({
  name: "auth",
  initialState: { status: "idle" } as AuthState,
  reducers: {
    loginRequested: (state, _a: PayloadAction<Credentials>) => { state.status = "loading"; },
    loginSucceeded: (state, a: PayloadAction<Session>) => { state.status = "authenticated"; state.session = a.payload; },
    loginFailed: (state, a: PayloadAction<string>) => { state.status = "error"; state.error = a.payload; },
  },
});
```

## 7. Central feature registry — this is what makes scaling additive

```typescript
// packages/core/store/feature-registry.ts
import type { Reducer } from "@reduxjs/toolkit";
import { authSlice } from "@features/auth";
import { rootAuthSaga } from "@features/auth";

interface FeatureModule {
  key: string;
  reducer: Reducer;
  saga: () => Generator;
}

export const featureRegistry: FeatureModule[] = [
  { key: "auth", reducer: authSlice.reducer, saga: rootAuthSaga },
  // { key: "wallet", reducer: walletSlice.reducer, saga: rootWalletSaga },
  // adding a feature = one line here + its folder. No existing file is touched.
];
```

```typescript
// packages/core/store/configure-store.ts
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import { all, fork } from "redux-saga/effects";
import { featureRegistry } from "./feature-registry";

const sagaMiddleware = createSagaMiddleware();

const rootReducer = combineReducers(
  Object.fromEntries(featureRegistry.map((f) => [f.key, f.reducer]))
);

function* rootSaga() {
  yield all(featureRegistry.map((f) => fork(f.saga)));
}

export function configureAppStore() {
  const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefault) => getDefault().concat(sagaMiddleware),
  });
  sagaMiddleware.run(rootSaga);
  return store;
}
```

## 8. Package isolation — enforced, not just agreed on

```javascript
// packages/config/eslint-boundaries.config.js
module.exports = {
  plugins: ["boundaries"],
  settings: {
    "boundaries/elements": [
      { type: "feature", pattern: "packages/features/*" },
      { type: "core", pattern: "packages/core/*" },
      { type: "shared", pattern: "packages/shared/*" },
    ],
  },
  rules: {
    "boundaries/element-types": [2, {
      default: "disallow",
      rules: [
        { from: "feature", allow: ["core", "shared"] },   // features can't import each other
        { from: "core", allow: ["shared"] },
        { from: "shared", allow: [] },
      ],
    }],
  },
};
```

Pair this with `dependency-cruiser` in CI to fail the build on any violation — this is what keeps a 30-feature app from turning into a dependency graph nobody can reason about.

## 9. Testing strategy

| Layer | Tool | What it proves |
|---|---|---|
| Domain / value objects | Vitest | pure logic correctness |
| Slices/reducers | Vitest | state transitions |
| Sagas | `redux-saga-test-plan` | orchestration + effect ordering |
| Adapters | Vitest + MSW | real adapter honors the port contract |
| Components | React Testing Library | rendering + interaction |
| E2E | Playwright | full user flow against a deployed preview |

**Saga test:**
```typescript
// tests/login.saga.test.ts
import { expectSaga } from "redux-saga-test-plan";
import { createLoginSaga } from "../application/sagas/login.saga";
import { authSlice } from "../state/auth.slice";
import { AuthMockAdapter } from "../adapters/mock/auth-mock.adapter";

test("login saga: success path", () => {
  const adapter = new AuthMockAdapter();
  return expectSaga(createLoginSaga(adapter))
    .put(authSlice.actions.loginSucceeded(expect.anything()))
    .dispatch(authSlice.actions.loginRequested({ email: "a@b.com", password: "x" }))
    .silentRun();
});
```

**Contract test — the payoff of the port pattern.** Run the *same* test suite against every adapter that implements the port, so the mock and the real thing are provably interchangeable:
```typescript
// tests/contract/auth-repository.contract.test.ts
function runAuthContract(makeAdapter: () => AuthRepositoryPort) {
  it("login returns a session with a token", async () => {
    const session = await makeAdapter().login({ email: "a@b.com", password: "x" });
    expect(session.accessToken).toBeTruthy();
  });
}
runAuthContract(() => new AuthRestAdapter());  // against MSW-mocked network
runAuthContract(() => new AuthMockAdapter());
```

## 10. CI pipeline

```yaml
# .github/workflows/ci.yml
name: CI
on: [pull_request]
jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      # Turborepo only rebuilds/tests packages actually affected by the PR
      - run: pnpm turbo run lint typecheck test build --filter=...[origin/main]

  e2e:
    needs: quality
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pnpm install --frozen-lockfile
      - run: pnpm exec playwright install --with-deps
      - run: pnpm turbo run build
      - run: pnpm exec playwright test
```

## 11. Deployment

**Option A — Vercel (simplest, native Next.js):**
```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```
Preview deployments come free per-PR — pair with the e2e job pointing at the preview URL instead of localhost.

**Option B — self-hosted / containerized (more control, fits perf-tuning work):**
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
RUN corepack enable && pnpm install --frozen-lockfile && pnpm turbo run build --filter=web

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public
EXPOSE 3000
CMD ["node", "apps/web/server.js"]
```
Deploy the image to Fly.io / ECS / your own cluster — swap `deploy.yml`'s last step for a `docker build && push` + rollout.

## 12. Scaling checklist

- **Adding a feature = 1 registry line + 1 folder.** No existing file is edited.
- **Cross-feature comms only via store actions/selectors** — never a direct import — keeps the dependency graph flat as feature count grows.
- **Every port ships with ≥2 adapters from day one** (real + mock) — forces testability and makes a future transport swap (REST → GraphQL) a contained change.
- **Code-split per slice** at the App Router boundary: `dynamic(() => import("@features/wallet"))` — each vertical only ships its JS when its route is hit.
- **CI scales with `--filter=...[origin/main]`** — Turborepo only touches what a PR actually affects, so CI time doesn't grow linearly with feature count.
- **Zod at every adapter boundary** — the backend can drift and you catch it at the seam, not three layers deep in a component.
