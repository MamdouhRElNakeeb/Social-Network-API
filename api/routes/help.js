const express = require('express');
const router = express.Router();

router.get('/:admin', (req, res, next) => {
    const admin = req.params.admin;
    if (admin === 'ns') {
        res.status(200).json({
            allResources: [
                '/api/user'
            ]
        })

    } else {
        res.status(422).json({
            message: 'Unauthorized REQUEST'
        })
    }
})

module.exports = router;