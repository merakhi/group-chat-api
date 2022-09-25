const express = require("express");
const chatController = require("./../controllers/chatController");
const { check } = require('express-validator');
const authMiddleware = require("./../middleware/middleware");
const router = express.Router();

router.get("/group", [], authMiddleware.isAuthenticated, chatController.searchByGroupChatName);
router.get("/all", [], authMiddleware.isAuthenticated, chatController.getAllChats);
router.post("/group", [
    check('name').trim().isLength({ min: 1 }).withMessage('Please enter a valid chat name').bail(),
    check('users').isArray().isLength({ min: 2 }).withMessage('Please  provide users list').bail()
], authMiddleware.isAuthenticated, chatController.createGroupChat);

router.patch("/group/:id/add-users", authMiddleware.isAuthenticated, chatController.addUserToGroupChatById);

router.delete("/group/:id/remove-user/:userId", authMiddleware.isAuthenticated, chatController.removeUserFromGroupChatById);

router.delete("/group/:id", authMiddleware.isAuthenticated, chatController.deleteGroupChatById);

router.post("/", [
    check('userId').notEmpty().withMessage('Please enter a valid userId').bail(),
], authMiddleware.isAuthenticated, chatController.createOneToOneChat);

module.exports = router;