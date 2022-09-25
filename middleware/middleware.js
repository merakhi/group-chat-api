const jwt = require("jsonwebtoken");
const User = require("./../models/user");
exports.isAuthenticated = async (req, res, next) => {
    const authHeader = req.get('Authorization');
    if (!authHeader) {
        const errorMsg = 'Not authenticated. Please provide token';
        return res.status(401).json({
            errorMsg: errorMsg
        });
        // throw error;
    }
    const token = authHeader.split(' ')[1];
    let decodedToken;
    try {
        decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        let user = await User.findOne({ "_id": decodedToken.id, "token": token });
        if (!user) {
            return res.status(500).json({
                errorCode: "EXPIRED_TOKEN",
                errorMsg: 'Token is Expired. Please login again'
            });
        }
    } catch (err) {
        return res.status(500).json({
            errorCode: "EXPIRED_TOKEN",
            errorMsg: 'Token is Expired. Please login again'
        });
    }
    if (!decodedToken) {
        return res.status(401).json({
            errorCode: "NOT_AUTHENTICATED",
            errorMsg: 'Not authenticated'
        });
    }
    req.decodedToken = decodedToken;
    req.user = decodedToken.id;
    next();
}
