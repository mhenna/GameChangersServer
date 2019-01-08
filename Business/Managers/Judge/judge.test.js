const request = require('supertest');
// const crypto = require('crypto');
const mongoose = require('mongoose');
const faker = require('faker');
// const PDFDocument = require('pdfkit');
const gridfs = require('gridfs-stream');
// const fs = require('fs');
// const MongoClient = require('mongodb').MongoClient;
// const mongo = require('mongodb');
const app = require('../../../index');

const Team = require('../Team/Models/team');
const Idea = require('../Idea/Models/idea');
const User = require('../User/Models/user');
const IdeaJudgment = require('../Judge/Models/ideajudgments');

gridfs.mongo = mongoose.mongo;

describe('Judge Module', () => {
  const password = faker.internet.password();
  //   const user = '';

  let judgeToken = '';
  let adminToken = '';
  let userToken = '';

  // let judgeID = '';
  let ideaId = '';
  let judgeId = '';
  const ideaName = 'test idea';
  const judgeBody = {
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
  const adminBody = {
    name: 'test admin',
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
  //   const userBody = {
  //     name: faker.name.findName(),
  //     email: faker.internet.email(),
  //     password,
  //     passConf: password,
  //     region: faker.address.county(),
  //     remote: true,
  //     location: faker.address.county(),
  //     func: faker.lorem.sentence(1),
  //     age: 20,
  //     previousParticipation: true,
  //     position: 'MANAGER',
  //     isJudge: false
  //   };
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
    teamMember: faker.lorem.word()
  };
  const testIdea = {
    teamName: userBody.teamMember,
    title: ideaName,
    filename: 'new test',

    oldFilename: 'old test',

    category: 'test cat'
  };

  beforeAll(async (done) => {
    jest.setTimeout(1000000);
    await User.remove({});
    await Team.remove({});
    await Idea.remove({});
    await IdeaJudgment.remove({});


    const admin = new User(adminBody);
    await admin.save();
    const ideaTest = new Idea(testIdea);
    await ideaTest.save();
    ideaId = ideaTest._id;
    const user = new User(userBody);
    await user.save();
    const judge = new User(judgeBody);
    await judge.save();
    judgeId = judge._id;
    // const judgment = {
    //   judgeId: judgeID,
    //   judgeName: judge.name,
    //   judgeEmail: judge.email,
    //   score: -1
    // };

    await request(app)
      .post('/users/login')
      .send({ email: judgeBody.email, password })
      .expect(200)
      .then((res) => {
        judgeToken = res.body.data.token;


        request(app)
          .post('/users/login')
          .send({ email: adminBody.email, password })
          .expect(200)
          .then((userRes) => {
            adminToken = userRes.body.data.token;
          });
        done();
      });
  });
  beforeEach(() => {
    jest.setTimeout(100000);
  });


  test('should sign in', () => request(app)
    .post('/users/login')
    .send({ email: userBody.email, password })
    .expect(200)
    .then((res) => {
      userToken = res.body.data.token;
    }));

  test('shoudn\'t be able to assign idea as user is not admin', async (done) => {
    const response = await request(app)
      .post('/judge/assign-judge')
      .set({ Authorization: `Bearer ${userToken}`, Accept: 'application/json' })
      .send({
        judgeId, ideaId
      });
    expect(response.statusCode).toBe(401);
    done();
  });
  test('should assign idea', async (done) => {
    const response = await request(app)
      .post('/judge/assign-judge')
      .set({ Authorization: `Bearer ${adminToken}`, Accept: 'application/json' })
      .send({
        judgeId, ideaId
      });
    expect(response.statusCode).toBe(200);
    done();
  });
  test('shouldn\'t be able to assign idea because of wrong idea id', async (done) => {
    const response = await request(app)
      .post('/judge/assign-judge')
      .set({ Authorization: `Bearer ${adminToken}`, Accept: 'application/json' })
      .send({
        judgeId, ideaId: judgeId
      });
    expect(response.statusCode).toBe(404);
    done();
  });
  test('shouldn\'t be able to assign idea because of wrong judge id', async (done) => {
    const response = await request(app)
      .post('/judge/assign-judge')
      .set({ Authorization: `Bearer ${adminToken}`, Accept: 'application/json' })
      .send({
        judgeId: ideaId, ideaId
      });
    expect(response.statusCode).toBe(404);
    done();
  });
  test('shouldn\'t be able to assign judge to idea as it was already signed before', async (done) => {
    const response = await request(app)
      .post('/judge/assign-judge')
      .set({ Authorization: `Bearer ${adminToken}`, Accept: 'application/json' })
      .send({
        judgeId, ideaId
      });
    expect(response.statusCode).toBe(400);
    done();
  });
  test('should be able to add question', async (done) => {
    const response = await request(app)
      .post('/admin/edit-questions')
      .set({ Authorization: `Bearer ${adminToken}`, Accept: 'application/json' })
      .send({
        questions: [{
          category: testIdea.category,
          question: 'quest 1',
          rate: 5
        }, {
          category: testIdea.category,
          question: 'quest 2',
          rate: 5
        }]
      });
    expect(response.statusCode).toBe(200);
    done();
  });
  test('should retrieve all ideas', async (done) => {
    const response = await request(app)
      .get('/judge/ideas')
      .set({ Authorization: `Bearer ${judgeToken}`, Accept: 'application/json' });
    expect(response.statusCode).toBe(200);
    done();
  });

  test('should submit judgement', async (done) => {
    const response = await request(app)
      .post('/judge/submit')
      .set({ Authorization: `Bearer ${judgeToken}`, Accept: 'application/json' })
      .send({
        teamName: userBody.teamMember,
        ideaId,
        questions: [{
          category: testIdea.category,
          question: 'quest 2',
          rate: 5,
          currentScore: 3,
          comment: 'good'
        }, {
          category: testIdea.category,
          question: 'quest 2',
          rate: 5,
          currentScore: 3,
          comment: 'good'
        }]
      });
    expect(response.statusCode).toBe(200);
    done();
  });


  
  test('should retrieve idea', async (done) => {
    const response = await request(app)
      .get(`/judge/ideas/${userBody.teamMember}`)
      .set({ Authorization: `Bearer ${judgeToken}`, Accept: 'application/json' });
    expect(response.statusCode).toBe(200);
    done();
  });
  test('shouldn\'t retrieve idea as user is not a judge', async (done) => {
    const response = await request(app)
      .get(`/judge/ideas/${userBody.teamMember}`)
      .set({ Authorization: `Bearer ${userToken}`, Accept: 'application/json' });
    expect(response.statusCode).toBe(401);
    done();
  });
  test('shouldn\'t retrieve idea as the team name is not right', async (done) => {
    const response = await request(app)
      .get('/judge/ideas/xyz')
      .set({ Authorization: `Bearer ${judgeToken}`, Accept: 'application/json' });
    expect(response.statusCode).toBe(404);
    done();
  });
  test('should retrieve questions', async (done) => {
    const response = await request(app)
      .get('/judge/get-questions')
      .set({ Authorization: `Bearer ${judgeToken}`, Accept: 'application/json' });
    expect(response.statusCode).toBe(200);
    done();
  });
});
