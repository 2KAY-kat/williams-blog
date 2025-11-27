const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authorization header missing or invalid.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const secretKey = process.env.JWT_SECRET || 'qxKKq7HbkDCEMCG2YffE6bzquzET7FqZ1SchXU93n3E';
        const decoded = jwt.verify(token, secretKey);
        
        // Attach blogger data to request
        // In PHP: $request->withAttribute('blogger', $bloggerData);
        // In Express: req.blogger = bloggerData;
        req.blogger = decoded.data;
        
        next();
    } catch (error) {
        console.error("JWT Error:", error.message);
        return res.status(401).json({ error: 'Invalid or expired token.' });
    }
};

module.exports = authMiddleware;
