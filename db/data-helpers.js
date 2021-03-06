require('dotenv').config();

const { MongoMemoryServer } = require('mongodb-memory-server');
const mongod = new MongoMemoryServer();
const mongoose = require('mongoose');
const connect = require('../lib/utils/connect');
const seed = require('./seed');

const request = require('supertest');
const app = require('../lib/app');
const User = require('../lib/models/User');

const agent = request.agent(app);

beforeAll(async() => {
  const uri = await mongod.getUri();
  return connect(uri);
});

beforeEach(() => {
  return mongoose.connection.dropDatabase();
});

beforeEach(() => {
  return seed();
});

beforeEach(() => {
  return agent
    .post('/api/v1/auth/login')
    .send({
      username: 'test0',
      password: 'password'
    });
});

afterAll(async() => {
  await mongoose.connection.close();
  return mongod.stop();
});

const prepareOne = model => JSON.parse(JSON.stringify(model));
const prepareMany = models => models.map(prepareOne);

const prepare = model => {
  if(Array.isArray(model)) return prepareMany(model);
  return prepareOne(model);
};

const getLoggedInUser = () => User.findOne({ username: 'test0' });

module.exports = {
  agent,
  prepare,
  getLoggedInUser
};
