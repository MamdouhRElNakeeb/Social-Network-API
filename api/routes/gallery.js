const express = require('express');
const helpers = require('../controllers/helpers/functions');


// FILE SYSTEM MODULE
const del = require('delete');

// UPLOAD MULTER OBJECT
const upload = require('../controllers/uploadFile');

// ROUTER APP
const router = express.Router();


// GALLERY MODEL
const Gallery = require('../models/gallery');

/* 
###############
### GET ALL Coiffeur Gallery Resource
###############
*/


router.get('/getAllGalleries', (req, res, next) => {
    Gallery.find({})
        .exec()
        .then(respond => {
            if (respond.length >= 1) {
                res.status(200).json({
                    success: true,
                    count: respond.length,
                    galleries: respond
                })
            } else {
                res.status(200).json({
                    success: true,
                    count: 0,
                    message: 'There\'s Not Galleries Right Now!'
                })
            }
        })
        .catch(err => res.status(500).json(helpers.errorJSON(err)));
})




/* 
###############
### GET Coiffeur Gallery Resource
###############
*/

router.get('/getCoiffeurGallery/:id', (req, res, next) => {
    const id = req.params.id;

    Gallery
        .find({ coiffeur: id })
        .exec()
        .then(respond => {
            if (respond) {
                res.status(200).json({
                    success: true,
                    countGallery: respond[0].gallery.length,
                    gallery: respond[0].gallery
                })
            } else {
                res.status(500).json(helpers.errorJSON('Something Went Wrong!'));
            }
        })
        .catch(err => res.status(500).json(helpers.errorJSON(err)));

});


/* 
###############
### POST Coiffeur Gallery Resource
###############
*/
router.post('/postGalleryCoiffeur', upload.array('gallery', 10), (req, res, next) => {
    const galleryNames = [];
    const coiffeurId = req.body.coiffeur;

    for (let i = 0; i < req.files.length; i++) {
        galleryNames.push(req.files[i].path);
    }

    Gallery.find({ coiffeur: coiffeurId })
        .exec()
        .then(coiffeursFound => {
            if (coiffeursFound.length >= 1) { // UPDATE REQUEST
                // Update For Coiffeur if It's already exists
                Gallery.update({ coiffeur: coiffeurId }, {
                    $push: {
                        gallery: {
                            $each: galleryNames
                        }
                    }
                })
                    .select('coiffeur gallery')
                    .exec()
                    .then(respond => {
                        if (respond) {
                            res.status(200).json({
                                success: true,
                                message: 'Your Gallery Updated Successfully!'
                            })
                        } else {
                            res.status(500).json(helpers.errorJSON('Something Went Wrong!'));
                        }
                    })
                    .catch(err => res.status(500).json(helpers.errorJSON(err)));

            } else { // POST REQUEST [ New Request ]
                const newGallery = new Gallery({
                    coiffeur: coiffeurId,
                    gallery: galleryNames
                });


                newGallery
                    .save()
                    .then(respond => {
                        if (respond) {
                            res.status(200).json({
                                success: true,
                                message: 'Gallery Is Added Successfully'
                            })
                        } else {
                            res.status(500).json(helpers.errorJSON('Something Went Wrong!'));
                        }
                    })
                    .catch(err => res.status(500).json(helpers.errorJSON(err)));


            }
        })
        .catch(err => res.status().json(helpers.errorJSON(err)));






});

/* 
###############
### Update Coiffeur Gallery Resource
###############
*/
router.patch('/updateGalleryCoiffeur/:id', upload.array('gallery', 10), (req, res, next) => {
    const id = req.params.id;
    const galleryNames = [];

    for (let i = 0; i < req.files.length; i++) {
        galleryNames.push(req.files[i].path);
    }

    Gallery.update({ coiffeur: id }, {
        $push: {
            gallery: {
                $each: galleryNames
            }
        }
    })
        .select('coiffeur gallery')
        .exec()
        .then(respond => {
            if (respond) {
                res.status(200).json({
                    success: true,
                    message: 'Your Gallery Updated Successfully!'
                })
            } else {
                res.status(500).json(helpers.errorJSON('Something Went Wrong!'));
            }
        })
        .catch(err => res.status(500).json(helpers.errorJSON(err)));




});
/*
###############
### Delete Coiffeur Gallery Resource
###############
*/


router.delete('/deleteGalleryCoiffeur/:id', (req, res, next) => {
    const id = req.params.id;
    Gallery.update({ coiffeur: id }, {
        $pull: {
            gallery: {
                $in: req.body.images,
            }
        },
    },
        { multi: true }
    )
        .exec()
        .then(respond => {
            console.log(respond);
            if (respond) {
                // DELETE FILES BY DELETE MODULE
                // del(req.body.images, function (err, deleted) {
                //     if (err) throw err;
                // });
                // DELETE FILES BY FILE SYSTEM MODULE
                helpers.deleteFile(req.body.images);

                res.status(200).json({
                    success: true,
                    message: 'Image(s) Deleted From Your Gallery Successfully!'
                })
            } else {
                res.status(500).json(helpers.errorJSON('Something Went Wrong!'));
            }
        })
        .catch(err => res.status(500).json(helpers.errorJSON(err)));

});



router.delete('/deleteAllGalleries', (req, res, next) => {
    Gallery.remove({})
        .exec()
        .then(respond => {
            if (respond) {
                res.status(200).json({
                    success: true,
                    message: "Gallery Schema has been removed Successfully!"
                })
            } else {
                res.status(500).json(helpers.errorJSON('Something Wen Wrong!'));
            }
        })
        .catch(err => res.status(500).json(helpers.errorJSON(err)));
})




/*
###############
### Help Coiffeur Gallery Resource
###############
*/



router.get('/help/:unique', (req, res, next) => {
    const unique = req.params.unique;
    if (unique == "ns") {
        res.status(200).json({
            status: 200,
            apis: [{
                method: 'GET',
                url: "http://localhost:3000/api/gallery/getAllGalleries",
                response: "JSON: { _id(mongoose.id) , count(number of coiffeurs that has galleries) , success: true, galleries: Array }",
                info: "GET All Galleries for all Coiffeurs"
            }, {
                method: 'GET',
                url: "http://localhost:3000/api/gallery/getCoiffeurGallery/:id",
                response: "JSON: { _id(mongoose.id) , gallery: gallery , success: true }",
                info: "GET Gallery for Specific Coiffeur"
            }, {
                method: 'POST',
                url: "http://localhost:3000/api/gallery/postGalleryCoiffeur",
                body: "JSON: { coiffeur: _id(mongoose.id), gallery: Array of Images from multipart }",
                response: "{ success: true , message: String  }",
                info: "Post Images to Coiffeur Gallery"

            }, {
                method: 'DELETE',
                url: "http://localhost:3000/api/gallery/deleteGalleryCoiffeur/:id",
                body: "body { images: Array of File Names That will be sent to you from the get request of ther coiffeur Gallery }",
                response: "JSON: { success: true , message: String }",
                info: "Delete Gallery"
            },
            {
                method: 'DELETE',
                url: "http://localhost:3000/api/gallery/deleteAllGalleries",
                response: "JSON: { success: true , message: String }",
                info: "Delete All Galleries in the Schema"
            },
            {
                method: 'PATCH',
                url: "http://localhost:3000/api/gallery/updateGalleryCoiffeur/:id",
                body: "body { gallery: Array of images or single image with multipart }",
                response: "JSON: { success: true , message: String }",
                info: "Update Coiffeur Gallery Profile"
            }]
        })
    } else {
        res.status(409).json(helpers.errorJSON('Unauthoriazed Request'));

    }
})










module.exports = router;