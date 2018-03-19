import mongoose from 'mongoose';
import logger from '../config/winston';

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://10.207.80.73/gameChangers', {})
    .then((success) => logger.info('Connected to mongo'))
    .catch((error) => logger.error(error))

module.exports = {
    mongoose
};