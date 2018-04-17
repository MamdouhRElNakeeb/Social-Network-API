const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const helpers = require('../controllers/helpers/functions');


// Multer Upload Object
const upload = require('../controllers/uploadFile');

// Require Coiffeur Model
const Coiffeur = require('../models/coiffeur');

// GALLERY MODEL
const Gallery = require('../models/gallery');


/*
####################
-> SignUp Resource
####################
*/

router.post('/signup', (req, res, next) => {
    Coiffeur.find({ email: req.body.email })
        .exec()
        .then(respond => {
            if (respond.length >= 1) {
                res.status(409).json({
                    success: false,
                    error: 'This Email is already taken',
                });
            } else {
                // Encrypting Password
                const encryptedPassword = bcrypt.hash(req.body.password, 10, (err, hash) => {
                    if (err) {
                        res.status(500).json(helpers.errorJSON(err));
                    }
                    const user = new Coiffeur({
                        name: req.body.name,
                        email: req.body.email,
                        password: hash,
                        mobile: req.body.mobile
                    });

                    user
                        .save()
                        .then(result => {
                            if (result) {
                                res.status(200).json({
                                    success: true,
                                    message: 'Coiffeur Created Successfully'
                                })
                            }
                        })
                        .catch(saveError => {
                            res.status(500).json(helpers.errorJSON(saveError))
                        })
                })
            }
        })
        .catch(err => {
            res.status(500).json(helpers.errorJSON(err))
        })
});




/*
####################
-> Login Resource
####################
*/
router.post('/login', (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    Coiffeur.find({ email: email })
        .exec()
        .then(respond => {
            if (respond.length <= 0) {
                res.status(404).json(helpers.errorJSON('User not Found'));
            } else {
                bcrypt.compare(password, respond[0].password, (error, result) => {
                    if (error) {
                        res.status(404).json(helpers.errorJSON('Email or Password is not correct'))
                    }

                    if (result === true) {
                        res.status(200).json({
                            success: true,
                            message: 'You are Logged In Successfully'
                        });
                    } else {
                        res.status(404).json(helpers.errorJSON('Email or Password is not correct'))
                    }
                })
            }
        })
        .catch(err => {
            res.status(500).json(helpers.errorJSON(err))
        })
})


/*
####################
-> Get All Brides Resource
####################
*/

router.get('/getAllCoiffeurs', (req, res, next) => {
    Coiffeur.find({})
        .exec()
        .then(respond => {
            if (respond.length >= 1) {
                res.status(200).json({
                    success: true,
                    count: respond.length,
                    coiffeurs: respond
                })
            } else {
                res.status(200).json({
                    count: 0,
                    success: true,
                    message: 'There\'s not Coiffeurs Right Now!'
                })
            }
        })
        .catch(error => {
            res.status(500).json(helpers.errorJSON(error))
        })
})


/*
####################
-> Get Bride By ID Resource
####################
*/

router.get('/getCoiffeur/:id', (req, res, next) => {
    const id = req.params.id;
    Coiffeur.findById(id)
        .exec()
        .then(respond => {
            if (respond) {
                res.status(200).json({
                    success: true,
                    coiffeur: respond
                })
            } else {
                res.status(500).json(helpers.errorJSON('Coiffeur Not Found'));
            }
        })
        .catch(err => {
            res.status(500).json(helpers.errorJSON(err));
        })
})


/*
####################
-> Update Profile Resource
####################
*/


router.patch('/updateProfile/:id', upload.single('profileImage'), (req, res, next) => {
    const id = req.params.id;
    const updatedData = {};
    for (let key in req.body) {
        if (req.body[key] !== '') {
            updatedData[key] = req.body[key];
        }
    }
    if (req.file) {
        updatedData['profileImage'] = req.file.path;
    }

    Coiffeur.update({ _id: id }, { $set: updatedData })
        .exec()
        .then(respond => {
            if (respond) {
                res.status(200).json({
                    success: true,
                    message: 'Your Profile Updated Successfully!'
                })
            }
        })
        .catch(err => {
            res.status(500).json(helpers.errorJSON(err));
        });


})







/*
####################
-> Delete Coiffeur Resource
####################
*/


router.delete('/deleteCoiffeur/:id', (req, res, next) => {
    const id = req.params.id;
    const coiffeurRemove = Coiffeur.remove({ _id: id }).exec();
    const galleryCoiffeurRemove = Gallery.remove({ coiffeur: id }).exec();

    Promise.all([coiffeurRemove, galleryCoiffeurRemove])
        .then(respond => {
            if (respond) {
                res.status(200).json({
                    success: true,
                    message: 'Coiffeur Deleted Successfully!'
                })
            } else {
                res.status(500).json(helpers.errorJSON('Something Went Wrong'));
            }
        })
        .catch(err => {
            res.status(500).json(helpers.errorJSON(err))
        })
});


router.delete('/deleteAllCoiffeurs', (req, res, next) => {
    Coiffeur.remove({})
        .exec()
        .then(respond => {
            if (respond) {
                res.status(200).json({
                    success: true,
                    message: 'All Coiffeurs Deleted Successfully!'
                })
            } else {
                res.status(500).json(helpers.errorJSON('Something Went Wrong'));
            }
        })
        .catch(err => {
            res.status(500).json(helpers.errorJSON(err))
        })
});


router.get('/help/:unique', (req, res, next) => {
    const unique = req.params.unique;
    if (unique == "ns") {
        res.status(200).json({
            status: 200,
            apis: [{
                method: 'GET',
                url: "http://localhost:3000/api/coiffeur/getAllCoiffeurs",
                response: "JSON: { _id(mongoose.id) , count(number of users) , success: true, coiffeurs: Array }",
                info: "GET All Coiffeurs"
            }, {
                method: 'GET',
                url: "http://localhost:3000/api/coiffeur/getCoiffeur/:id",
                response: "JSON: { _id(mongoose.id) , coiffuer: coiffeur , success: true }",
                info: "GET All Coiffeurs"
            }, {
                method: 'POST',
                url: "http://localhost:3000/api/coiffeur/login",
                body: "JSON: { email: Email, password: String }",
                response: "{ success: true , message: String  }",
                info: "Login Coiffeurs"

            }, {
                method: 'POST',
                url: "http://localhost:3000/api/coiffeur/signup",
                body: "JSON: { name: String, email: Email, mobile:Number , password: String }",
                response: "{ success: true , message: String  }",
                info: "Create Coiffeur Account"
            }, {
                method: 'DELETE',
                url: "http://localhost:3000/api/coiffeur/deleteCoiffeur/:id",
                response: "JSON: { success: true , message: String }",
                info: "Delete Coiffeur"
            }, {
                method: 'DELETE',
                url: "http://localhost:3000/api/coiffeur/deleteAllCoiffeurs",
                response: "JSON: { success: true , message: String }",
                info: "Delete All Coiffeurs"
            },
            {
                method: 'PATCH',
                url: "http://localhost:3000/api/coiffeur/updateProdile/:id",
                body: "Send What you want to updated",
                response: "JSON: { success: true , message: String }",
                info: "Update Coiffeur Profile"
            }]
        })
    } else {
        res.status(409).json(helpers.errorJSON('Unauthoriazed Request'));

    }
})




module.exports = router;