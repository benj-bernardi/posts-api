import pool from "../database/db.js";

export async function getUsers(){
    const getAllUsers = await pool.query("SELECT id, name, email, role, created_at, updated_at FROM users");
    return getAllUsers.rows;
}

export async function deleteUser(id){
    const deleteUser = await pool.query("DELETE FROM users WHERE id = $1 RETURNING id", [id]);
    return deleteUser.rows[0];
}

export async function deletePost(id) {
    const deletePostByID = await pool.query("DELETE FROM posts WHERE id = $1", [id]);
    return deletePostByID.rows[0];
}