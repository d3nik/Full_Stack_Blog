import jwt from "jsonwebtoken";

export const checkAuth = (requiredRole = null) => {
    return (req, res, next) => {

        const token = (req.headers.authorization || '').replace(/Bearer\s?/, '');

        if (!token) {
            return res.status(403).json({
                message: 'No access',
            });
        }

        try {
            const decoded = jwt.verify(token, 'secret321');
            req.userId = decoded._id;
            req.userRole = decoded.role;
            
            if (requiredRole && req.userRole !== requiredRole) {
                return res.status(403).json({
                    message: 'Admin access required',
                });
            }
            
            next();
        } catch (error) {
            return res.status(403).json({
                message: 'No access',
            });
        }
    };
};