CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'done');

CREATE TABLE tasks (
    id          SERIAL PRIMARY KEY,
    project_id  INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title       VARCHAR(255) NOT NULL,
    description TEXT,
    status      task_status NOT NULL DEFAULT 'todo',
    -- Nullable + SET NULL: an unassigned task is valid, and deleting the
    -- assignee should orphan the task's assignment, not delete the task.
    assignee_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_by  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    due_date    DATE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
