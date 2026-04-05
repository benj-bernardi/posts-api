import pool from "../database/db.js";

// Create comment
export async function createCommentDB(content, postId, userId) {
    const result = await pool.query(`
        INSERT INTO comments (content, post_id, user_id)
        VALUES ($1, $2, $3)
        RETURNING id, content, post_id, user_id, created_at
    `, [content, postId, userId]);

    return result.rows[0];
}

// Check if post exists
export async function findPostById(postId) {
    const result = await pool.query(
        "SELECT 1 FROM posts WHERE id = $1",
        [postId]
    );

    return result.rows.length > 0;
}

// Delete comment
export async function deleteCommentDB(commentId, userId) {
    const result = await pool.query(
        "DELETE FROM comments WHERE id = $1 AND user_id = $2 RETURNING id",
        [commentId, userId]
    );

    return result.rows[0];
}