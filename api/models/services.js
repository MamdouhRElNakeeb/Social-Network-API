const mongoose = require('mongoose');



const ServicesSchema = mongoose.Schema({
    serviceID: {
        type: String,
        required: true
    }
});


const ServicesModel = mongoose.model('Services', ServicesSchema);


module.exports = ServicesModel;