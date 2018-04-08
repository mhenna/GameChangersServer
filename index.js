import mongoose from 'mongoose';
import util from 'util';
import logger from './config/winston';

// config should be imported before importing any other file
import config from './config/config';
import app from './config/server';

const debug = require('debug')('gamechanger:index');

// make bluebird default Promise
Promise = require('bluebird'); // eslint-disable-line no-global-assign

if (!module.parent) {
  // listen on port config.port
  app.listen(config.port, () => {
    logger.info(`server started on port ${config.port} (${config.env})`); // eslint-disable-line no-console
  });
}

export default app;
