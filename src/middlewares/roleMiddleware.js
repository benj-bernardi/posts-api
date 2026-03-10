export function authorizeRoles(allowedRole){
    return (req, res, next) => {
        const UserRole = req.user.role;

        if (!allowedRole.includes(UserRole)){
            res.status(403).json({ error: "Access denied" });
        }

        next();
    }
}