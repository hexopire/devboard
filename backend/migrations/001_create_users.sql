-- Using a native Postgres ENUM for role instead of a CHECK constraint:
-- ENUM gives us a named reusable type (used again nowhere else here, but scales
-- better once other tables need the same set of values) and Postgres stores it
-- as a compact 4-byte value internally, not the raw text. Trade-off: adding a
-- new role later requires an ALTER TYPE migration, not just an app-level change.
CREATE TYPE user_role AS ENUM ('admin', 'member', 'viewer');

CREATE TABLE users (
    id            SERIAL PRIMARY KEY,
    name          VARCHAR(255) NOT NULL,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role          user_role NOT NULL DEFAULT 'member',
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
