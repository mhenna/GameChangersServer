import config from '../config/config';

const elasticsearch = require('elasticsearch');

const esIndex = config.esIndex;
const userType = 'user';
const esClient = new elasticsearch.Client({
  host: config.esHost,
  log: 'error'
});

async function deleteFromIndex(type, id) {
  return new Promise((resolve, reject) => {
    esClient.delete({
      index: esIndex,
      type,
      id,
      refresh: true
    }, (err, resp, status) => {
      if (err) {
        console.log(err);
        reject();
      } else {
        console.log(resp);
        resolve();
      }
    });
  });
}
async function addToIndex(type, data) {
  console.log('Pushing to index..');
  return new Promise((resolve, reject) => {
    const id = data._id.toString();
    delete data._id;
    esClient.index({
      index: esIndex,
      type: userType,
      id,
      body: data,
      refresh: true
    }, (err, resp, status) => {
      if (err) {
        console.log(err);
        reject();
      } else {
        console.log(resp);
        resolve();
      }
    });
  });
}
module.exports = {
  esClient,
  userType,
  addToIndex,
  deleteFromIndex
};
