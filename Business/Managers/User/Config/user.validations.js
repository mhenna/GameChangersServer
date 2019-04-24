import Joi from 'joi';

export const _login = {
  body: {
    email: Joi.string().required(),
    password: Joi.string().required()
  }
};

export const _register = {
  body: {
    name: Joi.string().min(1).required(),
    email: [Joi.string().required()],
    password: Joi.string().min(1).required(),
    passConf: Joi.string().min(1).required(),
    // region: Joi.string().min(1).required(),
    // isRemote: Joi.boolean().required(),
    // location: Joi.string().min(1).required(),
    // otherLocation: Joi.string().when('location', {is: 'Other', then: Joi.required(),
    // otherwise: Joi.string().optional()}),
    // careerLevel: Joi.string().min(1).required(),
    // isRemote: Joi.boolean().required(),
    // genNextMember: Joi.boolean().required(),
    // previousParticipation: Joi.boolean().required(),
  }
};

export const _resetPassword = {
  body: {
    newPassword: Joi.string().required(),
    verifyPassword: Joi.string().required(),
    token: Joi.string().required()
  }
};

export const _forgotPassword = {
  body: {
    email: Joi.string().required()
  }
};
