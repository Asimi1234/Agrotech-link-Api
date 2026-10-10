# AgroLink API

Node.js/Express + MongoDB (Mongoose) marketplace API for agricultural suppliers and buyers.
CSE 341 final project. Interactive docs are served at `/api-docs`.

Authentication uses Google as the OAuth provider because most of the farmers this API serves already have Google accounts; OAuth itself is added in Week 6.

## Collections

- **users**: `googleId`, `username`, `email`, `role` (`farmer | supplier | buyer | admin`), `createdAt`, `updatedAt`
- **listings**: `title`, `description`, `commodity`, `pricePerUnit`, `unit` (`kg | bag | tonne | crate | litre | piece`), `quantityAvailable`, `location`, `supplierId` (ref → users), `status` (`available | sold`, default `available`), `createdAt`, `updatedAt`
- **cooperatives**: `name` (unique), `description`, `location`, `primaryCommodity`, `leadId` (ref → users, set from the signed-in user), `memberIds` (array of ref → users), `createdAt`, `updatedAt`
- **advisories**: `title`, `content`, `crop`, `region`, `severity` (`info | warning | critical`, default `info`), `authorId` (ref → users, set from the signed-in user), `createdAt`, `updatedAt`

`createdAt` and `updatedAt` are managed automatically by Mongoose and are read-only.

## Local setup

1. `npm install`
2. Copy `.env.example` to `.env` and fill in the values:
   - `PORT` — e.g. `3000`
   - `MONGODB_URI` — your MongoDB Atlas connection string
   - `CORS_ORIGIN` — comma-separated list of allowed origins (e.g. `http://localhost:3000`)
   - `NODE_ENV` — `development` or `production`
   - `SWAGGER_SERVER_URL` — leave blank locally; set to your Render URL in production
   - `SESSION_SECRET` — a long random string used to sign the session cookie
   - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — from your Google OAuth client
   - `GOOGLE_CALLBACK_URL` — e.g. `http://localhost:3000/auth/google/callback` locally,
     and `https://<your-service>.onrender.com/auth/google/callback` on Render
3. `npm run dev` (nodemon) or `npm start`
4. Open `http://localhost:3000/api-docs`

The app refuses to start and prints which variable is missing if any of `MONGODB_URI`,
`SESSION_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, or `GOOGLE_CALLBACK_URL` is unset.

## Authentication

Sign-in is Google OAuth with server-side sessions stored in MongoDB.

- `GET /auth/google` — start sign-in (scopes: profile, email).
- `GET /auth/google/callback` — completes sign-in and returns the user as JSON.
- `GET /auth/me` — the current user, or 401 if not signed in.
- `POST /auth/logout` — destroys the session and clears the cookie.

On first sign-in a user is created from the Google profile id, the verified email, and the
display name, with role `buyer`. Unverified Google emails are rejected (403), and if the email
already belongs to a different account the callback returns 409 without linking accounts. The
session stores only the user id; the cookie is httpOnly, sameSite lax, secure in production, and
expires after 24 hours.

### Making the first admin

Roles cannot be self-assigned to `admin`. To create the first admin:

1. Sign in once at `/auth/google` so your user document exists.
2. In Atlas → Browse Collections → `users`, find your document and set `role` to `admin`.
3. Sign out and back in (or just continue; the role is read on each request). `GET /users` now works.

## Access rules

- `GET /listings`, `GET /listings/:id` — public.
- `POST /listings` — signed-in users with role `supplier` or `farmer`; `supplierId` comes from the
  session and is rejected as an unknown field if sent in the body.
- `PUT`, `DELETE /listings/:id` — the listing's owner (or an admin). `supplierId` is not writable.
- `GET /users`, `POST /users` — admin only. Admin may set `googleId`, `email`, and `role`.
- `GET`, `PUT`, `DELETE /users/:id` — the user themselves or an admin. On `PUT`, `googleId` and
  `email` are not writable; a user may set their own role to `farmer`, `supplier`, or `buyer`, and
  only an admin may assign `admin`.
- `GET /cooperatives`, `GET /cooperatives/:id` — public.
- `POST /cooperatives` — any signed-in user. The creator becomes the `leadId` and is added to
  `memberIds`. `leadId` is not writable; `memberIds` must all reference existing users (no duplicates).
- `PUT`, `DELETE /cooperatives/:id` — the lead (or an admin). `leadId` is not writable.
- `GET /advisories`, `GET /advisories/:id` — public (exact-match `crop`, `region`, `severity` filters).
- `POST`, `PUT`, `DELETE /advisories` — admin only. `authorId` is not writable.
- `401` when not signed in, `403` when signed in without permission.

## Routes

| Method | Path                   | Purpose                       |
| ------ | ---------------------- | ----------------------------- |
| GET    | /auth/google           | Start Google sign-in          |
| GET    | /auth/google/callback  | Finish sign-in, return user   |
| GET    | /auth/me               | Current user (or 401)         |
| POST   | /auth/logout           | Log out, destroy session      |
| GET    | /users                 | List users (admin)            |
| GET    | /users/:id      | Get one user     |
| POST   | /users          | Create user      |
| PUT    | /users/:id      | Update user      |
| DELETE | /users/:id      | Delete user      |
| GET    | /listings       | List listings    |
| GET    | /listings/:id   | Get one listing  |
| POST   | /listings       | Create listing   |
| PUT    | /listings/:id   | Update listing   |
| DELETE | /listings/:id   | Delete listing   |
| GET    | /cooperatives        | List cooperatives     |
| GET    | /cooperatives/:id    | Get one cooperative   |
| POST   | /cooperatives        | Create cooperative    |
| PUT    | /cooperatives/:id    | Update cooperative    |
| DELETE | /cooperatives/:id    | Delete cooperative    |
| GET    | /advisories          | List advisories       |
| GET    | /advisories/:id      | Get one advisory      |
| POST   | /advisories          | Create advisory       |
| PUT    | /advisories/:id      | Update advisory       |
| DELETE | /advisories/:id      | Delete advisory       |

## Testing each route

With the server running and a valid `MONGODB_URI`, run these from a terminal. The easiest path
is the Swagger UI at `/api-docs` ("Try it out" on each route). Equivalent curl commands:

```bash
BASE=http://localhost:3000

# Create a user (note the returned id)
curl -s -X POST $BASE/users -H 'Content-Type: application/json' \
  -d '{"googleId":"113087632548723904521","username":"jane_farmer","email":"jane@example.com","role":"supplier"}'

# List users
curl -s $BASE/users

# Get one user (replace USER_ID)
curl -s $BASE/users/USER_ID

# Update a user
curl -s -X PUT $BASE/users/USER_ID -H 'Content-Type: application/json' \
  -d '{"role":"admin"}'

# Create a listing (supplierId must be an existing user id; status is optional, defaults to available)
curl -s -X POST $BASE/listings -H 'Content-Type: application/json' \
  -d '{"title":"Fresh Maize","description":"Grade A yellow maize","commodity":"Maize","pricePerUnit":180.5,"unit":"bag","quantityAvailable":120,"location":"Kaduna","supplierId":"USER_ID","status":"available"}'

# List / get / update / delete listings
curl -s $BASE/listings
curl -s $BASE/listings/LISTING_ID
curl -s -X PUT $BASE/listings/LISTING_ID -H 'Content-Type: application/json' -d '{"pricePerUnit":200}'
curl -s -X DELETE $BASE/listings/LISTING_ID

# Delete a user
curl -s -X DELETE $BASE/users/USER_ID
```

### Error cases to verify

```bash
curl -s $BASE/users/123                      # 400 Invalid id
curl -s $BASE/users/652f1c2e5a1b2c3d4e5f6a7b # 404 User not found (valid-looking but absent)
curl -s -X POST $BASE/users -H 'Content-Type: application/json' -d '{"username":"x"}'        # 400 missing fields
curl -s -X POST $BASE/users -H 'Content-Type: application/json' -d '{"googleId":"1","username":"x","email":"a@b.com","role":"hacker"}'  # 400 bad enum
curl -s -X POST $BASE/users -H 'Content-Type: application/json' -d '{"googleId":"1","username":"x","email":"a@b.com","_id":"evil"}'     # 400 unknown field
# Create the same user twice -> second returns 409 duplicate
curl -s -X POST $BASE/listings -H 'Content-Type: application/json' -d '{"title":"t","description":"d","commodity":"c","pricePerUnit":1,"unit":"bag","quantityAvailable":1,"location":"l","supplierId":"652f1c2e5a1b2c3d4e5f6a7b"}'  # 400 supplierId does not reference an existing user
curl -s -X POST $BASE/listings -H 'Content-Type: application/json' -d '{"title":"t","description":"d","commodity":"c","pricePerUnit":1,"unit":"ton","quantityAvailable":1,"location":"l","supplierId":"USER_ID"}'       # 400 invalid unit
curl -s -X POST $BASE/listings -H 'Content-Type: application/json' -d '{"title":"t","description":"d","commodity":"c","pricePerUnit":1,"unit":"bag","quantityAvailable":1,"location":"l","supplierId":"USER_ID","status":"gone"}'  # 400 invalid status
```

## Pagination and filtering

`GET /users`, `GET /listings`, `GET /cooperatives`, and `GET /advisories` accept `page`
(default 1) and `limit` (default 20, max 100). `GET /listings` also accepts exact-match
`commodity`, `location`, and `status` filters; `GET /advisories` accepts exact-match `crop`,
`region`, and `severity` filters. Responses are a plain array sorted by `createdAt` descending.

```bash
# Pagination (users and listings)
curl -s "$BASE/users?page=1&limit=20"
curl -s "$BASE/listings?page=2&limit=10"

# Filtering listings (exact match; status validated against its enum)
curl -s "$BASE/listings?commodity=Maize"            # matches rows with commodity Maize
curl -s "$BASE/listings?location=Kaduna&status=available"
curl -s "$BASE/listings?commodity=DoesNotExist"     # 200 with []

# Query validation errors (all 400)
curl -s "$BASE/listings?limit=0"             # 400 limit must be at least 1
curl -s "$BASE/listings?limit=1000"          # 400 limit must not exceed 100
curl -s "$BASE/listings?page=abc"            # 400 page must be a positive integer
curl -s "$BASE/listings?status=gone"         # 400 status must be one of: available, sold
curl -s "$BASE/listings?commodity[\$ne]=x"   # 400 commodity must be a single string value (NoSQL injection blocked)

# Advisory filters
curl -s "$BASE/advisories?crop=Maize&severity=warning"
curl -s "$BASE/advisories?severity=gone"     # 400 severity must be one of: info, warning, critical
```

### Cooperatives and advisories (auth required for writes)

Writes need the session cookie from signing in at `/auth/google`. Via the Swagger UI the cookie
is sent automatically; via curl, capture and reuse the `connect.sid` cookie (`-c`/`-b`).

```bash
# Public reads
curl -s "$BASE/cooperatives"
curl -s "$BASE/advisories?region=Benue"

# Create a cooperative (any signed-in user; leadId comes from the session)
curl -s -b cookies.txt -X POST $BASE/cooperatives -H 'Content-Type: application/json' \
  -d '{"name":"Benue Grain Growers","location":"Makurdi","primaryCommodity":"Maize"}'
# Sending leadId -> 400 Unknown field(s): leadId
# Duplicate name  -> 409 name already exists

# Create an advisory (admin only; authorId comes from the session)
curl -s -b cookies.txt -X POST $BASE/advisories -H 'Content-Type: application/json' \
  -d '{"title":"Fall armyworm","content":"Scout maize fields","crop":"Maize","region":"Benue","severity":"warning"}'
# As a non-admin        -> 403 Insufficient permissions
# Invalid severity      -> 400 severity must be one of: info, warning, critical
# Without a session     -> 401 Authentication required
```

## MongoDB Atlas setup

1. Create a free cluster.
2. **Database Access** → add a database user with a username and password.
3. **Network Access** → add an IP allowlist entry. For Render, use `0.0.0.0/0` (allow from anywhere),
   since Render does not publish static outbound IPs on the free tier.
4. **Connect** → **Drivers** → copy the connection string. It looks like:
   `mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/agrolink?retryWrites=true&w=majority`
   Put a database name (e.g. `agrolink`) before the `?`.

### Dropping a stale index after renaming a unique field

Renaming a unique field in the Mongoose schema does not remove the index Atlas already
built for the old field name. The `githubId` → `googleId` rename is an example: the old
`githubId_1` unique index stays until you drop it, and because new documents have no
`githubId`, the second insert fails with a duplicate key error on `githubId: null`.

To fix: Atlas → **Browse Collections** → `users` → **Indexes** tab → drop **`githubId_1`**.
Mongoose recreates the correct `googleId_1` index on the next startup. If the collection
holds only test data, dropping the whole collection works too.

## Render deployment

Create a new **Web Service** from this repo and set:

- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Environment variables:**
  - `MONGODB_URI` = your Atlas connection string
  - `CORS_ORIGIN` = the origins you allow (your Render URL, and any frontend origin)
  - `NODE_ENV` = `production`
  - `SWAGGER_SERVER_URL` = your Render URL, e.g. `https://agrolink-api.onrender.com`
  - `PORT` is provided by Render automatically; the app reads `process.env.PORT`.

After deploy, open `https://<your-service>.onrender.com/api-docs`. The Swagger "Try it out"
button targets `SWAGGER_SERVER_URL` (or Render's `RENDER_EXTERNAL_URL` if that var is unset),
so it works against the live server rather than localhost.

## Known limitations

Google OAuth, sessions, and role/owner access control are now in place. Writes are
authenticated, `googleId` comes from the Google-verified profile (not the client), and `role`
can only be escalated to `admin` by an existing admin. The following are still open:

- **No rate limiting.** Neither the login flow (`/auth/google`) nor the API has rate limiting, so
  both are open to brute-force and abuse. A fixed-window limiter on auth and a general API limiter
  are the recommended next step.
- **Self role changes.** A signed-in user may change their own role between `farmer`, `supplier`,
  and `buyer` (only `admin` is protected). This is intentional for this project but means role is
  not a strong trust boundary below admin.
- **No account recovery or multi-provider linking.** Sign-in is Google-only, and an email already
  tied to one account cannot be linked to a second provider (the callback returns 409 by design).
- **The first admin is set manually in Atlas.** There is no bootstrap admin or invite flow.
- **Cooperative membership is not consented.** A lead can add any existing user to `memberIds`
  without that user's approval; members cannot remove themselves. Membership existence and
  uniqueness are validated, but consent is not.
