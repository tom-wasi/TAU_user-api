import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../prisma/prisma.service';
import { faker } from '@faker-js/faker';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get<PrismaService>(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /users', () => {
    it('should return an array of users', async () => {
      const response = await request(app.getHttpServer()).get('/users');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /users/:id', () => {
    it('should return a user for a valid id', async () => {
      const user = await prisma.user.create({
        data: {
          name: faker.person.fullName(),
          email: faker.internet.email(),
        },
      });

      const response = await request(app.getHttpServer()).get(
        `/users/${user.id}`,
      );
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', user.id);
      expect(response.body).toHaveProperty('name', user.name);
      expect(response.body).toHaveProperty('email', user.email);
    });

    it('should return 404 for an invalid id', async () => {
      const response = await request(app.getHttpServer()).get(
        `/users/${faker.string.uuid()}`,
      );
      expect(response.status).toBe(404);
    });
  });

  describe('POST /users', () => {
    it('should create a new user', async () => {
      const newUser = {
        name: faker.person.fullName(),
        email: faker.internet.email(),
      };

      const response = await request(app.getHttpServer())
        .post('/users')
        .send(newUser);
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name', newUser.name);
      expect(response.body).toHaveProperty('email', newUser.email);
    });

    it('should return 400 for incomplete data', async () => {
      const newUser = { name: faker.person.fullName() };

      const response = await request(app.getHttpServer())
        .post('/users')
        .send(newUser);
      expect(response.status).toBe(400);
    });
  });

  describe('PUT /users/:id', () => {
    it('should update a user', async () => {
      const user = await prisma.user.create({
        data: {
          name: faker.person.fullName(),
          email: faker.internet.email(),
        },
      });

      const updatedUser = {
        name: faker.person.fullName(),
        email: faker.internet.email(),
      };

      const response = await request(app.getHttpServer())
        .put(`/users/${user.id}`)
        .send(updatedUser);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', user.id);
      expect(response.body).toHaveProperty('name', updatedUser.name);
      expect(response.body).toHaveProperty('email', updatedUser.email);
    });

    it('should return 404 for an invalid id', async () => {
      const updatedUser = {
        name: faker.person.fullName(),
        email: faker.internet.email(),
      };

      const response = await request(app.getHttpServer())
        .put(`/users/${faker.string.uuid()}`)
        .send(updatedUser);
      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /users/:id', () => {
    it('should delete a user', async () => {
      const user = await prisma.user.create({
        data: {
          name: faker.person.fullName(),
          email: faker.internet.email(),
        },
      });

      const response = await request(app.getHttpServer()).delete(
        `/users/${user.id}`,
      );
      expect(response.status).toBe(200);

      const fetchResponse = await request(app.getHttpServer()).get(
        `/users/${user.id}`,
      );
      expect(fetchResponse.status).toBe(404);
    });

    it('should return 404 for an invalid id', async () => {
      const response = await request(app.getHttpServer()).delete(
        `/users/${faker.string.uuid()}`,
      );
      expect(response.status).toBe(404);
    });
  });
});
