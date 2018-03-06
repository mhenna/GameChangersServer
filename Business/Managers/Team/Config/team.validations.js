const Joi  = require('joi');
const config = require('../../../../config/config')

let user = Joi.object().keys({
  email: Joi.string().regex(new RegExp(config.emailRegex)).required(),
  accepted: Joi.boolean().default(false)
});

module.exports = {
  // POST /teams/new
  new: {
    body: {
      teamName: Joi.string().required(),
      members: Joi.array().items(user).required()
    }
  },

  // POST /delete/member
  delete: {
    body: {
      email: Joi.string().regex(new RegExp(config.emailRegex)).required()
    }
  },
  
    // POST /add/member
    add: {
      body: {
        email: Joi.string().regex(new RegExp(config.emailRegex)).required()
      }
    }
};
