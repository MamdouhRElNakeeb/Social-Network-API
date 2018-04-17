const mongoose = require('mongoose');



const ReviewSchema = mongoose.Schema({
    bride: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Bride'
    },
    coiffeur: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Coiffeur'
    },
    rate: {
        type: Number,
        required: true,
        match: /^[0-9]+$/
    },
    comment: {
        type: String,
        required: true
    }
});


const ReviewModel = mongoose.model('Review', ReviewSchema);

module.exports = ReviewModel;