// Raw SQL queries for the projects table.
const pool = require('./pool');

async function createProject({ teamId, name, description }) {
  const result = await pool.query(
    `INSERT INTO projects (team_id, name, description)
     VALUES ($1, $2, $3)
     RETURNING id, team_id, name, description, created_at`,
    [teamId, name, description || null]
  );
  return result.rows[0];
}

async function findProjectById(id) {
  const result = await pool.query(
    `SELECT id, team_id, name, description, created_at FROM projects WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

async function listProjectsByTeam(teamId) {
  const result = await pool.query(
    `SELECT id, team_id, name, description, created_at
     FROM projects
     WHERE team_id = $1
     ORDER BY created_at DESC`,
    [teamId]
  );
  return result.rows;
}

// Partial update: only overwrite columns the caller actually passed. Building
// the SET clause dynamically (instead of one fixed UPDATE ... SET name=$1,
// description=$2) means a PATCH with just { name } doesn't blow away an
// existing description by writing NULL over it.
async function updateProject(id, { name, description }) {
  const fields = [];
  const values = [];
  let paramIndex = 1;

  if (name !== undefined) {
    fields.push(`name = $${paramIndex++}`);
    values.push(name);
  }
  if (description !== undefined) {
    fields.push(`description = $${paramIndex++}`);
    values.push(description);
  }

  if (fields.length === 0) {
    return findProjectById(id);
  }

  values.push(id);
  const result = await pool.query(
    `UPDATE projects SET ${fields.join(', ')} WHERE id = $${paramIndex}
     RETURNING id, team_id, name, description, created_at`,
    values
  );
  return result.rows[0] || null;
}

async function deleteProject(id) {
  const result = await pool.query(
    `DELETE FROM projects WHERE id = $1 RETURNING id`,
    [id]
  );
  return result.rowCount > 0;
}

module.exports = { createProject, findProjectById, listProjectsByTeam, updateProject, deleteProject };
