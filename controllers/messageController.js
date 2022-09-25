const Message = require("./../models/message");
const Chat = require("./../models/chat");
const User = require("./../models/user");
const { validationResult } = require('express-validator');

exports.sendMessage = async (req, res, next) => {
    try {
        const valResults = validationResult(req);
        if (!valResults.isEmpty()) {
            const error = new Error('Validation failed');
            error.data = valResults.errors[0].msg
            error.statusCode = 422;
            // throw error;
            return res.status(422).json(error);

        }
        const { message, chatId } = req.body;
        let newMessage = {
            sender: req.user,
            message: message,
            chat: chatId,
        };
        newMessage = await Message.create(newMessage);
        newMessage = await newMessage.populate("sender", "name ");
        newMessage = await newMessage.populate("chat");
        newMessage = await User.populate(newMessage, {
            path: "chat.users",
            select: "name  email",
        });
        const chat = await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: newMessage });

        if (chat) {
            return res.status(200).json({
                msg: 'Chat updated successfully',
                newMessage
            })
        } else {
            return res.status(500).json({
                msg: 'Unable to send message'
            })
        }
    } catch (error) {
        next(error);
    }

};


exports.getAllMessagesByChatId = async (req, res, next) => {
    try {

        const messages = await Message.find({ chat: req.params.chatId })
            .populate("sender", "name email")
            .populate("chat");

        if (messages) {
            return res.status(200).json(messages)
        } else {
            return res.status(500).json({
                msg: 'Unable to fetch messages by chat id'
            })
        }
    } catch (error) {
        next(error);
    }

};


exports.updateMessageEmoji = async (req, res, next) => {
    try {
        const valResults = validationResult(req);
        if (!valResults.isEmpty()) {
            const error = new Error('Validation failed');
            error.data = valResults.errors[0].msg
            error.statusCode = 422;
            // throw error;
            return res.status(422).json(error);

        }
        const { emojiCode } = req.body;

        const message = await Message.findById(req.params.messageId);
        console.log(message)
        if (message) {

            if (message.emojiByUsers?.length) {
                let hasCurrentUserAlreadyReacted = false;
                message.emojiByUsers.forEach(emojiByUser => {
                    if (emojiByUser.user._id == req.user) {
                        hasCurrentUserAlreadyReacted = true;
                        emojiByUser.emojiCode = emojiCode;
                    }
                });
                if (!hasCurrentUserAlreadyReacted) {
                    message.emojiByUsers.push({
                        user: req.user,
                        emojiCode
                    })
                }
                console.log(message)
            } else {
                message.emojiByUsers = [{
                    user: req.user,
                    emojiCode
                }]
            }
            message.save(function (err, user) {
                if (err)
                    return res.status(400).json({
                        msg: "Unable update message"
                    });
                return res.status(200).json({ msg: "message updated successfully" })
            });

        } else {
            return res.status(400).json({
                msg: "Message with message id:" + req.params.messageId + 'does not exists'
            });
        }

    } catch (error) {
        next(error);
    }

};