# MCJ Authentication Architecture

## Design decision: client-agnostic Bearer API

MCJ authentication is **client-agnostic**. The same HTTP contract serves:

| Client | Credential storage (client responsibility) |
| --- | --- |
| Customer Web | Access + refresh in app storage (today: `localStorage`; prefer memory for access when practical) |
| Admin Web | Same Bearer body contract |
| iOS | Keychain |
| Android | Keystore-backed secure storage |

**Web cookie migration was evaluated and deferred.** HttpOnly refresh cookies would help XSS for browsers but:

* break or complicate native mobile clients
* require CSRF + credentialed CORS across multiple web origins
* would introduce a second transport for the same domain model

The **domain** remains: User → Session → Access JWT + Refresh JWT (hash stored server-side). Storage is a **client** concern.

```text
                         MCJ API
                           │
                    Authentication
                           │
             ┌─────────────┴─────────────┐
             │                           │
            WEB                         MOBILE
       Bearer + body              Bearer + body
       client storage             OS secure storage
             │                           │
             └─────────────┬─────────────┘
                           │
                    Session (DB)
```

| Location | Stored |
| --- | --- |
| Client | Access JWT, refresh JWT (platform-appropriate storage) |
| API request | `Authorization: Bearer <access>` ; refresh body `{ refreshToken }` |
| Database | `Session.refreshTokenHash` (SHA-256), `clientType`, never raw tokens |
| JWT payload | `sub`, `sessionId`, `email`, `role`, `typ` — never passwords |
| Not stored / not returned | Raw refresh tokens, OTP plaintext (prod), TOTP secrets |

## Endpoints (shared by web + mobile)

```text
POST /auth/register
POST /auth/login            body may include clientType: WEB | IOS | ANDROID
POST /auth/refresh
GET  /auth/me               returns sessionId
POST /auth/logout
POST /auth/logout-all
GET  /auth/sessions         includes clientType, isCurrent, lastUsedAt
POST /auth/sessions/:id/revoke
POST /auth/password-reset/request
POST /auth/password-reset/confirm

POST /admin/auth/login
POST /admin/auth/verify-totp   clientType defaults to ADMIN_WEB

POST /branch-auth/login
POST /branch-auth/refresh
POST /branch-auth/logout
GET  /branch-auth/me
```

## Flows

### Register → Login → `/me`

1. `POST /auth/register` — bcrypt hash; no session.
2. `POST /auth/login` — rate-limited; creates `Session` with `clientType`; returns access + refresh + `sessionId`.
3. Client stores credentials securely and calls `GET /auth/me` with Bearer access token.
4. `JwtStrategy` verifies HS256 access JWT (`typ=access`), session ownership + active state.

### Refresh + rotation

1. Verify refresh JWT (`JWT_REFRESH_SECRET`, `typ=refresh`, HS256).
2. Session ownership + active + hash match.
3. Hash mismatch → reuse detection → revoke **all** user sessions.
4. Atomic `rotateIfHashMatches`; concurrent loser → `401` without global revoke.

### Logout / sessions

- `POST /auth/logout` — revoke current session (idempotent).
- `POST /auth/logout-all` — revoke all sessions.
- `GET /auth/sessions` — safe metadata only (`clientType`, device label, IP, timestamps, `isCurrent`).
- `POST /auth/sessions/:id/revoke` — own sessions only.

### Password reset

1. Generic response (no enumeration).
2. CSPRNG OTP, bcrypt hash, expiry + cooldown + hourly limits; OTP not logged in production.
3. On confirm: update password, revoke **all** sessions.

### `tokenVersion`

`User.tokenVersion` exists in the schema but is **intentionally unused**. Session revocation is the source of truth for invalidating credentials after password reset / logout-all. Do not embed a half-wired version claim.

### Admin + TOTP

1. `POST /admin/auth/login` → short-lived MFA JWT (`typ=mfa`).
2. `POST /admin/auth/verify-totp` → session + access/refresh (`clientType=ADMIN_WEB` by default).
3. MFA / refresh tokens cannot authenticate normal APIs.
4. Admins cannot use `POST /auth/login`.

### Branch-user (separate identity domain)

`/branch-auth/*` uses distinct JWT `type` claims (`BRANCH_USER` / `BRANCH_USER_REFRESH`) and stores a single refresh hash on `BranchUser` with atomic rotation. Not merged with customer `Session` tables.

## JWT

| Token | Secret | TTL | Claim | Alg |
| --- | --- | --- | --- | --- |
| Access | `JWT_ACCESS_SECRET` | 15m | `typ: access` | HS256 |
| Refresh | `JWT_REFRESH_SECRET` | 7d | `typ: refresh` | HS256 |
| Admin MFA | `JWT_MFA_SECRET` | 5m | `typ: mfa` | HS256 |

## Rate limiting

Login: in-memory limits per IP and per identifier (10 / 15 min). Password reset: existing cooldown + hourly caps. Multi-instance deploys should replace the in-memory limiter with Redis.

## Automatic refresh (clients)

1. On `401` (except auth endpoints), refresh once.
2. Queue concurrent callers during refresh.
3. Retry original request once.
4. On failure / reuse detection → clear credentials → login.

## Production checklist

- Strong unique `JWT_*` secrets
- `CORS_ORIGINS` comma-separated allowlist (never rely on open `origin: true` in prod)
- Email provider for reset OTPs
- HTTPS in transit
- Mobile: Keychain / Keystore only — never plaintext prefs for refresh credentials
