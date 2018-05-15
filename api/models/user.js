const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    userData: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserData'
    },
    followers:[
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'UserData'
        }
    ],
    following:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'UserData'
        }
    ]
});

const userModel = mongoose.model('User', userSchema);

module.exports = userModel;