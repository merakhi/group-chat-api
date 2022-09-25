const express = require("express");
const userController = require("./../controllers/userController");
const User = require("./../models/user");
const authMiddleware = require("./../middleware/middleware");
const { check } = require('express-validator');
const router = express.Router();

router.post("/register", [
    check('email').notEmpty().withMessage('email is required'),
    check('email').isEmail().withMessage('email is not valid'),
    check('email')
        .isEmail()
        .withMessage('Please enter a valid user\'s email')
        .bail()
        .custom((value, { req }) => {
            return User.findOne({ email: value }).then(userDoc => {
                if (userDoc) {
                    return Promise.reject('User E-mail address already exists, Please try again with different E-mail address')
                }

            })
        })
        .bail(),
    check('password').trim().isLength({ min: 5 }).withMessage('User password must be at least 5 characters long').bail(),
    check('name').trim().isLength({ min: 3 }).withMessage('Please enter a valid user\'s name').bail(),

], userController.signupUser);


router.post("/login", [
    check('email')
        .isEmail()
        .withMessage('Please enter a valid email')
        .bail(),
    check('password').trim().isLength({ min: 5 }).withMessage('Invalid Password').bail(),
], userController.loginUser);


router.post("/logout", authMiddleware.isAuthenticated, userController.logoutUser);

router.get("/all", authMiddleware.isAuthenticated, userController.getAllUsers);

module.exports = router;