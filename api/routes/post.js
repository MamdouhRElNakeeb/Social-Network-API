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

    const updatedData = {};
    if (req.file) {
        updatedData['profileImage'] = req.file.path;
    }

    const post = new Post({
        user: req.body.user,
        text: req.body.email,
        password: hash
    });

    post.save()
        .then(result => {
            if (result) {
                res.status(200).json({
                    success: true,
                    message: 'Post is published successfully'
                })
            }
        })
        .catch(saveError => {
            res.status(500).json(helpers.errorJSON(saveError))
        })

});



router.post('/newPost', upload.single('image'), (req, res, next) => {
    const galleryNames = [];
    const text = req.body.text;
    const user = req.body.id;
    const image = '';

    if(req.file){
        image = req.file.path;
    }

    const post = new Post({
        user: user,
        text: text,
        image: image
    });
    
    const post = new Post(post);
    post
        .save()
        .then(respond => {
            if (respond) {
                res.status(200).json({
                    success: true,
                    message: 'Post Added Successfully!'
                })
            } else {
                res.status(500).json(helpers.errorJSON('Something Went Wrong!'))
            }
        })
        .catch(err => res.status(500).json(helpers.errorJSON(err)))
        
});


/*
####################
-> Login Resource
####################
*/
router.post('/add', (req, res, next) => {
    const text = req.body.text;
    const userID = req.body.id;

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

router.get('/getAllPosts/:id', (req, res, next) => {
  const id = req.params.id;
    Post.find({user: id})
        .exec()
        .then(respond => {
            if (respond.length >= 1) {
                res.status(200).json({
                    success: true,
                    count: respond.length,
                    posts: respond
                })
            } else {
                res.status(200).json({
                    count: 0,
                    success: true,
                    message: 'There\'s not posts Right Now!'
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

router.get('/getPost/:id', (req, res, next) => {
    const id = req.params.id;
    Coiffeur.findById(id)
        .exec()
        .then(respond => {
            if (respond) {
                res.status(200).json({
                    success: true,
                    post: respond
                })
            } else {
                res.status(500).json(helpers.errorJSON('post Not Found'));
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


router.post('/updateProfileImage/:id', upload.single('profileImage'), (req, res, next) => {
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
                    message: 'Your Profile Image is updated successfully!'
                })
            }
        })
        .catch(err => {
            res.status(500).json(helpers.errorJSON(err));
        });
})



router.patch('/updateProfile/:id', (req, res, next) => {
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


router.delete('/deletePost/:id', (req, res, next) => {
    const id = req.params.id;
    const postRemove = post.remove({ _id: id }).exec();
    const gallerypostRemove = Gallery.remove({ post: id }).exec();

    Promise.all([postRemove, gallerypostRemove])
        .then(respond => {
            if (respond) {
                res.status(200).json({
                    success: true,
                    message: 'post Deleted Successfully!'
                })
            } else {
                res.status(500).json(helpers.errorJSON('Something Went Wrong'));
            }
        })
        .catch(err => {
            res.status(500).json(helpers.errorJSON(err))
        })
});


router.delete('/deleteAllposts', (req, res, next) => {
    Coiffeur.remove({})
        .exec()
        .then(respond => {
            if (respond) {
                res.status(200).json({
                    success: true,
                    message: 'All posts Deleted Successfully!'
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
                url: "/getAllposts",
                response: "JSON: { _id(mongoose.id) , count(number of users) , success: true, posts: Array }",
                info: "GET All posts"
            }, {
                method: 'GET',
                url: "/getpost/:id",
                response: "JSON: { _id(mongoose.id) , post: post , success: true }",
                info: "GET All posts"
            }, {
                method: 'POST',
                url: "/post/login",
                body: "JSON: { email: Email, password: String }",
                response: "{ success: true , message: String  }",
                info: "Login posts"

            }, {
                method: 'POST',
                url: "/post/signup",
                body: "JSON: { name: String, email: Email, mobile:Number , password: String }",
                response: "{ success: true , message: String  }",
                info: "Create post Account"
            }, {
                method: 'DELETE',
                url: "http://localhost:3000/api/post/deletepost/:id",
                response: "JSON: { success: true , message: String }",
                info: "Delete post"
            }, {
                method: 'DELETE',
                url: "http://localhost:3000/api/post/deleteAllposts",
                response: "JSON: { success: true , message: String }",
                info: "Delete All posts"
            },
            {
                method: 'PATCH',
                url: "/post/updateProdile/:id",
                body: "Send What you want to updated",
                response: "JSON: { success: true , message: String }",
                info: "Update post Profile"
            }]
        })
    } else {
        res.status(409).json(helpers.errorJSON('Unauthoriazed Request'));

    }
})




module.exports = router;
