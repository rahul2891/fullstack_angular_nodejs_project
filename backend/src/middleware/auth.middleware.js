const { db } = require('../data/db');
const { verifyAccessToken } = require('../utils/jwt');

function requireAuth(req, res, next) {
    const header = req.headers.authorization || '';
    const [ scheme, token ] = header.split(' ');

    if(scheme !== 'Bearer' || !token){
        return res.status(401).json({ message: 'Missing or malformed Authorization header'});
    }

    try {
        const payload = verifyAccessToken(token);
        const user = db.findUserById(payload.sub);
        if(!user){
            return res.status(401).json({message: 'User no longer exists'})
        }
        req.user = { id: user.id, email: user.email, name: user.name, role: user.role };
        return next();
        
    } catch (err) {
        if(err.name === 'TokenExpiredError') {
            return res.status(401).json({message: 'Access token expired', code: 'TOKEN_EXPIRED'})
        }
            return res.status(401).json({message: 'Invalid access token'})

    }
}

function requireRole(...allowedRoles) {
    return (req, res, next) => {
        if(!req.user) {
            return res.status(401).json({message: 'Not authenticated'})
        }
        if(!allowedRoles.includes(req.user.role)){
            return res.status(403).json({
                message: `Role '${req.user.role}' is not permitted to perform this action `
            })
        }
        return next();
    }
}

module.exports = { requireAuth, requireRole }