const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const helpers = require('../controllers/helpers/functions');

// BRIDE MODEL
const Bride = require('../models/bride');


// REVIEW MODEL
const Review = require('../models/review');

// Multer Upload Object
const uplaod = require('../controllers/uploadFile');

/*
####################
-> SignUp Resource
####################
*/

router.post('/signup', (req, res, next) => {
    Bride.find({ email: req.body.email })
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
                    const user = new Bride({
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
                                    message: 'Bride Created Successfully'
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

    Bride.find({ email: email })
        .exec()
        .then(respond => {
            if (respond.length <= 0) {
                res.status(404).json(helpers.errorJSON('Bride not Found'));
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
router.get('/getAllBrides', (req, res, next) => {
    Bride.find({})
        .exec()
        .then(respond => {
            if (respond.length >= 1) {
                res.status(200).json({
                    success: true,
                    count: respond.length,
                    brides: respond
                })
            } else {
                res.status(200).json({
                    count: 0,
                    success: true,
                    message: 'There\'s not Brides Right Now!'
                })
            }
        })
        .catch(error => {
            res.status(500).json(helpers.errorJSON(error))
        })
})

/*
####################
-> Get Single Bride Resource
####################
*/

router.get('/getBride/:id', (req, res, next) => {
    const id = req.params.id;
    Bride.findById(id)
        .exec()
        .then(respond => {
            if (respond) {
                res.status(200).json({
                    success: true,
                    bride: respond
                })
            } else {
                res.status(500).json(helpers.errorJSON('Bride Not Found'));
            }
        })
        .catch(err => {
            res.status(500).json(helpers.errorJSON(err));
        })
})

/*
####################
-> Update Bride Profile Resource
####################
*/

router.patch('/updateProfile/:id', uplaod.single('profileImage'), (req, res, next) => {
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
    Bride.update({ _id: id }, { $set: updatedData })
        .exec()
        .then(respond => {
            if (respond) {
                res.status(200).json({
                    success: true,
                    message: 'Your Profile Updated Successfully!'
                })
            } else {
                res.status(500).json(helpers.errorJSON('Something Went Error!'));
            }
        })
        .catch(err => {
            res.status(500).json(helpers.errorJSON(err));
        })

})




/*
####################
-> Delete Bride Resource
####################
*/
router.delete('/deleteBride/:id', (req, res, next) => {
    const id = req.params.id;
    const brideRemove = Bride.remove({ _id: id }).exec();
    const reviewBrideRemove = Review.find({ bride: id }).exec();

    Promise.all([brideRemove, reviewBrideRemove])
        .then(respond => {
            if (respond) {
                res.status(200).json({
                    success: true,
                    message: 'Bride Deleted Successfully!'
                })
            } else {
                res.status(500).json(helpers.errorJSON('Something Went Wrong'));
            }
        })
        .catch(err => {
            res.status(500).json(helpers.errorJSON(err))
        })
});



/*
####################
-> Delete All Bride Resource
####################
*/
router.delete('/deleteAllBrides', (req, res, next) => {
    Bride.remove({})
        .exec()
        .then(respond => {
            if (respond) {
                res.status(200).json({
                    success: true,
                    message: 'Brides Deleted Successfully!'
                })
            } else {
                res.status(500).json(helpers.errorJSON('Something Went Wrong'));
            }
        })
        .catch(err => {
            res.status(500).json(helpers.errorJSON(err))
        })
});

/*
####################
-> Help Bride Resource
####################
*/

router.get('/help/:unique', (req, res, next) => {
    const unique = req.params.unique;
    if (unique == "ns") {
        res.status(200).json({
            status: 200,
            apis: [{
                method: 'GET',
                url: "http://localhost:3000/api/bride/getAllBrides",
                response: "JSON: { _id(mongoose.id) , count(number of users) , success: true, brides: Array }",
                info: "GET All brides"
            }, {
                method: 'GET',
                url: "http://localhost:3000/api/bride/getBride/:id",
                response: "JSON: { _id(mongoose.id) , bride: Bride , success: true }",
                info: "GET All bride"
            }, {
                method: 'POST',
                url: "http://localhost:3000/api/bride/login",
                body: "JSON: { email: Email, password: String }",
                response: "{ success: true , message: String  }",
                info: "Login bride"

            }, {
                method: 'POST',
                url: "http://localhost:3000/api/bride/signup",
                body: "JSON: { name: String, email: Email, mobile:Number , password: String }",
                response: "{ success: true , message: String  }",
                info: "Create Bride Account"
            }, {
                method: 'DELETE',
                url: "http://localhost:3000/api/bride/deleteBride/:id",
                response: "JSON: { success: true , message: String }",
                info: "Delete Bride"
            }, {
                method: 'DELETE',
                url: "http://localhost:3000/api/bride/deleteAllBrides",
                response: "JSON: { success: true , message: String }",
                info: "Delete All Brides"
            },
            {
                method: 'PATCH',
                url: "http://localhost:3000/api/bride/updateProfile/:id",
                body: "Send What you want to updated",
                response: "JSON: { success: true , message: String }",
                info: "Update Bride Profile"
            }]
        })
    } else {
        res.status(409).json(helpers.errorJSON('Unauthoriazed Request'));

    }
})



module.exports = router;