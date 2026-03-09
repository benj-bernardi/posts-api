import pool from "../database/db.js";

// FIND / GET
export async function findUserById(userId) {
  const result = await pool.query(
    "SELECT id, name, email, role, created_at FROM users WHERE id = $1",
    [userId]
  );

  return result.rows[0] ?? null;
}

export async function findUserByEmail(email) {
  const result = await pool.query(
    "SELECT id, name, email, password, role FROM users WHERE email = $1",
    [email]
  );

  return result.rows[0] ?? null;
}

export async function findUserByName(name) {
  const result = await pool.query(
    "SELECT id FROM users WHERE name = $1",
    [name]
  );

  return result.rows[0] ?? null;
}

export async function findUserPassword(userId) {
  const result = await pool.query(
    "SELECT password FROM users WHERE id = $1",
    [userId]
  );

  return result.rows[0] ?? null;
}

// CREATE
export async function createUser(name, email, hashedPassword) {
  const result = await pool.query(
    `INSERT INTO users (name, email, password)
     VALUES ($1, $2, $3)
     RETURNING id, name, email, role`,
    [name, email, hashedPassword]
  );

  return result.rows[0];
}


// UPDATE
export async function findEmailForUpdate(email, userId) {
  const result = await pool.query(
    "SELECT id FROM users WHERE email = $1 AND id != $2",
    [email, userId]
  );

  return result.rows[0] ?? null;
}

export async function findNameForUpdate(name, userId) {
  const result = await pool.query(
    "SELECT id FROM users WHERE name = $1 AND id != $2",
    [name, userId]
  );

  return result.rows[0] ?? null;
}

export async function updateUserById(name, email, hashedPassword, userId) {
  const result = await pool.query(
    `UPDATE users
     SET name = COALESCE($1, name),
         email = COALESCE($2, email),
         password = COALESCE($3, password),
         updated_at = NOW()
     WHERE id = $4
     RETURNING id`,
    [name ?? null, email ?? null, hashedPassword ?? null, userId]
  );

  return result.rows[0] ?? null;
}

// DELETE
export async function deleteUserById(userId) {
  const result = await pool.query(
    "DELETE FROM users WHERE id = $1 RETURNING id",
    [userId]
  );

  return result.rows[0] ?? null;
}