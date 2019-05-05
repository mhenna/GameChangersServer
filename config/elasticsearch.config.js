import config from './config';
import logger from './winston';

const elasticsearch = require('elasticsearch');
const User = require('../Business/Managers/User/Models/user');

const esIndex = config.esIndex;
const userType = 'user';
const esClient = new elasticsearch.Client({
  host: config.esHost,
  log: 'error'
});


async function createIndex() {
  return new Promise((resolve) => {
    esClient.indices.create({
      index: esIndex
    }, (err, resp, status) => {
      if (err) {
        logger.info(`already created ${esIndex} index`);
      } else {
        logger.info('create', resp);
      }
      resolve();
    });
  });
}
async function deleteIndex() {
  return new Promise((resolve) => {
    esClient.indices.delete({
      index: esIndex
    }, (err, res) => {
      if (err) {
        logger.error(err.message);
      } else {
        logger.info(`deleted ${esIndex} index`);
      }
      resolve();
    });
  });
}

function bulkIndex(type, data) {
  const bulkBody = [];
  data.forEach((item) => {
    bulkBody.push({
      index: {
        _index: esIndex,
        _type: type,
        _id: item._id
      }
    });
    delete item._id;
    bulkBody.push(item);
  });
  logger.info(`Added ${userType} model instances to ${esIndex} index`);
  esClient.bulk({ body: bulkBody })
    .then((response) => {
      let errorCount = 0;
      response.items.forEach((item) => {
        if (item.index && item.index.error) {
          // errorCount++;
          logger.error(++errorCount, item.index.error);
        }
      });
      logger.info(`Successfully indexed ${data.length - errorCount} out of ${data.length} items`);
    })
    .catch(console.err);
}
async function addUserMapping() {
  logger.info('Adding mapping');
  return new Promise((resolve) => {
    esClient.indices.putMapping({
      index: esIndex,
      type: userType,
      body: {
        properties: {
          email: {
            type: 'keyword',
            index: 'true'
          },
          teamMember: {
            type: 'keyword',
            index: 'true'
          },
          isAdmin: {
            type: 'keyword',
            index: 'true'
          },
          isJudge: {
            type: 'keyword',
            index: 'true'
          },
        }
      }
    }, (err, resp, status) => {
      if (err) {
        logger.error(err);
      } else {
        logger.info(resp);
      }
      resolve();
    });
  });
}

async function addUsers() {
  return new Promise((resolve, reject) => {
    User.find({}, { __v: false }).lean().exec((err, users) => {
      logger.info(`${users}UUUUUUUUUUUU`);
      if (err) {
        console.log(err, 'ESESESES');
        logger.error(err);
        reject();
      }
      if (users.length==0) {
        console.log(users, 'ESUSERS');
        logger.error('No users found');
      } else {
        console.log(users, 'USEEERRRSSSSS');
        bulkIndex(userType, users);
      }
      resolve();
    });
  });
}
async function intializeES() {
  logger.info('INITALIZING ELASTICSEARCH');
  await deleteIndex();
  await createIndex();
  await addUserMapping();
  await addUsers();
}
module.exports = {
  intializeES,
  esClient,
  userType
};
