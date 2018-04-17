const mongoose = require('mongoose');



const ServicesCoiffeurSchema = mongoose.Schema({
    coiffeur: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Coiffeur',
        required: true
    },
    price: {
        type: Number,
        required: true,
        match: /^[0-9]+$/
    },
    serviceID: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Services'
    },
    duration: {
        type: Number,
        required: true,
        match: /^[0-9]+$/
    }
});


const ServicesCoiffeurModel = mongoose.model('ServicesCoiffeur', ServicesCoiffeurSchema);


module.exports = ServicesCoiffeurModel;