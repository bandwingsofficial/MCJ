# MCJ Authentication Architecture

## Credential model (intentional)

MCJ uses **Bearer JWT access tokens + refresh tokens in the JSON body**, backed by **server-side sessions**. Tokens are stored by web clients in `localStorage` today.

This is **not** an HttpOnly-cookie session system. Cookies were audited and intentionally **not** introduced as a second competing auth mechanism. Migrating to HttpOnly cookies would require coordinated CSRF, CORS, and frontend changes across customer / admin / branch apps.

| Location | Stored |
| --- | --- |
| Browser | Access JWT, refresh JWT (`localStorage`) |
| API request | `Authorization: Bearer <access>` ; refresh body `{ refreshToken }` |
| Database | `Session.refreshTokenHash` (SHA-256), never raw tokens |
| JWT payload | `sub`, `sessionId`, `email`, `role`, `typ` — never passwords/secrets |
| Not stored | Raw refresh tokens, TOTP secrets in responses, OTP plaintext (prod logs) |

## Flows

### Register → Login → `/me`

1. `POST /auth/register` creates user with bcrypt password hash (no session).
2. `POST /auth/login` validates credentials, creates `Session`, returns access + refresh JWTs + `sessionId`.
3. Client stores tokens and calls `GET /auth/me` with Bearer access token.
4. `JwtStrategy` verifies access JWT (`typ=access`), loads session, checks ownership + active state.

### Refresh + rotation

1. `POST /auth/refresh` with `{ refreshToken }`.
2. Verify refresh JWT (`JWT_REFRESH_SECRET`, `typ=refresh`).
3. Load session; ownership + active checks.
4. Compare SHA-256(token) to `session.refreshTokenHash`.
5. Mismatch → **reuse detection** → revoke **all** user sessions.
6. Issue new token pair; **atomic** `rotateIfHashMatches` updates hash only if expected hash still matches.
7. Concurrent race (same token twice): loser gets `401 INVALID_TOKEN` without global revoke.

### Logout / logout-all / sessions

- `POST /auth/logout` — revoke current session (idempotent if already gone).
- `POST /auth/logout-all` — revoke all sessions for user.
- `GET /auth/sessions` — active sessions with `isCurrent`, device label, IP, `lastUsedAt`.
- `POST /auth/sessions/:id/revoke` — revoke one owned session.

After revoke, refresh fails; access tokens fail on next request because the strategy checks session activity.

### Password reset

1. `POST /auth/password-reset/request` — always returns the same generic message (no email enumeration).
2. OTP via CSPRNG, hashed with bcrypt, 10 min expiry, cooldown + hourly limits.
3. `POST /auth/password-reset/confirm` — verifies OTP, updates password, increments `tokenVersion`, revokes all sessions.

### Admin + TOTP

1. `POST /admin/auth/login` — admin-only; returns short-lived MFA JWT (`type=ADMIN_MFA`), no session yet.
2. `POST /admin/auth/verify-totp` — verifies TOTP, then creates session + access/refresh like normal users.
3. Admins cannot use `POST /auth/login`.

Branch-user auth remains a **separate** module (`/branch-auth/*`) with its own token `type` claims.

## JWT

| Token | Secret | TTL | `typ` / `type` |
| --- | --- | --- | --- |
| Access | `JWT_ACCESS_SECRET` | 15m | `typ: access` |
| Refresh | `JWT_REFRESH_SECRET` | 7d | `typ: refresh` |
| Admin MFA | `JWT_MFA_SECRET` | 5m | `type: ADMIN_MFA` |

Access and refresh secrets must differ. Access tokens authenticate APIs; refresh tokens only work on `/auth/refresh`.

## Automatic refresh (frontend)

Customer / admin / branch clients:

1. On `401` (except auth endpoints), call refresh once.
2. Queue concurrent requests while refreshing.
3. Retry original request once with new access token.
4. On refresh failure / `TOKEN_REUSE_DETECTED`, clear tokens and redirect to login.

## Production checklist

- Strong unique values for `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `JWT_MFA_SECRET`
- Set `CORS_ORIGINS` to explicit frontend origins (comma-separated)
- Wire a real email provider for password-reset OTPs (OTP is not logged in production)
- Prefer HTTPS everywhere for Bearer tokens in transit
