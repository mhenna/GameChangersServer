const Joi  = require('joi');
const config = require('../../../../config/config')

module.exports = {
    submit: {
        body: {
            // innovationComment: Joi.string().default(''),
            // problemSolvingComment: Joi.string().default(''),
            // financialImpactComment: Joi.string().default(''),
            // feasibilityComment: Joi.string().default(''),
            // qualityComment: Joi.string().default(''),
            ideaId: Joi.string().required(),
            score: Joi.number().required(),
            innovationScore: Joi.number().required(),
            problemSolvingScore: Joi.number().required(),
            financialImpactScore: Joi.number().required(),
            feasibilityScore: Joi.number().required(),
            qualityScore: Joi.number().required()
        }
      }
  };
  