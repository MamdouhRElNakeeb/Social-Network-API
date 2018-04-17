// IMPORT MODULES
const fs = require('fs');

function errorJSON(error) {
    const err = {
        success: false,
        error: error
    }

    return err;
}


function deleteFile(path) {
    if (path instanceof Array) {
        for (let i = 0; i < path.length; i++) {
            fs.unlink('./' + path[i], (err) => {
                if (err) {
                    throw err;
                }
            })
        }
    } else {
        fs.unlink('./' + path, (err) => {
            if (err) {
                throw err
            }
        });
    }
}


function deleteByDeleteModule(files) {
    del(files, function (err, deleted) {
        if (err) throw err;
    });
}



module.exports = {
    errorJSON,
    deleteFile,
    deleteByDeleteModule
}