import crypto from 'crypto';
import elasticsearch from '../../Services/elasticsearch';
import Domain from './Admin/Models/domain.model';

function send400(message, res) {
  res.status(400).json({
    statustext: 'Failed',
    errors: [{
      messages: [
        message
      ]
    }]
  });
}
function sendResponse(res, status, message, data = null, errors = null) {
  if (errors) {
    res.status(status).json({
      status,
      message,
      errors
    });
    return;
  }
  res.status(status).json({
    status,
    message,
    data
  });
}
function getEmailDomainsAsRegexHelper() {
  return new Promise(async (resolve, reject) => {
    try {
      const domains = await Domain.find({});
      let regex = '';
      domains.forEach((domain, index) => {
        regex += index === 0 ? `${domain.name}` : `|${domain.name}`;
        if (index === domains.length - 1) {
          resolve(regex);
        }
      });
    } catch (error) {
      reject(error);
    }
  });
}

async function getEmailDomainsAsRegex() {
  try {
    const regex = await getEmailDomainsAsRegexHelper();
    return regex;
  } catch (error) {
    return '';
  }
}

async function getRandomToken() {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(20, (err, buffer) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(buffer.toString('hex'));
    });
  });
}


function updateUserIndex(user) {
  elasticsearch.addToIndex(elasticsearch.userType, user.toObject())
    .then(() => {
    })
    .catch();
}
module.exports = {
  send400,
  sendResponse,
  getEmailDomainsAsRegex,
  getRandomToken,
  updateUserIndex
};
