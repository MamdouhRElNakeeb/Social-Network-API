const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const helpers = require('../controllers/helpers/functions');

const Admin = require('../models/admin');


router.post('/createAdmin', (req, res, next) => {
    if (req.headers.isroot == '1') {
        Admin.find({ email: req.body.email })
            .exec()
            .then(respond => {
                if (respond.length >= 1) {
                    res.status(409).json(helpers.errorJSON('Email is Already Taken!'));

                } else {
                    const hashedPassword = bcrypt.hash(req.body.password, 10, (err, hash) => {
                        if (err) {
                            res.status(500).json(helpers.errorJSON('Something Wen Wrong!'));
                        }
                        const admin = new Admin({
                            name: req.body.name,
                            password: hash,
                            email: req.body.email
                        })

                        admin
                            .save()
                            .then(result => {
                                if (result) {
                                    res.status(200).json({
                                        success: true,
                                        message: 'Admin Created Successfully!'
                                    })
                                } else {
                                    res.status(500).json(helpers.errorJSON('Something Wen Wrong!'))
                                }
                            })
                            .catch(err => {
                                res.status(500).json(helpers.errorJSON('Something Wen Wrong!'))
                            })
                    })
                }
            })
            .catch(err => {
                res.status(500).json(helpers.errorJSON(err));
            })
    } else {
        res.status(500).json(helpers.errorJSON('Unauthorized'));

    }


});


router.post('/login', (req, res, next) => {
    Admin.find({ email: req.body.email })
        .exec()
        .then(respond => {
            if (respond.length >= 1) {
                const password = req.body.password;
                bcrypt.compare(password, respond[0].password, (err, result) => {
                    if (err) {
                        res.status(404).json(helpers.errorJSON('User Not Found, Or Something Went Worng!'));
                    }
                    if (result === true) {
                        res.status(200).json({
                            success: true,
                            message: 'You Are Logged In Successfully!'
                        })
                    } else {
                        res.status(404).json(helpers.errorJSON('User Not Found, Or Something Went Worng!'));
                    }
                })
            } else {
                res.status(404).json(helpers.errorJSON('User Not Found, Or Something Went Worng!'));
            }
        })
        .catch(err => {
            res.status(500).json(helpers.errorJSON(err))
        })



});



router.get('/getAllAdmins', (req, res, next) => {
    console.log(req.headers);
    if (req.headers.isroot == '1') {
        Admin.find({})
            .select('name email _id password')
            .exec()
            .then(respond => {
                if (respond.length >= 1) {
                    res.status(200).json({
                        success: true,
                        count: respond.length,
                        admins: respond
                    })
                } else {
                    res.status(200).json({
                        success: true,
                        message: 'There\'s No Admin Right Now!'
                    })
                }
            })
            .catch(err => {
                res.status(500).json(helpers.errorJSON(err))
            })

    } else {
        res.status(500).json(helpers.errorJSON('Unauthorized Request'))
    }

})



router.get('/getAdmin/:id', (req, res, next) => {

    Admin.findById(req.params.id)
        .select('_id name email password')
        .exec()
        .then(respond => {
            if (respond) {
                res.status(200).json({
                    success: true,
                    admin: respond
                });
            } else {
                res.status(500).json(helpers.errorJSON('Admin Not Found!'));

            }
        })
        .catch(err => {
            res.status(500).json(helpers.errorJSON(err))
        })
});



router.patch('/updateAdmin/:id', (req, res, next) => {
    const id = req.params.id;
    const updatedData = {};
    for (let key in req.body) {
        if (req.body[key] !== '') {
            if (key !== 'password') {
                updatedData[key] = req.body[key];
            }
        }
    }
    if (req.body['password']) {
        bcrypt.hash(req.body['password'], 10, (err, hash) => {
            if (err) {
                res.status(500).json(helpers.errorJSON('Something Went Wrong!'));
            }
            updatedData['password'] = hash;
            Admin.update({ _id: id }, { $set: updatedData })
                .exec()
                .then(respond => {
                    if (respond) {
                        res.status(200).json({
                            success: true,
                            message: 'Your Profile Updated Successfully!'
                        })
                    } else {
                        res.status(500).json(helpers.errorJSON('Somthing Wen Wrong!'))
                    }
                })
                .catch(err => {
                    res.status(500).json(helpers.errorJSON(err))
                })


        });
    } else {
        Admin.update({ _id: id }, { $set: updatedData })
            .exec()
            .then(respond => {
                if (respond) {
                    res.status(200).json({
                        success: true,
                        message: 'Your Profile Updated Successfully!'
                    })
                } else {
                    res.status(500).json(helpers.errorJSON('Somthing Wen Wrong!'))
                }
            })
            .catch(err => {
                res.status(500).json(helpers.errorJSON(err))
            })
    }


});

router.delete('/deleteAdmin/:id', (req, res, next) => {
    Admin.remove({ _id: req.params.id })
        .exec()
        .then(respond => {
            if (respond) {
                res.status(200).json({
                    success: true,
                    message: 'Admin Deleted Successfully!'
                })
            } else {
                res.status(500).json(helpers.errorJSON('Somthing Went Wrong!'));

            }
        })
        .catch(err => {
            res.status(500).json(helpers.errorJSON(err));
        })
});



router.get('/help/:admin', (req, res, next) => {
    const admin = req.params.admin;
    if (admin === 'ns') {
        res.status(200).json({
            status: 200,
            apis: [{
                method: 'GET',
                url: "http://localhost:3000/api/admin/getAllAdmins",
                response: "JSON: { _id(mongoose.id) , count(number of users) , success: true, admins: Array }",
                info: "GET All Admins"
            }, {
                method: 'GET',
                url: "http://localhost:3000/api/admin/getAdmin/:id",
                response: "JSON: { _id(mongoose.id) , admin: admin , success: true }",
                info: "GET Admin By ID"
            }, {
                method: 'POST',
                url: "http://localhost:3000/api/admin/login",
                body: "JSON: { email: Email, password: String }",
                response: "{ success: true , message: String  }",
                info: "Login Admin"

            }, {
                method: 'POST',
                url: "http://localhost:3000/api/admin/createAdmin",
                body: "JSON: { name: String, email: Email, password: String , isRoot: number[1 , 0] }",
                response: "{ success: true , message: String  }",
                info: "Create admin Account => For Root Admin Only"
            }, {
                method: 'DELETE',
                url: "http://localhost:3000/api/admin/deleteAdmin/:id",
                response: "JSON: { success: true , message: String }",
                info: "Delete admin => For Root Admin Only"
            }, {
                method: 'PATCH',
                url: "http://localhost:3000/api/admin/updateAdmin",
                body: "JSON: { email, password, name }",
                response: "JSON: { success: true , message: String }",
                info: "Delete All admins"
            }]
        })
    } else {
        res.status(500).json(helpers.errorJSON('Unauthorized'))
    }
})









module.exports = router;