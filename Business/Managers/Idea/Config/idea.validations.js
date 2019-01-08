const Joi = require('joi');
const config = require('../../../../config/config');

module.exports = {

  download: {
    body: {
      file: Joi.string().required(),
    }
  }

};
