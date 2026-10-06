# AgroLink API

Node.js/Express + MongoDB (Mongoose) marketplace API for agricultural suppliers and buyers.
CSE 341 final project. Interactive docs are served at `/api-docs`.

Authentication uses Google as the OAuth provider because most of the farmers this API serves already have Google accounts; OAuth itself is added in Week 6.

## Collections

- **users**: `googleId`, `username`, `email`, `role` (`farmer | supplier | buyer | admin`), `createdAt`
- **listings**: `title`, `description`, `commodity`, `pricePerUnit`, `unit`, `quantityAvailable`, `location`, `supplierId` (ref → users), `createdAt`

## Local setup

1. `npm install`
2. Copy `.env.example` to `.env` and fill in the values:
   - `PORT` — e.g. `3000`
   - `MONGODB_URI` — your MongoDB Atlas connection string
   - `CORS_ORIGIN` — comma-separated list of allowed origins (e.g. `http://localhost:3000`)
   - `NODE_ENV` — `development` or `production`
   - `SWAGGER_SERVER_URL` — leave blank locally; set to your Render URL in production
3. `npm run dev` (nodemon) or `npm start`
4. Open `http://localhost:3000/api-docs`

## Routes

| Method | Path            | Purpose          |
| ------ | --------------- | ---------------- |
| GET    | /users          | List users       |
| GET    | /users/:id      | Get one user     |
| POST   | /users          | Create user      |
| PUT    | /users/:id      | Update user      |
| DELETE | /users/:id      | Delete user      |
| GET    | /listings       | List listings    |
| GET    | /listings/:id   | Get one listing  |
| POST   | /listings       | Create listing   |
| PUT    | /listings/:id   | Update listing   |
| DELETE | /listings/:id   | Delete listing   |

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

# Create a listing (supplierId must be an existing user id)
curl -s -X POST $BASE/listings -H 'Content-Type: application/json' \
  -d '{"title":"Fresh Maize","description":"Grade A yellow maize","commodity":"Maize","pricePerUnit":180.5,"unit":"bag","quantityAvailable":120,"location":"Kaduna","supplierId":"USER_ID"}'

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
