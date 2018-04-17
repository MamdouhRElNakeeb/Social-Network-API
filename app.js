const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');
const config = require('./config');
const multer = require('multer');
const app = express();



/* *********************************************************************************** */
// MiddleWares
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());
app.use(cors());
app.use('/uploads', express.static('uploads'))


/* *********************************************************************************** */
/* 
 # Routes 
*/
// Import Routes
const coiffeur = require('./api/routes/coiffeur');
const bride = require('./api/routes/bride');
const review = require('./api/routes/review');
const admin = require('./api/routes/admin');
const gallery = require('./api/routes/gallery');
// Use Routes
app.use('/api/coiffeur', coiffeur);
app.use('/api/bride', bride);
app.use('/api/review', review);
app.use('/api/admin', admin);
app.use('/api/gallery', gallery);






// Handel Unknow Resources

app.use((req, res, next) => {
    const error = new Error('Not Found');
    error.status = 404;
    next(error);

})

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });

})






/* *********************************************************************************** */
// Database Connections -> MongoDB
mongoose.connect(config.database);

mongoose.connection.on('connected', () => {
    console.log('Database Connected Successfully');
});


/* *********************************************************************************** */
// Listenning in Port
app.listen(config.port, () => {
    console.log(`App is Running On localhost:${config.port}`);
})

