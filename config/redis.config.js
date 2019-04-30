import redis from 'redis';
import { promisify } from 'util';
import config from './config';
import Mail from '../Business/Managers/Admin/Models/mail.model';
import Deadline from '../Business/Managers/Admin/Models/deadline.model';

const client = redis.createClient({
  host: config.redisHost,
});
client.on('connect', function() {
  console.log('Redis client connected');
});
client.on('error', function (err) {
  console.log('Something went wrong ' + err);
});

const getAsync = promisify(client.get).bind(client);

async function get(key) {
  return await getAsync(key);
}

function set(key, value) {
  if (value !== undefined) client.set(key, value);
}

async function setSiteStatistics(stats) {
  client.set('stats', JSON.stringify(stats), 'EX', 30);
}

function setMailConf(mail) {
  if (mail) {
    set('mailHost', mail.host);
    set('mailPort', mail.port);
    set('mailUsername', mail.username);
    set('mailPassword', mail.password);
  }
}

async function getDeadlines() {
  return {
    registration: await get('registration'),
    teams: await get('teams'),
    judging: await get('judging'),
    submission: await get('submission'),
  };
}

async function setDeadlines() {
  const deadlines = await Deadline.findOne({});
  if (deadlines) {
    set('registration', deadlines.registration);
    set('teams', deadlines.teams);
    set('judging', deadlines.judging);
    set('submission', deadlines.submission);
  }
}

async function populateWithConfig(mail) {
  if (!mail) {
    const mailDB = await Mail.findOne({});
    setMailConf(mailDB);
  } else {
    setMailConf(mail);
  }
}

module.exports = {
  get,
  set,
  populateWithConfig,
  getDeadlines,
  setDeadlines,
  setSiteStatistics
};
