export const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied: insufficient permissions' });
        }
        next();
    };
};

export const requireVerified = (req, res, next) => {
    if (req.user.role === 'admin') {
        return next();
    }

    if (req.user.verification_status !== 'verified') {
        return res.status(403).json({
            message: 'Account verification is required before accessing this feature',
            verification_status: req.user.verification_status || 'pending'
        });
    }

    next();
};
