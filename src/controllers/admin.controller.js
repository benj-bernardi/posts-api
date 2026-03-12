import { getUsers, deleteUser } from "../models/admin.models";
import { deletePost } from "./posts.controller";

export async function getAllUsers(req, res, next){
    try {
        const getallUsers = await getUsers();
        res.json(getallUsers)
    } catch (err){
        next(err);
    }
}

export async function deleteUserByID(req, res, next){
    try {
        const { id } = req.params;

        const deleteuser = await deleteUser(id);

        if (!deleteuser){
            res.status(404).json({ error: "User not found" });
        }

        res.status(204).send();
    } catch (err){
        next(err);
    }
}

export async function DeletePostById(req, res, next){
    try {
        const { id } = req.params;

        const deletepost = await deletePost(id);

        if (!deletepost){
            res.status(404).json({ error: "Posts not found"});
        }

        res.status(204).send();
    } catch (err) {
        next(err)
    }
}