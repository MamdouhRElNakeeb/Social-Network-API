const mongoose = require('mongoose');



const CoiffeurSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        match: /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    mobile: {
        type: Number,
        required: true,
        match: /^[0-9]{11}$/
    },
    address: {
        type: String,
    },
    city: {
        type: String,
    },
    lat: {
        type: Number,
        match: /^[0-9]+$/,
    },
    lng: {
        type: Number,
        match: /^[0-9]+$/,
    },
    serviceType: {
        type: String,
        match: /^[A-Za-z]+$/,
    },
    description: {
        type: String
    },
    profileImage: {
        type: String
    },
    workHours: {
        type: Number,
    }
});


const CoiffeurModel = mongoose.model('Coiffeur', CoiffeurSchema);

module.exports = CoiffeurModel;