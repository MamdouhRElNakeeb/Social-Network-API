const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const helpers = require('../controllers/helpers/functions');

// user MODEL
const User = require('../models/user');
const UserData = require('../models/userData');

// Multer Upload Object
const uplaod = require('../controllers/uploadFile');

/*
####################
-> SignUp Resource
####################
*/

router.post('/signup', (req, res, next) => {
    UserData.find({ email: req.body.email })
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
                    const userData = new UserData({
                        name: req.body.name,
                        email: req.body.email,
                        password: hash,
                        mobile: req.body.mobile,
                        profileImage: 'img',
                        bio: 'bio',
                        cover: 'cover'
                    });

                    userData
                        .save()
                        .then(result => {
                            if(result){
                                const user = new User({
                                    userData: userData.id,
                                    followers:[],
                                    following:[]
                                });
            
                                user
                                    .save()
                                    .then(result => {
                                        if (result) {
                                            res.status(200).json({
                                                success: true,
                                                message: 'User Created Successfully',
                                                user: userData
                                            })
                                        }
                                    })
                                    .catch(saveError => {
                                        res.status(500).json(helpers.errorJSON(saveError))
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

    UserData.find({ email: email })
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

                      const userData = new UserData({
                          name: req.body.name,
                          email: req.body.email,
                          password: respond[0].password,
                          mobile:  respond[0].mobile,
                          id:  respond[0]._id
                      });

                        res.status(200).json({
                            success: true,
                            message: 'You are Logged In Successfully',
                            usesr: userData,
                            user: userData

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

router.post('/follow', (req, res, next) => {
   
    const myID = req.body.myID;
    const followingID = req.body.followingID;

    User.update({ userData: myID }, {
        $addToSet: {
            following: followingID
        }
    })
    .exec()
    .then(respond => {
        if (respond) {

            User.update({ userData: followingID }, {
                $addToSet: {
                    followers: myID
                }
            })
            .exec()
            .then(respond => {
                if (respond) {
                    res.status(200).json({
                        success: true,
                        message: 'You\'ve followed this user successfully'
                    })
                } else {
                    res.status(500).json(helpers.errorJSON('Something Went Wrong!'));
                }
            })
            .catch(err => res.status(500).json(helpers.errorJSON(err)));
        } else {
            res.status(500).json(helpers.errorJSON('Something Went Wrong!'));
        }
    })
    .catch(err => res.status(500).json(helpers.errorJSON(err)));

});

router.post('/unfollow', (req, res, next) => {
    const myID = req.body.myID;
    const followingID = req.body.followingID;


    User.update({ userData: myID }, {
        $pull: {
            following: followingID
        }
    })
    .exec()
    .then(respond => {
        if (respond) {

            User.update({ userData: followingID }, {
                $pull: {
                    followers: myID
                }
            })
            .exec()
            .then(respond => {
                if (respond) {
                    res.status(200).json({
                        success: true,
                        message: 'You\'ve unfollowed this user successfully'
                    })
                } else {
                    res.status(500).json(helpers.errorJSON('Something Went Wrong!'));
                }
            })
            .catch(err => res.status(500).json(helpers.errorJSON(err)));
        } else {
            res.status(500).json(helpers.errorJSON('Something Went Wrong!'));
        }
    })
    .catch(err => res.status(500).json(helpers.errorJSON(err)));

});

/*
####################
-> Get All users Resource
####################
*/
router.get('/getAllusers', (req, res, next) => {
    User.find({})
        .select('userData followers following')
        .populate('userData', 'name profileImage email mobile')
        .populate('followers', 'name email')
        .populate('following', 'name mobile')
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

/*
####################
-> Get Single user Resource
####################
*/

router.get('/getuser/:id', (req, res, next) => {
    const id = req.params.id;
    User.find({ userData: id})
        .select('-_id')
        .populate('userData', 'name profileImage email mobile')
        .populate('followers', 'name email')
        .populate('following', 'name mobile')
        .exec()
        .then(respond => {
            if (respond) {
                console.log(respond);
                res.status(200).json({
                    success: true,
                    _id: respond[0].userData._id,
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

router.post('/updateProfile/:id', (req, res, next) => {
    const id = req.params.id;
    const updatedData = {};
    for (let key in req.body) {
        if (req.body[key] !== '') {
            updatedData[key] = req.body[key];
        }
    }
    User.update({ _id: id }, { $set: updatedData })
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

router.post('/updateProfileImage/:id', uplaod.single('profileImage'), (req, res, next) => {
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
    User.update({ _id: id }, { $set: updatedData })
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

router.post('/updateProfileCover/:id', uplaod.single('cover'), (req, res, next) => {
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
    User.update({ _id: id }, { $set: updatedData })
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
    const userRemove = User.remove({ _id: id }).exec();
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
    User.remove({})
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
