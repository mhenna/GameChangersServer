import Joi from 'joi';

// require and configure dotenv, will load vars in .env in PROCESS.ENV
require('dotenv').config();

// define validation for all the env vars
const envVarsSchema = Joi.object({

  NODE_ENV: Joi.string()
    .allow(['development', 'production', 'test', 'provision'])
    .default('development'),

  PORT: Joi.number()
    .default(4040),

  JWT_SECRET: Joi.string().required()
    .description('JWT Secret required to sign'),

  DB_HOST: Joi.string().required()
    .description('DB host url'),

  DB_NAME: Joi.string().required()
    .description('DB name'),

  REDISHOST: Joi.string().required()
    .description('Redis host'),

  ELASTICSEARCH_HOST: Joi.string().required()
    .description('Elastic search host'),

  ELASTICSEARCH_INDEX: Joi.string().required()
    .description('Elastic search index'),

  FRONTEND_URL: Joi.string().required()
    .description('front-end url')

}).unknown()
  .required();

const { error, value: envVars } = Joi.validate(process.env, envVarsSchema);
if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}
const config = {
  env: envVars.NODE_ENV,
  jwtSecret: envVars.JWT_SECRET,
  port: envVars.PORT,
  frontEndUrl: envVars.FRONTEND_URL,
  dbHost: envVars.DB_HOST,
  dbName: envVars.DB_NAME,
  redisHost: envVars.REDISHOST,
  esHost: envVars.ELASTICSEARCH_HOST,
  esIndex: envVars.ELASTICSEARCH_INDEX
};

export default config;
