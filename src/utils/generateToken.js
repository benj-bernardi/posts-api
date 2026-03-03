import jwt from "jsonwebtoken";

export const token = (payload) => {
    return jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );
}

export const decoded = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
}