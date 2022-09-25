const User = require("./../models/user");
const { validationResult } = require('express-validator');



exports.signupUser = async (req, res, next) => {
    try {
        const valResults = validationResult(req);
        if (!valResults.isEmpty()) {
            const error = new Error('Validation failed');
            error.data = valResults.errors[0].msg
            error.statusCode = 422;
            // throw error;
            return res.status(422).json(error);

        }
        const { name, email, password } = req.body;
        const userExists = await User.findOne({ email })
        if (userExists)
            return res.status(400).json({
                msg: 'User with email id:' + email + ' already exists'
            });
        const user = await User.create({ name, email, password });

        if (user) {
            return res.status(200).json({
                msg: 'User created successfully'
            })
        } else {
            return res.status(500).json({
                msg: 'Unable to create user'
            })
        }
    } catch (error) {
        next(error);
    }

};

exports.loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const userData = await User.findOne({ email });
        if (userData) {
            const passwordMatched = userData.matchPassword(password);
            if (passwordMatched) {
                // generate token
                userData.generateToken((err) => {
                    if (err)
                        return res.status(400).json({
                            msg: 'Unable to login'
                        });
                    return res.status(200).json({
                        token: userData.token,
                        id: userData._id
                    });
                });
            } else {
                return res.status(400).json({
                    msg: 'Incorrect Password'
                })
            }
        } else {
            return res.status(400).json({
                msg: 'User with email id :' + email + ' does not exists. Please SignUp'
            })
        }
    } catch (error) {
        throw error;
    }
};

exports.logoutUser = async (req, res, next) => {
    try {

        let user = await User.findOne({ "_id": req.decodedToken.id });

        user.deleteToken((err) => {
            if (err) return res.status(400).send(err);
            res.sendStatus(200);
        });

    } catch (err) {
        return res.status(500).json({
            errorCode: "EXPIRED_TOKEN",
            errorMsg: 'Token is already Expired'
        });
    }

};


exports.getAllUsers = async (req, res, next) => {
    try {
        const keyword = req.query.search
            ? {
                $or: [
                    { name: { $regex: req.query.search, $options: "i" } },
                    { email: { $regex: req.query.search, $options: "i" } },
                ],
            }
            : {};
        let userList = await User.find(keyword, { _id: 1, name: 1, email: 1 }).find({ _id: { $ne: req.decodedToken.id } });
        return res.status(200).json(userList);
    } catch (error) {
        next(error);
    }

};