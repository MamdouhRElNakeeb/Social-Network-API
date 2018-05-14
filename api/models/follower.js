const mongoose = require('mongoose');

const followerSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});

const followerSchema = mongoose.model('Follower', userSchema);

module.exports = followerSchema;
