const express = require("express");
const userRouter = require("./userRoutes");
const chatRouter = require("./chatRoutes");
const messageRouter = require("./messageRoutes");
const router = express.Router();

router.use("/user/", userRouter);
router.use("/chat/", chatRouter);
router.use("/message/", messageRouter);
router.get("/", function (req, res) {
    res.status(200).json({
        msg: 'Group-Chat API :' + process.env.API_URL
    });
});

module.exports = router;