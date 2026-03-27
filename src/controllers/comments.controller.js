import pool from "../database/db";

export async function createComment(req, res, next){
    try {
        const { content } = req.body;
        const { id } = req.params;
        const userId = req.user.id;
        
        if (!content){
            return res.status(400).json({ error: "Content is required"});
        }

        const trimmed = content.trim();

        if (trimmed.length < 3 || trimmed.length > 60){
            return res.status(400).json({ error: "Content must be between 3 and 60 characters"});
        }

        const postExists = await pool.query(
            "SELECT 1 FROM posts WHERE id = $1",
            [id]
        );

        if (postExists.rows.length === 0){
            return res.status(404).json({ error: "Post not found" });
        }

        const result = await pool.query(`
            INSERT INTO comments (content, post_id, user_id)
            VALUES ($1, $2, $3)
            RETURNING id, content, post_id, user_id, created_at
        `, [trimmed, id, userId]);

        res.status(201).json({
            message: "Comment created successfully",
            comment: result.rows[0]
        });
    } catch(err){
        next(err);
    }
}

export async function deleteComment(req, res, next){
    try {
        const user_id = req.user.id;
        const { id } = req.params;

        const deleteUserComment = await pool.query("DELETE FROM comments WHERE id = $1 AND user_id = $2 RETURNING id", [id, user_id]);

        if (deleteUserComment.rows.length === 0){
            return res.status(404).json({ error: "Comment not found or not authorized" });
        }

        res.status(204);
    } catch (err){
        next(err);
    }
}