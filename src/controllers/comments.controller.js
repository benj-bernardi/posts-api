import { createCommentDB, findPostById, deleteCommentDB } from "../models/commentModel.js";

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

        const postExists = await findPostById(id);

        if (!postExists){
            return res.status(404).json({ error: "Post not found" });
        }

        const comment = await createCommentDB(trimmed, id, userId);

        res.status(201).json({
            message: "Comment created successfully",
            comment
        });
    } catch(err){
        next(err);
    }
}

export async function deleteComment(req, res, next){
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const deleted = await deleteCommentDB(id, userId);

        if (!deleted){
            return res.status(404).json({ error: "Comment not found or not authorized" });
        }

        res.status(204).send();
    } catch (err){
        next(err);
    }
}