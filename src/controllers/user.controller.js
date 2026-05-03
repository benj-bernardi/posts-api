import { accessToken, refreshToken } from "../utils/generateToken.js";
import { comparePassword, hashPassword } from "../utils/hashPassword.js";

import {
  findUserById,
  findUserByEmail,
  findUserByName,
  createUser,
  findEmailForUpdate,
  findNameForUpdate,
  findUserPassword,
  updateUserById,
  createRefreshToken
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

    const hashedPassword = await hashPassword(password);

    const user = await createUser(name, email, hashedPassword);

    res.status(201).json({ message: "Registered successfully" });
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

    const match = await comparePassword(password, user.password);

    if (!match) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const accessTkn = accessToken({ id: user.id });

    const refreshTkn = refreshToken({ id: user.id });

    await createRefreshToken(
      user.id,
      refreshTkn,
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    );

    res.status(200).json({
      message: "Login successful",
      accessTkn,
      refreshTkn, 
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