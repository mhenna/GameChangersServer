const Joi = require('joi');

module.exports =  {
    // POST /users/login
  login: {
    body: {
      email: Joi.string().required(),
      password: Joi.string().required()
    }
  }
}
