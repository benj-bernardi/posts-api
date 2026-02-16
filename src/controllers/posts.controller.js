import pool from "../database/db.js";

export async function createPost(req, res, next) {
    try {
        const { title, content } = req.body;
        const userId = req.user.id;

        if (!title || !content){
            return res.status(400).json({ error: "Title and content are required" });
        }

        if (title.trim().length < 3 || title.trim().length > 120){
            return res.status(400).json({ error: "Title must be between 3 and 120 characters"});
        }

        if (content.trim().length < 10) {
            return res.status(400).json({ error: "Content must be at least 10 characters long" });
        }

        const userSelection = await pool.query("SELECT name FROM users WHERE id = $1", [userId]);

        if (userSelection.rows.length === 0){
            return res.status(404).json({ error: "User not found" });
        }

        const user = userSelection.rows[0];

        const result = await pool.query(
            "INSERT INTO posts (title, content, user_id) VALUES ($1, $2, $3) RETURNING title, content, user_id, created_at",
            [title, content, userId]);
        
        const newPost = result.rows[0]; 

        res.status(201).json({
            message: "Post created successfuly", 
            post: { 
                user_id: userId,
                name: user.name,
                title: newPost.title,
                content: newPost.content
            }
        });
    } catch (err){
        next(err);
    }
}

export async function updatePost(req, res, next){
    try {
        const { id } = req.params;
        const { title, content } = req.body;
        const user_id = req.user.id;

        if (title === undefined && content === undefined){
            return res.status(400).json({ error: "Nothing to update"})
        }

        if (title != undefined){
            if (title.trim().length < 3 || title.trim().length > 120){
                return res.status(400).json({ error: "Title must be between 3 and 120 characters" });
            }
        }
        
        if (content != undefined){
            if (content.trim().length < 10){
                return res.status(400).json({ error: "Content must be at least 10 characters long" });
            }
        }

        const updatePost = await pool.query(     
        "UPDATE posts SET title = COALESCE($1, title), content = COALESCE($2, content) WHERE id = $3 AND user_id = $4 RETURNING *",
        [title, content, id, user_id]);

        if (updatePost.rows.length === 0){
            return res.status(404).json({ error: "Post not found" });
        }

        res.status(204).send();
    } catch (err){
        next(err);
    }
}