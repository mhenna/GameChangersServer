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
  }
};
