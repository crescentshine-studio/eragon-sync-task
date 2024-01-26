const { ValidationErrorItem, UniqueConstraintError, ValidationError, TimeoutError, ConnectionError, ConnectionTimedOutError, DatabaseError } = require('sequelize');
const axios = require("axios");
module.exports.processError = async (msg = 'hh', error) => {
    console.error(msg, error);
    let errContent = {};
    if (error.errors) {
        if (error.errors[0] instanceof ValidationErrorItem) {
            errContent = {
                message: error.errors[0].message,
                data: error.errors[0]
            }
        }
        if (error.errors[0] instanceof ValidationError) {
            errContent = {
                message: error.errors[0].message,
                data: error.errors[0]
            }
        }
        if (error.errors[0] instanceof TimeoutError) {
            errContent = {
                message: error.errors[0].message,
                data: error.errors[0]
            }
        }
        if (error.errors[0] instanceof ConnectionError) {
            errContent = {
                message: error.errors[0].message,
                data: error.errors[0]
            }
        }
        if (error.errors[0] instanceof ConnectionTimedOutError) {
            errContent = {
                message: error.errors[0].message,
                data: error.errors[0]
            }
        }
        if (error.errors[0] instanceof UniqueConstraintError) {
            errContent = {
                message: error.errors[0].message,
                data: error.errors[0]
            }
        }
        if (error.errors[0] instanceof DatabaseError) {
            errContent = {
                message: error.errors[0].message,
                data: error.errors[0]
            }
        }
    }
    //console.log("Error content:", errContent);
    await this.storeError(errContent.message, errContent.data);
    return errContent;
}
module.exports.storeError = async (message, error) => {
    console.log("store log to centralize.");
}