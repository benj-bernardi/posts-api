import pool from "../database/db.js";

// Save refresh token
export async function createRefreshToken(userId, token, expiresAt) {
    const result = await pool.query(
        `INSERT INTO refresh_tokens (user_id, token, expires_at)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [userId, token, expiresAt]
    );

    return result.rows[0];
}

// Find token
export async function findRefreshToken(token) {
    const result = await pool.query(
        "SELECT * FROM refresh_tokens WHERE token = $1",
        [token]
    );

    return result.rows[0];
}

// Delete token (logout)
export async function deleteRefreshToken(token) {
    await pool.query(
        "DELETE FROM refresh_tokens WHERE token = $1",
        [token]
    );
}