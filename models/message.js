const mongoose = require('mongoose');
const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    message: {
        type: String,
        trim: true
    },
    chat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat'
    },
    emojiByUsers: [
        {
            _id: false,
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            emojiCode: {
                type: String,
                trim: true
            }
        }
    ]

}, {
    timestamps: true
});


module.exports = mongoose.model('Message', messageSchema);