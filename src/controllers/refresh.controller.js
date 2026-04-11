import jwt from "jsonwebtoken";
import { findRefreshToken } from "../models/refreshtoken.models.js";

export async function refreshToken(req, res, next) {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(401).json({ error: "Refresh token required" });
        }

        const stored = await findRefreshToken(token);

        if (!stored) {
            return res.status(403).json({ error: "Invalid refresh token" });
        }

        if (new Date(stored.expires_at) < new Date()) {
            return res.status(403).json({ error: "Refresh token expired" });
        }

        // verify token
        const decoded = jwt.verify(token, process.env.REFRESH_SECRET);

        // generate new access token
        const accessToken = jwt.sign(
            { id: decoded.id },
            process.env.ACCESS_SECRET,
            { expiresIn: "15m" }
        );

        res.json({ accessToken });
    } catch (err) {
        next(err);
    }
}