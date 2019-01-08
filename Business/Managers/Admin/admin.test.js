const request = require('supertest');
const crypto = require('crypto');
const mongoose = require('mongoose');
const faker = require('faker');
const PDFDocument = require('pdfkit');
const gridfs = require('gridfs-stream');
const fs = require('fs');
const MongoClient = require('mongodb').MongoClient;
const mongo = require('mongodb');
const app = require('../../../index');

const Deadline = require('./Models/deadline.model');
const MailSettings = require('./Models/mail.model');
const Team = require('../Team/Models/team');
const Idea = require('../Idea/Models/idea');
const User = require('../User/Models/user');
gridfs.mongo = mongoose.mongo;

describe('Admin Module', () => {
  const password = faker.internet.password();
  let user = '';
  let domain = faker.internet.domainName();
  let challenge = faker.lorem.word();
  let adminToken = '';
  let userToken = '';
  let judgeId = '';
  let adminId = '';
  let otherTeam = '';
  const adminBody = {
    name: faker.name.findName(),
    email: faker.internet.email(),
    password,
    passConf: password,
    region: faker.address.county(),
    remote: true,
    location: faker.address.county(),
    func: faker.lorem.sentence(1),
    age: 20,
    previousParticipation: true,
    position: 'MANAGER',
    isAdmin: true
  };
  const userBody = {
    name: faker.name.findName(),
    email: faker.internet.email(),
    password,
    passConf: password,
    region: faker.address.county(),
    remote: true,
    location: faker.address.county(),
    func: faker.lorem.sentence(1),
    age: 20,
    previousParticipation: true,
    position: 'MANAGER',
    isJudge: true
  };
  const teamMemberOneBody = {
    name: faker.name.findName(),
    email: faker.internet.email(),
    password,
    passConf: password,
    region: faker.address.county(),
    remote: true,
    location: faker.address.county(),
    func: faker.lorem.sentence(1),
    age: 20,
    previousParticipation: true,
    position: 'MANAGER',
    teamMember: faker.lorem.word()
  };

  beforeAll(async (done) => {
    jest.setTimeout(100000);
    await User.remove({});
    await Team.remove({});
    await Idea.remove({});
    const admin = new User(adminBody);
    await admin.save();
    adminId = admin._id;
    user = new User(userBody);
    await user.save();
    judgeId = user._id;
    request(app)
      .post('/users/login')
      .send({ email: adminBody.email, password })
      .expect(200)
      .then((res) => {
        adminToken = res.body.data.token;
        request(app)
          .post('/users/login')
          .send({ email: userBody.email, password })
          .expect(200)
          .then((userRes) => {
            userToken = userRes.body.data.token;
          });
        done();
      });
  });
  beforeEach(() => {
    jest.setTimeout(100000);
  });
  test('should retrieve all users', async (done) => {
    const response = await request(app)
      .get('/admin/users')
      .set({ Authorization: `Bearer ${adminToken}`, Accept: 'application/json' });
    expect(response.statusCode).toBe(200);
    done();
  });
  test('should not retrieve all users as user is not an admin', async (done) => {
    const response = await request(app)
      .get('/admin/users')
      .set({ Authorization: `Bearer ${userToken}`, Accept: 'application/json' });
    expect(response.statusCode).toBe(401);
    done();
  });
  test('should not retrieve all users as no token is provided', async (done) => {
    const response = await request(app)
      .get('/admin/users')
      .set({ Accept: 'application/json' });
    expect(response.statusCode).toBe(401);
    done();
  });
  test('should retrieve stats', async (done) => {
    const response = await request(app)
      .get('/admin/stats')
      .set({ Authorization: `Bearer ${adminToken}`, Accept: 'application/json' });
    expect(response.statusCode).toBe(200);
    done();
  });
  test('should retrieve all teams', async (done) => {
    const response = await request(app)
      .get('/admin/teams')
      .set({ Authorization: `Bearer ${adminToken}`, Accept: 'application/json' });
    expect(response.statusCode).toBe(200);
    done();
  });
  test('should retrieve all judges', async (done) => {
    const response = await request(app)
      .get('/admin/judges')
      .set({ Authorization: `Bearer ${adminToken}`, Accept: 'application/json' });
    expect(response.statusCode).toBe(200);
    done();
  });
  test('should retrieve judge', async (done) => {
    const response = await request(app)
      .get(`/admin/judges/${judgeId}`)
      .set({ Authorization: `Bearer ${adminToken}`, Accept: 'application/json' });
    expect(response.statusCode).toBe(200);
    done();
  });
  test('should not find a judge', async (done) => {
    let randomId = crypto.randomBytes(12).toString('hex');
    randomId = mongoose.Types.ObjectId(randomId);
    const response = await request(app)
      .get(`/admin/judges/${randomId}`)
      .set({ Authorization: `Bearer ${adminToken}`, Accept: 'application/json' });
    expect(response.statusCode).toBe(404);
    done();
  });
  test('should retrieve user', async (done) => {
    const response = await request(app)
      .get(`/admin/user/${userBody.email}`)
      .set({ Authorization: `Bearer ${adminToken}`, Accept: 'application/json' });
    expect(response.statusCode).toBe(200);
    done();
  });
  test('should not find a user', async (done) => {
    const response = await request(app)
      .get(`/admin/user/${faker.internet.email}`)
      .set({ Authorization: `Bearer ${adminToken}`, Accept: 'application/json' });
    expect(response.statusCode).toBe(404);
    done();
  });
  test('should create domain', async (done) => {
    const response = await request(app)
      .post('/admin/domains')
      .send({ name: domain })
      .set({ Authorization: `Bearer ${adminToken}`, Accept: 'application/json' });

    expect(response.statusCode).toBe(200);
    done();
  });
  test('should not create domain as no name is passed in body', async (done) => {
    const response = await request(app)
      .post('/admin/domains')
      .send({})
      .set({ Authorization: `Bearer ${adminToken}`, Accept: 'application/json' });
    expect(response.statusCode).toBe(400);
    done();
  });
  test('should not create domain as name should be unique', async (done) => {
    const response = await request(app)
      .post('/admin/domains')
      .send({ name: domain })
      .set({ Authorization: `Bearer ${adminToken}`, Accept: 'application/json' });
    expect(response.statusCode).toBe(400);
    done();
  });
  test('should get all domains', async (done) => {
    const response = await request(app)
      .get('/admin/domains')
      .set({ Authorization: `Bearer ${adminToken}`, Accept: 'application/json' });
    expect(response.statusCode).toBe(200);
    done();
  });
  test('should update domain', async (done) => {
    const response = await request(app)
      .put(`/admin/domains/${domain}`)
      .send({ name: 'newDomain' })
      .set({ Authorization: `Bearer ${adminToken}`, Accept: 'application/json' });
    expect(response.statusCode).toBe(200);
    expect(response.body.name).not.toBe(domain);
    domain = 'newDomain';
    done();
  });
  test('should not update domain as no name is passed in body', async (done) => {
    const response = await request(app)
      .put(`/admin/domains/${domain}`)
      .send({})
      .set({ Authorization: `Bearer ${adminToken}`, Accept: 'application/json' });
    expect(response.statusCode).toBe(400);
    done();
  });
  test('should not update domain as it is not found', async (done) => {
    const response = await request(app)
      .put(`/admin/domains/${faker.internet.domainName()}`)
      .send({ name: 'newDomain' })
      .set({ Authorization: `Bearer ${adminToken}`, Accept: 'application/json' });
    expect(response.statusCode).toBe(404);
    done();
  });
  test('should delete domain', async (done) => {
    const response = await request(app)
      .delete(`/admin/domains/${domain}`)
      .set({ Authorization: `Bearer ${adminToken}`, Accept: 'application/json' });
    expect(response.statusCode).toBe(204);
    done();
  });
  test('should not delete domain as it is not found', async (done) => {
    const response = await request(app)
      .delete(`/admin/domains/${domain}`)
      .set({ Authorization: `Bearer ${adminToken}`, Accept: 'application/json' });
    expect(response.statusCode).toBe(404);
    done();
  });
  test('should create challenge', async (done) => {
    const response = await request(app)
      .post('/admin/challenges')
      .send({ name: challenge })
      .set({ Authorization: `Bearer ${adminToken}`, Accept: 'application/json' });
    expect(response.statusCode).toBe(200);
    done();
  });
  test('should not create challenge as no name is passed in body', async (done) => {
    const response = await request(app)
      .post('/admin/challenges')
      .send({})
      .set({ Authorization: `Bearer ${adminToken}`, Accept: 'application/json' });
    expect(response.statusCode).toBe(400);
    done();
  });
  test('should update challenge', async (done) => {
    const newChallenge = faker.lorem.word();
    const response = await request(app)
      .put(`/admin/challenges/${challenge}`)
      .send({ name: newChallenge })
      .set({ Authorization: `Bearer ${adminToken}`, Accept: 'application/json' });
    expect(response.statusCode).toBe(200);
    challenge = newChallenge;
    done();
  });
  test('should not update challenge as no name is passed in body', async (done) => {
    const response = await request(app)
      .put(`/admin/challenges/${challenge}`)
      .send({})
      .set({ Authorization: `Bearer ${adminToken}`, Accept: 'application/json' });
    expect(response.statusCode).toBe(400);
    done();
  });
  test('should not update challenge as it is not found', async (done) => {
    const response = await request(app)
      .put('/admin/challenges/challenge')
      .send({ name: 'newChallenge' })
      .set({ Authorization: `Bearer ${adminToken}`, Accept: 'application/json' });
    expect(response.statusCode).toBe(404);
    done();
  });
  test('should delete challenge', async (done) => {
    const response = await request(app)
      .delete(`/admin/challenges/${challenge}`)
      .set({ Authorization: `Bearer ${adminToken}`, Accept: 'application/json' });
    expect(response.statusCode).toBe(204);
    done();
  });
  test('should not delete challenge as it is not found', async (done) => {
    const response = await request(app)
      .delete(`/admin/challenges/${challenge}`)
      .set({ Authorization: `Bearer ${adminToken}`, Accept: 'application/json' });
    expect(response.statusCode).toBe(404);
    done();
  });
  test('should get user', async (done) => {
    const response = await request(app)
      .get(`/admin/user/${userBody.email}`)
      .set({ Authorization: `Bearer ${adminToken}`, Accept: 'application/json' });
    expect(response.statusCode).toBe(200);
    done();
  });
  test('should not find user', async (done) => {
    const response = await request(app)
      .get(`/admin/user/${faker.internet.email()}`)
      .set({ Authorization: `Bearer ${adminToken}`, Accept: 'application/json' });
    expect(response.statusCode).toBe(404);
    done();
  });
  test('should not create deadline as body is empty', async (done) => {
    const response = await request(app)
      .post('/admin/deadlines')
      .send({})
      .set({ Authorization: `Bearer ${adminToken}`, Accept: 'application/json' });
    expect(response.statusCode).toBe(400);
    done();
  });
  test('should not create deadlines as time is in the past', async (done) => {
    const date = new Date();
    date.setDate(date.getDate() - 5);
    const response = await request(app)
      .post('/admin/deadlines')
      .send({
        registration: date,
        teams: date,
        judging: date,
        submission: date
      })
      .set({ Authorization: `Bearer ${adminToken}`, Accept: 'application/json' });
    expect(response.statusCode).toBe(400);
    done();
  });
  test('should create deadlines', async (done) => {
    const date = new Date();
    date.setDate(date.getDate() + 5);
    const response = await request(app)
      .post('/admin/deadlines')
      .send({
        registration: date,
        teams: date,
        judging: date,
        submission: date
      })
      .set({ Authorization: `Bearer ${adminToken}`, Accept: 'application/json' });
    expect(response.statusCode).toBe(200);
    done();
  });
  test('should get deadlines', async (done) => {
    const response = await request(app)
      .get('/admin/deadlines')
      .set({ Authorization: `Bearer ${adminToken}`, Accept: 'application/json' });
    expect(response.statusCode).toBe(200);
    done();
  });
  test('should not update deadlines as some fields are missing', async (done) => {
    const date = new Date();
    date.setDate(date.getDate() + 10);
    const response = await request(app)
      .put('/admin/deadlines')
      .send({
        registration: date
      })
      .set({ Authorization: `Bearer ${adminToken}`, Accept: 'application/json' });
    expect(response.statusCode).toBe(400);
    done();
  });
  test('should update deadlines', async (done) => {
    const date = new Date();
    date.setDate(date.getDate() + 10);
    const response = await request(app)
      .put('/admin/deadlines')
      .send({
        registration: date,
        teams: date,
        judging: date,
        submission: date
      })
      .set({ Authorization: `Bearer ${adminToken}`, Accept: 'application/json' });
    expect(response.statusCode).toBe(200);
    done();
  });
  test('should not update deadlines as no deadlines are set', async (done) => {
    await Deadline.remove({});
    const date = new Date();
    date.setDate(date.getDate() + 10);
    const response = await request(app)
      .put('/admin/deadlines')
      .send({
        registration: date,
        teams: date,
        judging: date,
        submission: date
      })
      .set({ Authorization: `Bearer ${adminToken}`, Accept: 'application/json' });
    expect(response.statusCode).toBe(404);
    done();
  });
  test('should get mail settings', async (done) => {
    const response = await request(app)
      .get('/admin/mail')
      .set({ Authorization: `Bearer ${adminToken}`, Accept: 'application/json' });
    expect(response.statusCode).toBe(200);
    done();
  });
  test('should not update mail settings as body is empty', async (done) => {
    const response = await request(app)
      .put('/admin/mail')
      .send({})
      .set({ Authorization: `Bearer ${adminToken}`, Accept: 'application/json' });
    expect(response.statusCode).toBe(400);
    done();
  });
  test('should update mail settings', async (done) => {
    const mailSettings = new MailSettings({
      host: faker.internet.ip(),
      port: 500,
      username: faker.internet.userName(),
      password: faker.internet.password()
    });
    await mailSettings.save();
    const response = await request(app)
      .put('/admin/mail')
      .send({
        host: faker.internet.ip(),
        port: 500,
        username: faker.internet.userName(),
        password: faker.internet.password()
      })
      .set({ Authorization: `Bearer ${adminToken}`, Accept: 'application/json' });
    expect(response.statusCode).toBe(200);
    done();
  });
  it('should not update mail settings as no mail settings is found', async (done) => {
    await MailSettings.remove({});
    const response = await request(app)
      .put('/admin/mail')
      .send({
        host: faker.internet.ip(),
        port: 500,
        username: faker.internet.userName(),
        password: faker.internet.password()
      })
      .set({ Authorization: `Bearer ${adminToken}`, Accept: 'application/json' });
    expect(response.statusCode).toBe(404);
    done();
  });
  test('should not add user to team as team does not exist', async (done) => {
    const response = await request(app)
      .put(`/admin/addTeamMember/${faker.name.findName()}`)
      .send({ email: userBody.email })
      .set({ Authorization: `Bearer ${adminToken}`, Accept: 'application/json' });
    expect(response.statusCode).toBe(404);
    expect(response.body.errors[0].message).toBe('Team not found');
    done();
  });
  test('should not add user to team as user does not exist', async (done) => {
    const response = await request(app)
      .put(`/admin/addTeamMember/${faker.name.findName()}`)
      .send({ email: faker.internet.email() })
      .set({ Authorization: `Bearer ${adminToken}`, Accept: 'application/json' });
    expect(response.statusCode).toBe(404);
    expect(response.body.errors[0].message).toBe('User not found');
    done();
  });
  test('should add user to team', async (done) => {
    const teamMemberOne = new User(teamMemberOneBody);
    await teamMemberOne.save();
    const teamMemberTwoBody = {
      name: faker.name.findName(),
      email: faker.internet.email(),
      password,
      passConf: password,
      region: faker.address.county(),
      remote: true,
      location: faker.address.county(),
      func: faker.lorem.sentence(1),
      age: 20,
      previousParticipation: true,
      position: 'MANAGER',
      teamMember: teamMemberOneBody.teamMember
    };
    const teamMemberTwo = new User(teamMemberTwoBody);
    await teamMemberTwo.save();
    const team = new Team({
      name: teamMemberOne.teamMember,
      challenge: 'Big data',
      creator: adminId,
      members: [
        { email: teamMemberOne.email, accepted: true },
        { email: teamMemberTwo.email, accepted: true }
      ]
    });
    await team.save();
    const response = await request(app)
      .put(`/admin/addTeamMember/${teamMemberOne.teamMember}`)
      .send({ email: userBody.email })
      .set({ Authorization: `Bearer ${adminToken}`, Accept: 'application/json' });
    expect(response.statusCode).toBe(200);
    const updatedTeam = await Team.findOne({ name: team.name });
    expect(updatedTeam.members.length).toBe(3);
    done();
  });
  test('should not add user to team as user is already in a team', async (done) => {
    const response = await request(app)
      .put(`/admin/addTeamMember/${teamMemberOneBody.teamMember}`)
      .send({ email: userBody.email })
      .set({ Authorization: `Bearer ${adminToken}`, Accept: 'application/json' });
    expect(response.statusCode).toBe(409);
    expect(response.body.errors[0].message).toBe('User already in a team');
    done();
  });
  test('should not add user to team as there is five team members', async (done) => {
    otherTeam = faker.name.findName();
    const memberOneBody = {
      name: faker.name.findName(),
      email: faker.internet.email(),
      password,
      passConf: password,
      region: faker.address.county(),
      remote: true,
      location: faker.address.county(),
      func: faker.lorem.sentence(1),
      age: 20,
      previousParticipation: true,
      position: 'MANAGER',
      teamMember: otherTeam
    };
    const memberOne = new User(memberOneBody);
    await memberOne.save();
    const memberTwoBody = {
      name: faker.name.findName(),
      email: faker.internet.email(),
      password,
      passConf: password,
      region: faker.address.county(),
      remote: true,
      location: faker.address.county(),
      func: faker.lorem.sentence(1),
      age: 20,
      previousParticipation: true,
      position: 'MANAGER',
      teamMember: otherTeam
    };
    const memberTwo = new User(memberTwoBody);
    await memberTwo.save();
    const memberThreeBody = {
      name: faker.name.findName(),
      email: faker.internet.email(),
      password,
      passConf: password,
      region: faker.address.county(),
      remote: true,
      location: faker.address.county(),
      func: faker.lorem.sentence(1),
      age: 20,
      previousParticipation: true,
      position: 'MANAGER',
      teamMember: otherTeam
    };
    const memberThree = new User(memberThreeBody);
    await memberThree.save();
    const memberFourBody = {
      name: faker.name.findName(),
      email: faker.internet.email(),
      password,
      passConf: password,
      region: faker.address.county(),
      remote: true,
      location: faker.address.county(),
      func: faker.lorem.sentence(1),
      age: 20,
      previousParticipation: true,
      position: 'MANAGER',
      teamMember: otherTeam
    };
    const memberFour = new User(memberFourBody);
    await memberFour.save();
    const memberFiveBody = {
      name: faker.name.findName(),
      email: faker.internet.email(),
      password,
      passConf: password,
      region: faker.address.county(),
      remote: true,
      location: faker.address.county(),
      func: faker.lorem.sentence(1),
      age: 20,
      previousParticipation: true,
      position: 'MANAGER',
      teamMember: otherTeam
    };
    const memberFive = new User(memberFiveBody);
    await memberFive.save();
    const team = new Team({
      name: otherTeam,
      creator: memberOne._id,
      challenge: 'Big Data',
      members: [
        { email: memberOne.email, accepted: true },
        { email: memberTwo.email, accepted: true },
        { email: memberThree.email, accepted: true },
        { email: memberFour.email, accepted: true },
        { email: memberFive.email, accepted: true },
      ]
    });
    await team.save();
    const memberSixBody = {
      name: faker.name.findName(),
      email: faker.internet.email(),
      password,
      passConf: password,
      region: faker.address.county(),
      remote: true,
      location: faker.address.county(),
      func: faker.lorem.sentence(1),
      age: 20,
      previousParticipation: true,
      position: 'MANAGER'
    };
    const memberSix = new User(memberSixBody);
    await memberSix.save();
    const response = await request(app)
      .put(`/admin/addTeamMember/${otherTeam}`)
      .send({ email: memberSix.email })
      .set({ Authorization: `Bearer ${adminToken}`, Accept: 'application/json' });
    expect(response.statusCode).toBe(400);
    expect(response.body.errors[0].message).toBe('max 5 team members allowed');
    done();
  });
  test('should not add user to team as body is empty', async (done) => {
    const response = await request(app)
      .put(`/admin/addTeamMember/${teamMemberOneBody.teamMember}`)
      .send({})
      .set({ Authorization: `Bearer ${adminToken}`, Accept: 'application/json' });
    expect(response.statusCode).toBe(400);
    /* eslint-disable no-useless-escape */
    expect(response.body.errors[0].messages[0]).toBe('\"email\" is required');
    done();
  });
  test('should not add user to team as user does not exist', async (done) => {
    const response = await request(app)
      .put(`/admin/addTeamMember/${teamMemberOneBody.teamMember}`)
      .send({ email: faker.internet.email() })
      .set({ Authorization: `Bearer ${adminToken}`, Accept: 'application/json' });
    expect(response.statusCode).toBe(404);
    expect(response.body.errors[0].message).toBe('User not found');
    done();
  });
  test('should not delete user from team as body is empty', async (done) => {
    const response = await request(app)
      .put(`/admin/deleteTeamMember/${teamMemberOneBody.teamMember}`)
      .send({})
      .set({ Authorization: `Bearer ${adminToken}`, Accept: 'application/json' });
    expect(response.statusCode).toBe(400);
    /* eslint-disable no-useless-escape */
    expect(response.body.errors[0].messages[0]).toBe('\"email\" is required');
    done();
  });
  test('should not delete user from team as user does not exist in the team', async (done) => {
    const response = await request(app)
      .put(`/admin/deleteTeamMember/${teamMemberOneBody.teamMember}`)
      .send({ email: faker.internet.email() })
      .set({ Authorization: `Bearer ${adminToken}`, Accept: 'application/json' });
    expect(response.statusCode).toBe(404);
    expect(response.body.errors[0].message).toBe('User not found in team');
    done();
  });
  test('should not delete user from team as team does not exist', async (done) => {
    const response = await request(app)
      .put(`/admin/deleteTeamMember/${faker.name.findName()}`)
      .send({ email: userBody.email })
      .set({ Authorization: `Bearer ${adminToken}`, Accept: 'application/json' });
    expect(response.statusCode).toBe(404);
    expect(response.body.errors[0].message).toBe('Team not found');
    done();
  });
  test('should delete user from team', async (done) => {
    const response = await request(app)
      .put(`/admin/deleteTeamMember/${teamMemberOneBody.teamMember}`)
      .send({ email: userBody.email })
      .set({ Authorization: `Bearer ${adminToken}`, Accept: 'application/json' });
    expect(response.statusCode).toBe(200);
    done();
  });
  test('should not be able to check if user is judge as user does not exist', async (done) => {
    const response = await request(app)
      .get(`/admin/users/${faker.internet.email()}/isJudge`)
      .set({ Authorization: `Bearer ${adminToken}`, Accept: 'application/json' });
    expect(response.statusCode).toBe(404);
    done();
  });
  test('should be able to check if user is judge', async (done) => {
    const response = await request(app)
      .get(`/admin/users/${userBody.email}/isJudge`)
      .set({ Authorization: `Bearer ${adminToken}`, Accept: 'application/json' });
    expect(response.statusCode).toBe(200);
    done();
  });
  test('should be able to make existing user a judge', async (done) => {
    const tempUserBody = {
      name: faker.name.findName(),
      email: `${faker.lorem.lines(1)}@dell.com`,
      password,
      passConf: password,
      region: faker.address.county(),
      remote: true,
      location: faker.address.county(),
      func: faker.lorem.sentence(1),
      age: 20,
      previousParticipation: true,
      position: 'MANAGER',
      teamMember: otherTeam
    };
    const tempUser = new User(tempUserBody);
    await tempUser.save();
    const response = await request(app)
      .post('/admin/createNewJudge')
      .send({ email: tempUser.email })
      .set({ Authorization: `Bearer ${adminToken}`, Accept: 'application/json' });
    expect(response.statusCode).toBe(200);
    expect(response.body.data).toBe(tempUser._id.toString());
    done();
  });
  test('should be able to make new user a judge', async (done) => {
    const response = await request(app)
      .post('/admin/createNewJudge')
      .send({ email: `${faker.lorem.lines(1)}@dell.com` })
      .set({ Authorization: `Bearer ${adminToken}`, Accept: 'application/json' });
    expect(response.statusCode).toBe(200);
    done();
  });
  test('should not be able to make new user a judge as no email is sent', async (done) => {
    const response = await request(app)
      .post('/admin/createNewJudge')
      .send({})
      .set({ Authorization: `Bearer ${adminToken}`, Accept: 'application/json' });
    expect(response.statusCode).toBe(400);
    /* eslint-disable no-useless-escape */
    expect(response.body.errors[0].messages[0]).toBe('\"email\" is required');
    done();
  });
  test('the idea should return correctly', async (done) => {
    const tempIdeaBody = {
      teamName: teamMemberOneBody.teamMember,
      title: faker.name.findName(),
      challenge: faker.name.findName(),
      filename: faker.name.findName(),
      category: faker.internet.domainSuffix()
    };
    const tempIdea = new Idea(tempIdeaBody);
    await tempIdea.save();
    const response = await request(app)
      .get(`/admin/user/viewIdea/${teamMemberOneBody.email.toLocaleLowerCase()}`)
      .set({ Authorization: `Bearer ${adminToken}`, Accept: 'application/json' });
    expect(response.statusCode).toBe(200);
    done();
  });
  test('should be able to return the top ideas', async (done) => {
    const response = await request(app)
      .get('/admin/topideas')
      .set({ Authorization: `Bearer ${adminToken}`, Accept: 'application/json' });
    expect(response.statusCode).toBe(200);
    done();
  });
  test('should be able to return the top ideas in correct orders', async (done) => {
    const TeamName = faker.name.findName();
    const challengeTemp = faker.lorem.word();
    const tempIdeaBody1 = {
      judgments: [{ score: 20 }],
      teamName: TeamName,
      title: faker.name.findName(),
      challenge: challengeTemp,
      filename: faker.name.findName(),
      category: faker.internet.domainSuffix()
    };
    const tempIdeaBody2 = {
      judgments: [{ score: 15 }],
      teamName: TeamName,
      title: faker.name.findName(),
      challenge: challengeTemp,
      filename: faker.name.findName(),
      category: faker.internet.domainSuffix()
    };
    const teamObj = {
      name: TeamName,
      creator: new mongoose.mongo.ObjectId(user._id),
      challenge: challengeTemp,
      members: [
        {
          email: user.email,
          accepted: false
        }
      ]
    };
    const team = new Team(teamObj);
    await team.save();
    const tempIdea1 = new Idea(tempIdeaBody1);
    await tempIdea1.save();
    const tempIdea2 = new Idea(tempIdeaBody2);
    await tempIdea2.save();
    const response = await request(app)
      .get('/admin/topideas')
      .send({ email: teamMemberOneBody.email })
      .set({ Authorization: `Bearer ${adminToken}`, Accept: 'application/json' });
    expect(response.statusCode).toBe(200);
    done();
  });
  test('should return no idea found', async (done) => {
    const mail = `${faker.lorem.lines(1)}@dell.com`;
    const tempBody = {
      name: faker.name.findName(),
      email: mail,
      password,
      passConf: password,
      region: faker.address.county(),
      remote: true,
      location: faker.address.county(),
      func: faker.lorem.sentence(1),
      age: 20,
      previousParticipation: true,
      position: 'MANAGER',
    };
    const tempUser = new User(tempBody);
    await tempUser.save();
    const response = await request(app)
      .get(`/admin/user/viewIdea/${mail}`)
      .set({ Authorization: `Bearer ${adminToken}`, Accept: 'application/json' });
    expect(response.statusCode).toBe(404);
    expect(response.body.errors[0].message).toBe('no idea for this user');
    done();
  });
  test('should return no user found', async (done) => {
    const response = await request(app)
      .get(`/admin/user/viewIdea/${faker.name.findName()}`)
      .set({ Authorization: `Bearer ${adminToken}`, Accept: 'application/json' });
    expect(response.statusCode).toBe(404);
    expect(response.body.errors[0].message).toBe('User not found');
    done();
  });
  test('it should be able to download', async (done) => {
    const doc = new PDFDocument();
    const fileName = faker.name.findName();
    doc.pipe(fs.createWriteStream(`${fileName}.pdf`));
    MongoClient.connect('mongodb://10.207.80.73:27017', (err, client) => {
      const db = client.db('gameChangersStagingTest');
      const gfs = gridfs(db, mongo);
      const writeStream = gfs.createWriteStream({
        filename: `${fileName}.pdf`
      });
      fs.createReadStream(`${fileName}.pdf`).pipe(writeStream);
      setTimeout(() => {
        request(app)
          .post('/admin//user/viewIdea/download')
          .send({ file: `${fileName}.pdf` })
          .set({ Authorization: `Bearer ${adminToken}`, Accept: 'application/json' })
          .expect(200, done);
      }, 5000);
    });
  });
});
