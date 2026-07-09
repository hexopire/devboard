CREATE TYPE team_member_role AS ENUM ('lead', 'member');

-- Join table for the User <-> Team many-to-many relationship.
-- Composite PRIMARY KEY (team_id, user_id) instead of a surrogate id: it IS the
-- natural key here (a user can only be in a given team once) and it doubles as
-- the uniqueness constraint, so we don't need a separate UNIQUE(team_id, user_id).
CREATE TABLE team_members (
    team_id      INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_in_team team_member_role NOT NULL DEFAULT 'member',
    joined_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (team_id, user_id)
);
