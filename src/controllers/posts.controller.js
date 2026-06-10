import pool from "../database/db.js";

import {
    getAllPosts,
    createPostDB,
    updatePostDB,
    deletePostDB,
    findPostById
} from "../models/post.models.js";

import { findUserById } from "../models/user.models.js";

export async function getPosts(req, res, next) {
    try {
        const posts = await getAllPosts();
        res.status(200).json(posts);
    } catch (err) {
        next(err);
    }
}

export async function createPost(req, res, next) {
    try {
        const { title, content } = req.body;
        const userId = req.user.id;

        if (!title || !content) {
            return res.status(400).json({ error: "Title and content are required" });
        }

        if (title.trim().length < 3 || title.trim().length > 120) {
            return res.status(400).json({ error: "Title must be between 3 and 120 characters" });
        }

        if (content.trim().length < 10) {
            return res.status(400).json({ error: "Content must be at least 10 characters long" });
        }

        const userResult = await findUserById(userId);

        if (!userResult) {
            return res.status(404).json({ error: "User not found" });
        }

        const user = userResult[0];

        const newPost = await createPostDB(title, content, userId);

        res.status(201).json({
            message: "Post created successfully",
            post: {
                id: newPost.id,
                user_id: userId,
                name: userId.name,
                title: newPost.title,
                content: newPost.content,
                created_at: newPost.created_at
            }
        });
    } catch (err) {
        next(err);
    }
}

export async function updatePost(req, res, next) {
    try {
        const { id } = req.params;
        const { title, content } = req.body;
        const user_id = req.user.id;

        if (title === undefined && content === undefined) {
            return res.status(400).json({
                error: "Nothing to update"
            });
        }

        if (title !== undefined) {
            if (title.trim().length < 3 || title.trim().length > 120) {
                return res.status(400).json({
                    error: "Title must be between 3 and 120 characters"
                });
            }
        }

        if (content !== undefined) {
            if (content.trim().length < 10) {
                return res.status(400).json({
                    error: "Content must be at least 10 characters long"
                });
            }
        }

        const post = await findPostById(id);

        if (!post) {
            return res.status(404).json({
                error: "Post not found"
            });
        }

        if (post.user_id !== user_id) {
            return res.status(403).json({
                error: "You are not allowed to edit this post"
            });
        }

        const fifteenMinutes = 15 * 60 * 1000;

        if (Date.now() - new Date(post.created_at) > fifteenMinutes) {
            return res.status(403).json({
                error: "Edit time expired"
            });
        }

        const updated = await updatePostDB(
            title,
            content,
            id,
            user_id
        );

        res.status(200).json({
            message: "Post updated successfully",
            post: updated
        });

    } catch (err) {
        next(err);
    }
}

export async function deletePost(req, res, next) {
    try {
        const { id } = req.params;
        const user_id = req.user.id;

        const deleted = await deletePostDB(id, user_id);

        if (!deleted) {
            return res.status(404).json({ error: "Post not found or not authorized" });
        }

        res.status(204).send();
    } catch (err) {
        next(err);
    }
}