import mongoose from 'mongoose';
import logger from '../config/winston';
import config from '../config/config';

mongoose.Promise = global.Promise;
if (process.env.ENVIRONMENT == 'testing') {
  mongoose.connect(`mongodb://${config.dbHost}/${config.dbName}Test`, {})
    .then(success => logger.info(`Connected to mongo database: ${config.dbName}Test`))
    .catch(error => logger.error(error));
} else {
  mongoose.connect(`mongodb://${config.dbHost}/${config.dbName}`, {})
    .then(success => logger.info(`Connected to mongo database: ${config.dbName}`))
    .catch(error => logger.error(error));
}


module.exports = {
  mongoose
};
