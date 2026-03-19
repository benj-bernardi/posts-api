import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import {
  findUserById,
  findUserByEmail,
  findUserByName,
  createUser,
  findEmailForUpdate,
  findNameForUpdate,
  findUserPassword,
  updateUserById
} from "../models/user.models.js";

export async function getMe(req, res, next) {
  try {
    const user = await findUserById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (err) {
    next(err);
  }
}

export async function registerUser(req, res, next) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email and password are required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    const nameRegex = /^[a-zA-Z0-9_]{3,20}$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    if (!nameRegex.test(name)) {
      return res.status(400).json({ error: "Invalid username format" });
    }

    if (!passwordRegex.test(password)) {
      return res.status(400).json({ error: "Weak password" });
    }

    if (await findUserByEmail(email)) {
      return res.status(409).json({ error: "Email already registered" });
    }

    if (await findUserByName(name)) {
      return res.status(409).json({ error: "Name already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await createUser(name, email, hashedPassword);

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(201).json({ message: "Registered successfully", token });

  } catch (err) {
    next(err);
  }
}

export async function loginUser(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });

  } catch (err) {
    next(err);
  }
}

export async function updateUser(req, res, next) {
  try {
    const { name, email, password } = req.body;
    const userId = req.user.id;

    if (name === undefined && email === undefined && password === undefined) {
      return res.status(400).json({ error: "Nothing to update" });
    }

    let hashedPassword;

    if (name !== undefined) {
      if (await findNameForUpdate(name, userId)) {
        return res.status(400).json({ error: "Name already exists" });
      }
    }

    if (email !== undefined) {
      if (await findEmailForUpdate(email, userId)) {
        return res.status(400).json({ error: "Email already exists" });
      }
    }

    if (password !== undefined) {
      const current = await findUserPassword(userId);

      const match = await bcrypt.compare(password, current.password);

      if (match) {
        return res.status(400).json({ error: "Password must be different" });
      }

      hashedPassword = await bcrypt.hash(password, 12);
    }

    const updated = await updateUserById(name, email, hashedPassword, userId);

    if (!updated) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(204).send();

  } catch (err) {
    next(err);
  }
}