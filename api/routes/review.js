const express = require('express');
const router = express.Router();
const helpers = require('../controllers/helpers/functions');

const Review = require('../models/review');
const Coiffeur = require('../models/coiffeur');
const Bride = require('../models/bride');

router.post('/insertReview', (req, res, next) => {


    Review.find({ bride: req.body.bride, coiffeur: req.body.coiffeur })
        .exec()
        .then(resp => {
            if (resp.length >= 1) {
                res.status(500).json({
                    success: false,
                    error: 'You only have one review to the Coiffeur'
                })
            } else {
                const review = new Review({
                    bride: req.body.bride,
                    coiffeur: req.body.coiffeur,
                    rate: req.body.rate,
                    comment: req.body.comment
                });
                review
                    .save()
                    .then(respond => {
                        if (respond) {
                            res.status(200).json({
                                success: true,
                                message: 'Review Added Successfully!'
                            })
                        } else {
                            res.status(500).json(helpers.errorJSON('Somthing Went Wrong'));

                        }
                    })
                    .catch(err => {
                        res.status(500).json(helpers.errorJSON(err));
                    })
            }
        })
        .catch(err => {
            res.status(500).json(helpers.errorJSON(err));
        })

})


router.get('/getAllReviews', (req, res, next) => {
    Review.find({})
        .select('bride coiffeur rate comment')
        .populate('coiffeur', 'name _id profileImage')
        .populate('bride', 'name _id profileImage')
        .exec()
        .then(respond => {
            if (respond.length >= 1) {
                res.status(200).json({
                    success: true,
                    count: respond.length,
                    reviews: respond
                });
            } else {
                res.status(200).json({
                    count: 0,
                    success: true,
                    message: 'There\'s no Reviews Right Now!'
                })
            }
        })
        .catch(err => {
            res.status(500).json(helpers.errorJSON(err));
        })
});



router.get('/getCoiffeurReviews/:id', (req, res, next) => {

    Review.find({ coiffeur: req.params.id })
        .select('bride coiffeur rate comment')
        .populate('coiffeur', 'name _id profileImage')
        .populate('bride', 'name _id profileImage')
        .exec()
        .then(respond => {
            if (respond.length >= 1) {
                res.status(200).json({
                    success: true,
                    count: respond.length,
                    reviews: respond
                })
            } else {
                res.status(200).json({
                    success: true,
                    count: 0,
                    message: 'There\'s no Reviews Right Now'
                })
            }
        })
        .catch(err => {
            res.status(500).json(helpers.errorJSON(err));
        })
});

router.get('/getBrideReviews/:id', (req, res, next) => {
    Review.find({ bride: req.params.id })
        .select('bride coiffeur rate comment')
        .populate('coiffeur', 'name _id profileImage')
        .populate('bride', 'name _id profileImage')
        .exec()
        .then(respond => {
            if (respond.length >= 1) {
                res.status(200).json({
                    success: true,
                    count: respond.length,
                    reviews: respond
                })
            } else {
                res.status(200).json({
                    success: true,
                    count: 0,
                    message: 'There\'s no Reviews Right Now'
                })
            }
        })
        .catch(err => {
            res.status(500).json(helpers.errorJSON(err));
        })
});

router.get('/getReview/:id', (req, res, next) => {
    Review.find({ _id: req.params.id })
        .select('bride coiffeur rate comment')
        .populate('coiffeur', 'name _id profileImage')
        .populate('bride', 'name _id profileImage')
        .exec()
        .then(respond => {
            if (respond.length >= 1) {
                res.status(200).json({
                    success: true,
                    review: respond[0]
                })
            } else {
                res.status(200).json({
                    success: true,
                    count: 0,
                    message: 'There\'s no Review For this ID'
                })
            }
        })
        .catch(err => {
            res.status(500).json(helpers.errorJSON(err));
        })
});


router.patch('/editReview/:id', (req, res, next) => {
    Review.update({ _id: req.params.id }, { $set: { comment: req.body.comment, rate: req.body.rate } })
        .exec()
        .then(respond => {
            if (respond) {
                res.status(200).json({
                    success: true,
                    message: 'User Updated Successfully',
                });
            } else {
                res.status(500).json(helpers.errorJSON('Something Went Worng!'));

            }
        })
        .catch(err => {
            res.status(500).json(helpers.errorJSON(err));
        })
})

router.delete('/deleteReveiw/:id', (req, res, next) => {

    Review.remove({ _id: req.params.id })
        .exec()
        .then(respond => {
            if (respond) {
                res.status(200).json({
                    success: true,
                    message: 'Review Deleted Successfully!'
                })
            } else {
                res.status(500).json(helpers.errorJSON('Something Went Wrong'));
            }
        })
        .catch(err => {
            res.status(500).json(helpers.errorJSON(err));

        })

});

router.get('/help/:unique', (req, res, next) => {
    const unique = req.params.unique;
    if (unique == "ns") {
        res.status(200).json({
            status: 200,
            apis: [{
                method: 'GET',
                url: "http://localhost:3000/api/review/getAllReviews",
                response: "JSON: { _id(mongoose.id) , count(number of users) , success: true, review: Array }",
                info: "GET All brides"
            }, {
                method: 'GET',
                url: "http://localhost:3000/api/review/getReview/:id",
                response: "JSON: { _id(mongoose.id) , review , success: true }",
                info: "GET Review"
            }, {
                method: 'GET',
                url: "http://localhost:3000/api/review/getBrideReviews/:id",
                response: "JSON: { _id(mongoose.id) , reviews: Array , success: true }",
                info: "GET All Bride Reviews"
            }, {
                method: 'GET',
                url: "http://localhost:3000/api/review/getCoiffeurReviews/:id",
                response: "JSON: { _id(mongoose.id) , reviews: Array , success: true }",
                info: "GET All Coiffeur Reviews"
            }, {
                method: 'POST',
                url: "http://localhost:3000/api/review/insertReview",
                body: "JSON: { bride: bride.id, coiffeur: coiffeur.id , comment: String, rate: Number }",
                response: "{ success: true , message: String  }",
                info: "Login bride"

            }, {
                method: 'DELETE',
                url: "http://localhost:3000/api/review/deleteReview/:id",
                response: "JSON: { success: true , message: String }",
                info: "Delete Review"
            }, {
                method: 'PATCH',
                url: "http://localhost:3000/api/review/editReview/:id",
                body: "{ comment: String , rate: Number }",
                response: "{ success: true , message: String , review: Review }",
                info: "Update Review"
            }]
        })
    } else {
        res.status(409).json(helpers.errorJSON('Unauthoriazed Request'));

    }
})









module.exports = router;