import request from 'supertest';
import faker from 'faker';
import app from '../../../index';
import Domain from '../Admin/Models/domain.model';

const Team = require('../Team/Models/team');
const Idea = require('../Idea/Models/idea');
const User = require('../User/Models/user');

describe('User module', () => {
  const email = `${faker.internet.userName().toLowerCase()}@dell.com`;
  let password = faker.internet.password();
  let token = '';
  let resetPasswordToken = '';
  beforeAll(async (done) => {
    await User.remove({});
    await Team.remove({});
    await Idea.remove({});
    await Domain.findOneAndRemove({ name: 'dell' });
    const domain = new Domain({ name: 'dell' });
    await domain.save();
    done();
  });
  it('should sign up ', () => request(app)
    .post('/users/signup')
    .send({
      name: faker.name.findName(),
      email,
      password,
      passConf: password,
      region: faker.address.county(),
      remote: true,
      location: faker.address.county(),
      func: faker.lorem.sentence(1),
      age: 20,
      previousParticipation: true,
      position: 'MANAGER'
    })
    .expect(200));

  it('should fail sign up because of duplicate email', () => request(app)
    .post('/users/signup')
    .send({
      name: faker.name.findName(),
      email,
      password,
      passConf: password,
      region: faker.address.county(),
      remote: true,
      location: faker.address.county(),
      func: faker.lorem.sentence(1),
      age: 20,
      previousParticipation: true,
      position: 'MANAGER'
    })
    .expect(409));

  it('should fail sign up because of unsupported domain', () => request(app)
    .post('/users/signup')
    .send({
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
    })
    .expect(400));

  it('should fail sign up because of missing fields', () => request(app)
    .post('/users/signup')
    .send({
      name: faker.name.findName(),
    })
    .expect(400));

  it('should fail sign in because of wrong credentials', () => request(app)
    .post('/users/login')
    .send({ email: faker.name.firstName().concat('@dell.com'), password: '123123' })
    .expect(401));

  it('should fail sign in because of missing fields', () => request(app)
    .post('/users/login')
    .send({ email })
    .expect(400));

  it('should sign in', () => request(app)
    .post('/users/login')
    .send({ email, password })
    .expect(200)
    .then((res) => { token = res.body.data.token; }));

  it('should fail retrieving the current logged in user info because of missing authorization header', () => request(app)
    .get('/users/user')
    .expect(401));

  it('should retrieve the current logged in user info', () => request(app)
    .get('/users/user')
    .set({ Authorization: `Bearer ${token}`, Accept: 'application/json' })
    .expect(200));

  it('should fail to request to reset his/her password because of missing credentials', () => request(app)
    .post('/users/forgot-password')
    .set({ Accept: 'application/json' })
    .expect(400));

  it('should fail to request to reset his/her password because of wrong email', () => request(app)
    .post('/users/forgot-password')
    .set({ Accept: 'application/json' })
    .send({ email: faker.internet.email() })
    .expect(404)
    .then(res => expect(res.body.errors[0].message).toBe('User not found')));

  it('should request to reset his/her password', () => request(app)
    .post('/users/forgot-password')
    .set({ Accept: 'application/json' })
    .send({ email })
    .expect(200)
    .then((res) => { resetPasswordToken = res.body.data; }));

  it('should fail rest password because of missing fields', () => request(app)
    .post('/users/reset-password')
    .set({ Accept: 'application/json' })
    .send({ token: resetPasswordToken })
    .expect(400));

  it('should fail rest password because of password and password confirmation mismatches', () => request(app)
    .post('/users/reset-password')
    .set({ Accept: 'application/json' })
    .send({
      newPassword: faker.internet.password(),
      verifyPassword: faker.internet.password(),
      token: resetPasswordToken
    })
    .expect(400)
    .then(res => expect(res.body.errors[0].message).toBe('Passwords do not match')));

  it('should fail rest password because of corrupted token', () => {
    password = faker.internet.password();

    return request(app)
      .post('/users/reset-password')
      .set({ Accept: 'application/json' })
      .send({ newPassword: password, verifyPassword: password, token: faker.internet.userAgent() })
      .expect(412)
      .then(res => expect(res.body.errors[0].message).toBe('Password reset token is invalid or has expired.'));
  });

  it('should reset his/her password', () => {
    password = faker.internet.password();

    return request(app)
      .post('/users/reset-password')
      .set({ Accept: 'application/json' })
      .send({ newPassword: password, verifyPassword: password, token: resetPasswordToken })
      .expect(200)
      .then(res => expect(res.body.data.message).toBe('Password reset success'));
  });

  it('should login using the new password', () => request(app)
    .post('/users/login')
    .send({ email, password })
    .expect(200)
    .then((res) => { token = res.body.data.token; }));

  it('should retrieve the deadlines', () => request(app)
    .get('/users/deadlines')
    .expect(200)
    .then(res => expect(res.body.message).toBe('OK')));
});
