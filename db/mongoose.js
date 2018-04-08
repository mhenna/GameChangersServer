import mongoose from 'mongoose';
import logger from '../config/winston';
import config from '../config/config';

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://10.207.80.73/' + config.dbName, {})
    .then((success) => logger.info('Connected to mongo database: ' + config.dbName))
    .catch((error) => logger.error(error))

module.exports = {
    mongoose
};