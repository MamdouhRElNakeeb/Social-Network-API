const mongoose = require('mongoose');


const PostSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserData',
        required: true
    },
    text: {
        type: String,
        required: true
    },
    image: {
        type: String
    },
    likes:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'UserData'
        }
    ],
    comments:[
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'UserData'
            },
            text: {
                type: String
            }
            
        }
    ]
});


const PostModel = mongoose.model('Post', PostSchema);


module.exports = PostModel;
