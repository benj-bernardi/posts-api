import pool from "../database/db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export async function getMe(req, res, next){
    try {
        const userId = req.user.id;

        const result = await pool.query("SELECT id, email, created_at, name FROM users WHERE id = $1", [userId]);
        
         if (result.rows.length === 0){
            return res.status(404).json({ error: "User not found" });
        }

        res.json(result.rows[0]);
    } catch (err){
        next(err);
    }
}

export async function registerUser(req, res, next){
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password){
            return res.status(400).json({ error: "Name, email and password are required" });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        const nameRegex = /^[a-zA-Z0-9_]{3,20}$/;

        // Email verification 
        if (!emailRegex.test(email)){
            return res.status(400).json({ error: "Invalid email format" });
        };

        // Name verification
        if (!nameRegex.test(name)){
            return res.status(400).json(
                { error: "Username must be 3-20 characters long and contain only letters, numbers, or underscores." });
        };

        // Password verification 
        if (!passwordRegex.test(password)){
            return res.status(400).json(
                { error: "Password must be at least 8 characters long and contain at least one uppercase letter and one number" });
        };

        // User verification 
        const userExists = await pool.query("SELECT 1 FROM users WHERE email = $1", [email]);

        if (userExists.rows.length > 0){
            return res.status(409).json({ error: "Email already registred" });
        }
    
        const nameExists = await pool.query("SELECT 1 FROM users WHERE name = $1", [name]);

        if (nameExists.rows.length > 0){
            return res.status(409).json({ error: "Name already registred" });
        }
        
        // Hash of the password 
        const saltRounds = 12;

        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const result = await pool.query(
        "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, role",
        [name, email, hashedPassword]);
        
        const user = result.rows[0];
        
        // JWT token 
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN}
        );

        res.status(201).json({ message: "Registred successful", token });
    } catch (err){
        next(err);
    }
}

export async function loginUser(req, res, next){
    try {
        const { email, password } = req.body;

        if (!email || !password){
            return res.status(400).json({ error: "Email and password are required" });
        }

        // User verification
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)){
            return res.status(400).json({ error: "Invalid email format" });
        }

        const userExists = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

        if (userExists.rows.length === 0){
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const user = userExists.rows[0];

        // Password verification 
        const match = await bcrypt.compare(password, user.password);

        if (!match){
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // JWT token
        const token = jwt.sign(
            { id: user.id, role: user.role},
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.status(200).json({ 
            message: "Login successful", 
            token, user: { 
                id: user.id, 
                email: user.email,
                name: user.name
             }
        });
    } catch (err){
        next(err);
    }
};

export async function updateUser(req, res, next){
    try {
        const { name, email, password } = req.body;
        const user_id = req.user.id;

        if (name  === undefined && email === undefined && password === undefined){
            return res.status(400).json({ error: "Nothing to update" });
        }

        const nameRegex = /^[a-zA-Z0-9_]{3,20}$/;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

        if (name !== undefined){
            const nameExists = await pool.query("SELECT 1 FROM users WHERE name = $1 and id != $2", [name, user_id]);

            if (!nameRegex.test(name)){
                return res.status(400).json({ 
                    error: "Username must be 3-20 characters long and contain only letters, numbers, or underscores." });
            }
            
            if (nameExists.rows.length > 0){
                return res.status(400).json({ error: "Name already registred" });
            }
        }

        if (email !== undefined){
            const userExists = await pool.query("SELECT 1 FROM users WHERE email = $1 and id != $2", [email, user_id]);

            if (!emailRegex.test(email)){
                return res.status(400).json({ error: "Invalid email format" });
            }

            if (userExists.rows.length > 0){
                return res.status(400).json({ error: "Invalid credentials" });
            }
        }

        let hashedPassword;

        if (password !== undefined){
            const userPassword = await pool.query("SELECT password FROM users WHERE id = $1", [user_id]);
            const hashedPasswordFromDB = userPassword.rows[0].password;

            const match = await bcrypt.compare(password, hashedPasswordFromDB);

            if (!passwordRegex.test(password)){
                return res.status(400).json({ 
                    error: "Password must be at least 8 characters long and contain at least one uppercase letter and one number" });
            }

            if (match){
                return res.status(400).json({ error: "The password must be different from the current one" });
            }
            
            const hashedPassword = await bcrypt.hash(password, 12);
        }

        const updateUser = await pool.query(
            `UPDATE users 
                SET name = COALESCE($1, name), 
                email = COALESCE($2, email), 
                password = COALESCE($3, password) 
                WHERE id = $4`,
                [name, email, hashedPassword, user_id]);
    
        res.status(204).send();
    } catch (err){
        next(err);
    }
}