const express = require("express");
const router = express.Router();
const messageController = require("./../controllers/messageController");
const { check } = require('express-validator');
const authMiddleware = require("./../middleware/middleware");

router.get("/:chatId", authMiddleware.isAuthenticated, messageController.getAllMessagesByChatId);
router.post("/", [
    check('message').trim().isLength({ min: 1 }).withMessage('Please enter a valid message').bail(),
    check('chatId').trim().isLength({ min: 1 }).withMessage('Please  provide chatId').bail()
], authMiddleware.isAuthenticated, messageController.sendMessage);

router.patch("/emoji/:messageId",
    [
        check('emojiCode').trim().isLength({ min: 1 }).withMessage('Please enter a valid content').bail()
    ], authMiddleware.isAuthenticated, messageController.updateMessageEmoji);

module.exports = router;