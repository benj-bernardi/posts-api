import pool from "../database/db.js";

// Get all posts
export async function getAllPosts() {
    const result = await pool.query(`
        SELECT 
            u.name, 
            p.id, 
            p.title, 
            p.content,
            p.created_at,
            p.updated_at 
        FROM posts p 
        JOIN users u ON u.id = p.user_id
        ORDER BY p.created_at DESC
    `);

    return result.rows;
}

// Create post
export async function createPostDB(title, content, user_id) {
    const result = await pool.query(
        "INSERT INTO posts (title, content, user_id) VALUES ($1, $2, $3) RETURNING *",
        [title, content, user_id]
    );

    return result.rows[0];
}

// Update post
export async function updatePostDB(title, content, id, user_id) {
    const result = await pool.query(
        `UPDATE posts 
         SET title = COALESCE($1, title),
             content = COALESCE($2, content),
             updated_at = NOW()
         WHERE id = $3 AND user_id = $4
         RETURNING *`,
        [title ?? null, content ?? null, id, user_id]
    );

    return result.rows[0];
}

// Delete post
export async function deletePostDB(id, user_id) {
    const result = await pool.query(
        "DELETE FROM posts WHERE id = $1 AND user_id = $2 RETURNING id",
        [id, user_id]
    );

    return result.rows[0];
}