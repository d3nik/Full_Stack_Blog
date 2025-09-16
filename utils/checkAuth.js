import jwt from "jsonwebtoken";

export default (req, res, next) => {

    const token = (req.headers.authorization || '').replace(/Bearer\s?/, '');

    if (!token) {
        return res.status(403).json({
            message: 'No access',
        });
    }

    try {
        const decoded = jwt.verify(token, 'secret321');
        req.userId = decoded._id;
        next();
    } catch (error) {
        return res.status(403).json({
            message: 'No access',
        });
    }
    
};