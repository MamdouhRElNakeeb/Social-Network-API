const mongoose = require('mongoose');


const GallerySchema = mongoose.Schema({
    coiffeur: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Coiffeur',
        required: true
    },
    gallery: [
        {
            type: String
        }
    ]
});



const GalleryModel = mongoose.model('Gallery' , GallerySchema);

module.exports = GalleryModel;