const Joi = require('joi');
const config = require('../../../../config/config');

module.exports = {
  submit: {
    body: {
      teamName: Joi.string().required(),
      ideaId: Joi.string().required(),
      judgments: Joi.array().items(Joi.object({
        category: Joi.string().required(),
        question: Joi.string().required(),
        rate: Joi.number().required(),
        currentScore: Joi.number().required(),
        comment: Joi.string().required()

      }))
    }
  },
  assign: {
    body: {
      ideaId: Joi.string().required(),
      judgeId: Joi.string().required()
    }
  }
  ,
};
