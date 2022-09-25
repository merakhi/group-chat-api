const User = require("./../models/user");
const Chat = require("./../models/chat");
const Message = require("./../models/message");
const { validationResult } = require('express-validator');

exports.createGroupChat = async (req, res, next) => {
    try {
        const valResults = validationResult(req);
        if (!valResults.isEmpty()) {
            const error = new Error('Validation failed');
            error.data = valResults.errors[0].msg
            error.statusCode = 422;
            // throw error;
            return res.status(422).json(error);

        }
        console.log(req.user);
        let userList = req.body.users;
        userList.push(req.user);
        const groupChat = await Chat.create({
            name: req.body.name,
            users: userList,
            isGroupChat: true,
            groupAdmin: req.user,
        });
        if (groupChat) {
            const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
                .populate("users", { _id: 1, name: 1, email: 1 })
                .populate("groupAdmin", { _id: 1, name: 1, email: 1 });
            return res.status(200).json(fullGroupChat);
        } else {
            return res.status(500).json({
                msg: 'Unable to create group chat'
            })
        }

    } catch (error) {
        next(error);
    }
};

// delete group chat by group chat id 
exports.deleteGroupChatById = async (req, res, next) => {
    try {
        const valResults = validationResult(req);
        if (!valResults.isEmpty()) {
            const error = new Error('Validation failed');
            error.data = valResults.errors[0].msg
            error.statusCode = 422;
            // throw error;
            return res.status(422).json(error);

        }
        console.log(req.user);
        console.log(req.params.id);
        const groupChat = await Chat.findOne({
            _id: req.params.id,
            groupAdmin: req.user
        });
        if (groupChat) {
            const deleteResp = await groupChat.deleteOne();
            console.log(deleteResp);
            return res.status(200).json({
                msg: "group chat with name '" + groupChat.name + "' deleted successfully"
            })
        } else {
            return res.status(400).json({
                msg: "You are not authorized to delete the group Chat"
            })
        }
    } catch (error) {
        next(error);
    }
};

// add user to group
exports.addUserToGroupChatById = async (req, res, next) => {
    try {
        const valResults = validationResult(req);
        if (!valResults.isEmpty()) {
            const error = new Error('Validation failed');
            error.data = valResults.errors[0].msg
            error.statusCode = 422;
            // throw error;
            return res.status(422).json(error);

        }

        const groupChat = await Chat.findOne({
            _id: req.params.id,
            groupAdmin: req.user
        });
        console.log(req.body)
        if (groupChat) {
            let userList = req.body.userList;
            for (let i = 0; i < userList.length; i++) {
                console.log(groupChat.users.indexOf(userList[i]))
                if (groupChat.users.indexOf(userList[i]) !== -1) {
                    // user already present
                } else {
                    groupChat.users.push(userList[i]);
                }
            }
            console.log(groupChat);
            groupChat.save(function (err, user) {
                if (err)
                    return res.status(400).json({
                        msg: "Unable add user to the group Chat"
                    });
                return res.status(200).json({ msg: "Users added to the group Chat" })
            });

        } else {
            return res.status(400).json({
                msg: "You are not authorized to add user to the group Chat"
            })
        }

    } catch (error) {
        next(error);
    }
};

// remove user from group
exports.removeUserFromGroupChatById = async (req, res, next) => {
    try {
        const valResults = validationResult(req);
        if (!valResults.isEmpty()) {
            const error = new Error('Validation failed');
            error.data = valResults.errors[0].msg
            error.statusCode = 422;
            // throw error;
            return res.status(422).json(error);

        }

        console.log(req.user);
        console.log(req.params.id);
        const groupChat = await Chat.findOne({
            _id: req.params.id,
            groupAdmin: req.user
        });
        if (groupChat) {
            if (req.user == req.params.userId) {
                return res.status(400).json({
                    msg: "Admin cannot be removed from the group Chat."
                });
            } else {
                let indexOfUser = groupChat.users.indexOf(req.params.userId);

                if (indexOfUser != -1) {
                    groupChat.users.splice(indexOfUser, 1);
                    groupChat.save(function (err, user) {
                        if (err)
                            return res.status(400).json({
                                msg: "Unable add user to the group Chat"
                            });
                        return res.status(200).json({ msg: "User removed from the group Chat" })
                    });
                } else {
                    return res.status(400).json({
                        msg: "User does not exists in the group Chat"
                    })
                }
            }

        } else {
            return res.status(400).json({
                msg: "You are not authorized to add user to the group Chat"
            })
        }

    } catch (error) {
        next(error);
    }
};

// search group chat by name
// current user id should be in chat user list
exports.searchByGroupChatName = async (req, res, next) => {
    try {
        const keyword = req.query.search
            ? {
                name: { $regex: req.query.search, $options: "i" }
            }
            : {};
        console.log(req.user);
        let chatList = await Chat.find(keyword, { _id: 1, name: 1, isGroupChat: 1, "users": 1 });
        return res.status(200).json(chatList);
    } catch (error) {
        next(error);
    }

};

// create one to one chat
exports.createOneToOneChat = async (req, res, next) => {
    try {
        const { userId } = req.body;
        const valResults = validationResult(req);
        if (!valResults.isEmpty()) {
            const error = new Error('Validation failed');
            error.data = valResults.errors[0].msg
            error.statusCode = 422;
            // throw error;
            return res.status(422).json(error);

        }

        if(req.user == userId){
            return res.status(400).json({
                msg:"One to one to chat cannot be created with the identical user"
            })
        }
        console.log(userId);
        var isChat = await Chat.find({
            isGroupChat: false,
            $and: [
                { users: { $elemMatch: { $eq: req.user } } },
                { users: { $elemMatch: { $eq: userId } } },
            ],
        })
            .populate("users", { _id: 1, name: 1, email: 1 })
            .populate("latestMessage");

        isChat = await User.populate(isChat, {
            path: "latestMessage.sender",
            select: "name  email",
        });

        isChat = await Message.populate(isChat, {
            path: "emojiByUsers.user",
            select: "name  email",
        });

        if (isChat.length) {
            res.send(isChat[0]);
        } else {
            var chatData = {
                name: "sender",
                isGroupChat: false,
                users: [req.user, userId],
            };


            const createdChat = await Chat.create(chatData);
            const fullChat = await Chat.findOne({ _id: createdChat._id }).populate(
                "users", { _id: 1, name: 1, email: 1 }
            );
            res.status(200).json(fullChat);

        }
    } catch (error) {
        next(error);
    }

};

exports.getAllChats = async (req, res) => {
    try {
        Chat.find({ users: { $elemMatch: { $eq: req.user } } })
            .populate("users", { _id: 1, name: 1, email: 1 })
            .populate("groupAdmin", { _id: 1, name: 1, email: 1 })
            .populate("latestMessage")
            .sort({ updatedAt: -1 })
            .then(async (results) => {
                results = await User.populate(results, {
                    path: "latestMessage.sender",
                    select: "name  email",
                });
                results = await Message.populate(results, {
                    path: "emojiByUsers.user",
                    select: "name  email",
                });
                res.status(200).send(results);
            });
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
};


