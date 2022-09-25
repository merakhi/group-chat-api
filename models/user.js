const mongoose = require('mongoose');
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    token: {
        type: String
    },
    groupAdmin: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat'
    }]

}, {
    timestamps: true
});
// to login user
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compareSync(enteredPassword, this.password);
};

// to sign up user
userSchema.pre("save", async function (next) {
    if (!this.isModified) {
        next();
    }
    this.password = await bcrypt.hashSync(this.password, 10);
});

// to generate token
userSchema.methods.generateToken = async function (cb) {

    var user = this;
    const token = jwt.sign({
        id: user._id
    }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRATION_TIME
    });
    user.token = token;
    user.save(function (err, user) {
        if (err) return cb(err);
        cb(null, user);
    });
};

// to delete token
userSchema.methods.deleteToken = function (cb) {
    var user = this;

    user.updateOne({ $unset: { token: 1 } }, function (err, user) {
        if (err) return cb(err);
        cb(null, user);
    })
}


module.exports = mongoose.model('User', userSchema);