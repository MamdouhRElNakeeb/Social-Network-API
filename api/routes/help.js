const express = require('express');
const router = express.Router();


router.get('/:admin', (req, res, next) => {
    const admin = req.params.admin;
    if (admin === 'nh') {
    
        res.status(200).json({
            allResources: [
                '/api/user'
            ]
        })

    }
    
})


module.exports = router;