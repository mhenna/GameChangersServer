const Joi  = require('joi');
const config = require('../../../../config/config')

module.exports = {  
    createDomain: {
        body: {
        name: Joi.string().required(),
        }
    },
    updateDomain: {
        body: {
        name: Joi.string().required(),
        },
        params: {
            name: Joi.string().required(),
        }
    },
    removeDomain: {
        body: {
        name: Joi.string().required(),
        },
        params: {
            name: Joi.string().required(), 
        }
    },
};
  