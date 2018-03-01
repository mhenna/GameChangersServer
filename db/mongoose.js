import mongoose from 'mongoose';
import logger from '../config/winston';

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/gameChangers', {})
    .then(logger.info('Connected to mongo'));

module.exports = {
    mongoose
};