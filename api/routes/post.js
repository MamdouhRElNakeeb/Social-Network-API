const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const helpers = require('../controllers/helpers/functions');


// Multer Upload Object
const upload = require('../controllers/uploadFile');

// Require User Model
const User = require('../models/user');

// Require UserData Model
const UserData = require('../models/userData');

// Post MODEL
const Post = require('../models/post');


/*
####################
-> SignUp Resource
####################
*/

router.post('/newPost', upload.single('image'), (req, res, next) => {

    const text = req.body.text;
    const user = req.body.id;
    let image = '';

    if(req.file){
        image = req.file.path;
    }

    const post = new Post({
        user: user,
        text: text,
        image: image,
        likes: [],
        comments: []
    });
    
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

router.post('/like', (req, res, next) => {

    const postID = req.body.postID;
    const userID = req.body.userID;

    Post.update({ _id: postID }, {
        $addToSet: {
            likes: userID
        }
    })
    .exec()
    .then(respond => {
        if (respond) {
            res.status(200).json({
                success: true,
                message: 'Post liked Successfully!'
            })
        } else {
            res.status(500).json(helpers.errorJSON('Something Went Wrong!'))
        }
    })
    .catch(err => res.status(500).json(helpers.errorJSON(err)))
        
});

router.post('/unlike', (req, res, next) => {

    const postID = req.body.postID;
    const userID = req.body.userID;

    Post.update({ _id: postID }, {
        $pull: {
            likes: userID
        }
    })
    .exec()
    .then(respond => {
        if (respond) {
            res.status(200).json({
                success: true,
                message: 'Post unliked Successfully!'
            })
        } else {
            res.status(500).json(helpers.errorJSON('Something Went Wrong!'))
        }
    })
    .catch(err => res.status(500).json(helpers.errorJSON(err)))
        
});

router.post('/comment', (req, res, next) => {

    const text = req.body.text;
    const userID = req.body.userID;
    const postID = req.body.postID;

    const comment = {
        user: userID,
        text: text
    };
    
    Post.update({ _id: postID}, {
        $push: {
            comments: comment
        }
    })
    .exec()
    .then(respond => {
        if (respond) {
            res.status(200).json({
                success: true,
                message: 'comment Added Successfully!'
            })
        } else {
            res.status(500).json(helpers.errorJSON('Something Went Wrong!'))
        }
    })
    .catch(err => res.status(500).json(helpers.errorJSON(err)))
        
        
});

router.post('/removeComment', (req, res, next) => {

    const commentID = req.body.commentID;
    const postID = req.body.postID;
    
    Post.update({ _id: postID}, {
        $pull: {
            comments: {
                _id: commentID
            }
        }
    })
    .exec()
    .then(respond => {
        if (respond) {
            res.status(200).json({
                success: true,
                message: 'comment removed Successfully!'
            })
        } else {
            res.status(500).json(helpers.errorJSON('Something Went Wrong!'))
        }
    })
    .catch(err => res.status(500).json(helpers.errorJSON(err)))
        
        
});

/*
####################
-> Get All Brides Resource
####################
*/

router.get('/getUserPosts/:id', (req, res, next) => {
    
    const id = req.params.id;
    
    Post.find({user: id})
        .populate('user', 'name profileImage')
        .populate('likes', 'name profileImage')
        .populate('comments.user', 'name profileImage')
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

router.get('/getNewsFeed/:id', (req, res, next) => {
    
    const id = req.params.id;

    User.find({ user: id })
        .select('following')
        .exec()
        .then(respond => {
            console.log(respond);
            console.log(respond[0].following);

            if (respond.length >= 1) {

                Post.find({ user: { $in: respond[0].following} })
                    .populate('user', 'name profileImage')
                    .populate('likes', 'name profileImage')
                    .populate('comments.user', 'name profileImage')
                    .exec()
                    .then(respond => {
                        console.log(respond);
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
                                message: 'Your friends don\'t have posts right now'
                            })
                        }
                        
                    })
                    .catch(error => {
                        res.status(500).json(helpers.errorJSON(error))
                    })
                
            } else {
                res.status(200).json({
                    count: 0,
                    success: true,
                    message: 'Follow some people to get their posts'
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

    Post.findById(id)
        .populate('user', 'name profileImage')
        .populate('likes', 'name profileImage')
        .populate('comments.user', 'name profileImage')
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
