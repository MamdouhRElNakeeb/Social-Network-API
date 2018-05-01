const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const helpers = require('../controllers/helpers/functions');

// user MODEL
const user = require('../models/user');

// Multer Upload Object
const uplaod = require('../controllers/uploadFile');

/**
 * @api {post} /signup Create a new User
 * @apiVersion 0.3.0
 * @apiName Signup
 * @apiPermission none
 *
 * @apiDescription In this case "apiErrorStructure" is defined and used.
 * Define blocks with params that will be used in several functions, so you dont have to rewrite them.
 *
 * @apiParam {String} name          User name.
 * @apiParam {String} email         User Email.
 * @apiParam {String} password      User password.
 * @apiParam {String} mobile        User mobile No.
 *
 * @apiSuccess {Boolean} success    True/False.
 * @apiSuccess {String} message    True/False.
 *
 */

router.post('/signup', (req, res, next) => {
    user.find({ email: req.body.email })
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
                    const user = new user({
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
                                    message: 'user Created Successfully'
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




/**
 * @api {post} /login Create a new User
 * @apiVersion 0.3.0
 * @apiName Signup
 * @apiPermission none
 *
 * @apiDescription In this case "apiErrorStructure" is defined and used.
 * Define blocks with params that will be used in several functions, so you dont have to rewrite them.
 *
 * @apiHeader {String} Content-Type application/json.
 * 
 * @apiParam {String} email         User Email.
 * @apiParam {String} password      User password.
 *
 * @apiSuccess {Boolean} success    True/False.
 * @apiSuccess {String} message    True/False.
 *
 * 
 */

router.post('/login', (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    user.find({ email: email })
        .exec()
        .then(respond => {
            if (respond.length <= 0) {
                res.status(404).json(helpers.errorJSON('user not Found'));
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
-> Get All users Resource
####################
*/
router.get('/getAllusers', (req, res, next) => {
    user.find({})
        .exec()
        .then(respond => {
            if (respond.length >= 1) {
                res.status(200).json({
                    success: true,
                    count: respond.length,
                    users: respond
                })
            } else {
                res.status(200).json({
                    count: 0,
                    success: true,
                    message: 'There\'s not users Right Now!'
                })
            }
        })
        .catch(error => {
            res.status(500).json(helpers.errorJSON(error))
        })
})

/**
 * @api {get} /getuser/:id Read data of a User
 * @apiVersion 0.3.0
 * @apiName GetUser
 * @apiPermission none
 *
 * @apiDescription Compare Verison 0.3.0 with 0.2.0 and you will see the green markers with new items in version 0.3.0 and red markers with removed items since 0.2.0.
 *
 * @apiParam {Number} id The Users-ID.
 *
 * @apiExample Example usage:
 * curl -i http://localhost/getuser/5hkfajhkadkdfkadsj
 *
 * @apiSuccess {String}   _id            The Users-ID.
 * @apiSuccess {Date}     name           Fullname of the User.
 * @apiSuccess {String}   profileImage   Avatar-Image.
 * @apiSuccess {String}   email          Email.
 * @apiSuccess {String}   mobile         Mobile No.
 *
 * @apiError NoAccessRight Only authenticated Admins can access the data.
 * @apiError UserNotFound   The <code>id</code> of the User was not found.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Not Authenticated
 *     {
 *       "error": "NoAccessRight"
 *     }
 */

router.get('/getuser/:id', (req, res, next) => {
    const id = req.params.id;
    user.findById(id)
        .exec()
        .then(respond => {
            if (respond) {
                res.status(200).json({
                    success: true,
                    user: respond
                })
            } else {
                res.status(500).json(helpers.errorJSON('user Not Found'));
            }
        })
        .catch(err => {
            res.status(500).json(helpers.errorJSON(err));
        })
})

/*
####################
-> Update user Profile Resource
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
    user.update({ _id: id }, { $set: updatedData })
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
-> Delete user Resource
####################
*/
router.delete('/deleteuser/:id', (req, res, next) => {
    const id = req.params.id;
    const userRemove = user.remove({ _id: id }).exec();
    const reviewuserRemove = Review.find({ user: id }).exec();

    Promise.all([userRemove, reviewuserRemove])
        .then(respond => {
            if (respond) {
                res.status(200).json({
                    success: true,
                    message: 'user Deleted Successfully!'
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
-> Delete All user Resource
####################
*/
router.delete('/deleteAllusers', (req, res, next) => {
    user.remove({})
        .exec()
        .then(respond => {
            if (respond) {
                res.status(200).json({
                    success: true,
                    message: 'users Deleted Successfully!'
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
-> Help user Resource
####################
*/

router.get('/help/:unique', (req, res, next) => {
    const unique = req.params.unique;
    if (unique == "nh") {
        res.status(200).json({
            status: 200,
            apis: [{
                method: 'GET',
                url: "/api/user/getAllusers",
                response: "JSON: { _id(mongoose.id) , count(number of users) , success: true, users: Array }",
                info: "GET All users"
            }, {
                method: 'GET',
                url: "/api/user/getuser/:id",
                response: "JSON: { _id(mongoose.id) , user: user , success: true }",
                info: "GET All user"
            }, {
                method: 'POST',
                url: "/api/user/login",
                body: "JSON: { email: Email, password: String }",
                response: "{ success: true , message: String  }",
                info: "Login user"

            }, {
                method: 'POST',
                url: "/api/user/signup",
                body: "JSON: { name: String, email: Email, mobile:Number , password: String }",
                response: "{ success: true , message: String  }",
                info: "Create user Account"
            }, {
                method: 'DELETE',
                url: "/api/user/deleteuser/:id",
                response: "JSON: { success: true , message: String }",
                info: "Delete user"
            }, {
                method: 'DELETE',
                url: "/api/user/deleteAllusers",
                response: "JSON: { success: true , message: String }",
                info: "Delete All users"
            },
            {
                method: 'PATCH',
                url: "/api/user/updateProfile/:id",
                body: "Send What you want to updated",
                response: "JSON: { success: true , message: String }",
                info: "Update user Profile"
            }]
        })
    } else {
        res.status(409).json(helpers.errorJSON('Unauthoriazed Request'));

    }
})



module.exports = router;