const request = require('supertest');
const express = require('express');
const Profiles = require('../../api/customer/customerModel');
const profileRouter = require('../../api/customer/customerRouter');
const server = express();
server.use(express.json());

jest.mock('../../api/profile/profileModel');
// mock the auth middleware completely
jest.mock('../../api/middleware/authRequired', () =>
  jest.fn((req, res, next) => next())
);

describe('customers router endpoints', () => {
  beforeAll(() => {
    // This is the module/route being tested
    server.use(['/profile', '/customers'], profileRouter);
    jest.clearAllMocks();
  });

  describe('GET /customers', () => {
    it('should return 200', async () => {
      Profiles.findAll.mockResolvedValue([]);
      const res = await request(server).get('/customers');

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(0);
      expect(Profiles.findAll.mock.calls.length).toBe(1);
    });
  });

  describe('GET /customers/:id', () => {
    it('should return 200 when profile found', async () => {
      Profiles.findById.mockResolvedValue({
        id: '1',
        description: 'sadfasdfasdfasdf asdfasdfasd asdfasd asdfasdfsdf',
        name: 'Bob',
        lastname: 'Smith',
        address: '23 Martha Smith',
        zip: '234234',
        phone: '4355252345',
        email: 'bob@example.com',
        city: 'Atlanta',
        state: 'Georgia',
        country: 'USA',
        photo_url: 'somewhere.com/photo.jpg',
      });
      const res = await request(server).get('/customers/1');

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Bob');
      expect(Profiles.findById.mock.calls.length).toBe(1);
    });

    it('should return 404 when no user found', async () => {
      Profiles.findById.mockResolvedValue();
      const res = await request(server).get('/customers/1');

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('ProfileNotFound');
    });
  });

  describe('POST /profile', () => {
    it('should return 200 when profile is created', async () => {
      const profile = {
        name: 'Louie',
        lastname: 'Smith',
        email: 'louie@example.com',
        photo_url:
          'https://s3.amazonaws.com/uifaces/faces/twitter/hermanobrother/128.jpg',
      };
      Profiles.findById.mockResolvedValue(undefined);
      Profiles.create.mockResolvedValue([
        Object.assign({ id: 'd376de0577681ca93614' }, profile),
      ]);
      const res = await request(server).post('/profile').send(profile);

      expect(res.status).toBe(200);
      expect(res.body.profile.id).toBe('d376de0577681ca93614');
      expect(Profiles.create.mock.calls.length).toBe(1);
    });
  });

  describe('PUT /profile', () => {
    it('should return 200 when profile is created', async () => {
      const profile = {
        id: 'd376de0577681ca93614',
        name: 'Louie',
        lastName: 'Smith',
        email: 'louie@example.com',
        photo_url:
          'https://s3.amazonaws.com/uifaces/faces/twitter/hermanobrother/128.jpg',
      };
      Profiles.findById.mockResolvedValue(profile);
      Profiles.update.mockResolvedValue([profile]);

      const res = await request(server).put('/profile/').send(profile);
      expect(res.status).toBe(200);
      expect(res.body.profile.name).toBe('Louie');
      expect(res.body.profile.lastname).toBe('Smith');
      expect(Profiles.update.mock.calls.length).toBe(1);
    });
  });
});
