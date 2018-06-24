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
        params: {
            name: Joi.string().required(), 
        }
    },
    createChallenge: {
        body: {
        name: Joi.string().required(),
        }
    },
    updateChallenge: {
        body: {
        name: Joi.string().required(),
        },
        params: {
            name: Joi.string().required(),
        }
    },
    removeChallenge: {
        params: {
            name: Joi.string().required(), 
        }
    },
};
  