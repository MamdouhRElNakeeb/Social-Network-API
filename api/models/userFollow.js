const mongoose = require('mongoose');

const userFollowSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    followers:[
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        }
    ],
    following:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ]
});

const userFollowModel = mongoose.model('UserFollow', userFollowSchema);

module.exports = userFollowModel;