const Joi = require('joi');

module.exports = {
    // POST /users/login
  login: {
    body: {
      email: Joi.string().required(),
      password: Joi.string().required()
    }
  },
  register: {
    body: {
      name: Joi.string().min(1).required(),
      email: [Joi.string().required(), Joi.string().regex(/^[a-zA-Z0-9_.+-]+@(?:(?:[a-zA-Z0-9-]+\.)?[a-zA-Z]+\.)?(dell|emc|virtustream|rsa|pivotal|secureworks)\.com$/)],
      password: Joi.string().min(1).required(),
      passConf: Joi.string().min(1).required(),
      region: Joi.string().min(1).required(),
      isRemote: Joi.boolean().required(),
      location: Joi.string().min(1).required(),
      // otherLocation: Joi.string().when('location', {is: 'Other', then: Joi.required(), otherwise: Joi.string().optional()}),
      careerLevel: Joi.string().min(1).required(),
      isRemote: Joi.boolean().required(),
      genNextMember: Joi.boolean().required(),
      previousParticipation: Joi.boolean().required(),
      ideasOrder: Joi.array().required()
    }
  }
};