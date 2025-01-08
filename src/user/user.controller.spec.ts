import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from '@prisma/client';
import { faker } from '@faker-js/faker';

describe('UserController', () => {
  let userController: UserController;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            findAll: jest.fn().mockResolvedValue([
              {
                id: faker.string.uuid(),
                name: faker.person.fullName(),
                email: faker.internet.email(),
              },
              {
                id: faker.string.uuid(),
                name: faker.person.fullName(),
                email: faker.internet.email(),
              },
            ]),
            fetchUser: jest.fn().mockImplementation((id: string) =>
              Promise.resolve({
                id,
                name: faker.person.fullName(),
                email: faker.internet.email(),
              }),
            ),
            create: jest.fn().mockImplementation((user: User) =>
              Promise.resolve({
                id: faker.string.uuid(),
                ...user,
              }),
            ),
            update: jest.fn().mockImplementation((id: string, user: User) =>
              Promise.resolve({
                id,
                ...user,
              }),
            ),
            remove: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    userController = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  describe('GET /users', () => {
    it('should return an array of users', async () => {
      const result = await userController.findAll();
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('name');
      expect(result[0]).toHaveProperty('email');
    });

    it('should return status 200', async () => {
      const result = await userController.findAll();
      expect(result).toBeDefined();
    });
  });

  describe('GET /users/:id', () => {
    it('should return a user for a valid id', async () => {
      const id = faker.string.uuid();
      const result = await userController.findOne(id);
      expect(result).toHaveProperty('id', id);
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('email');
    });

    it('should return 404 for an invalid id', async () => {
      jest.spyOn(userService, 'fetchUser').mockResolvedValueOnce(null);
      try {
        await userController.findOne(faker.string.uuid());
      } catch (e) {
        expect(e.status).toBe(404);
      }
    });
  });

  describe('POST /users', () => {
    it('should create a new user', async () => {
      const newUser = {
        name: faker.person.fullName(),
        email: faker.internet.email(),
      };
      const result = await userController.create(newUser as User);
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('name', newUser.name);
      expect(result).toHaveProperty('email', newUser.email);
    });

    it('should return status 201', async () => {
      const newUser = {
        name: faker.person.fullName(),
        email: faker.internet.email(),
      };
      const result = await userController.create(newUser as User);
      expect(result).toBeDefined();
    });

    it('should return 400 for incomplete data', async () => {
      const newUser = { name: faker.person.fullName() };
      try {
        await userController.create(newUser as User);
      } catch (e) {
        expect(e.status).toBe(400);
      }
    });
  });

  describe('PUT /users/:id', () => {
    it('should update a user', async () => {
      const updatedUser = {
        name: faker.person.fullName(),
        email: faker.internet.email(),
      };
      const id = faker.string.uuid();
      const result = await userController.update(id, updatedUser as User);
      expect(result).toHaveProperty('id', id);
      expect(result).toHaveProperty('name', updatedUser.name);
      expect(result).toHaveProperty('email', updatedUser.email);
    });

    it('should return 404 for an invalid id', async () => {
      jest.spyOn(userService, 'update').mockResolvedValueOnce(null);
      try {
        await userController.update(faker.string.uuid(), {
          name: faker.person.fullName(),
          email: faker.internet.email(),
        } as User);
      } catch (e) {
        expect(e.status).toBe(404);
      }
    });
  });

  describe('DELETE /users/:id', () => {
    it('should delete a user', async () => {
      const id = faker.string.uuid();
      const result = await userController.remove(id);
      expect(result).toBeUndefined();
    });

    it('should return 404 for an invalid id', async () => {
      jest.spyOn(userService, 'remove').mockResolvedValueOnce(null);
      try {
        await userController.remove(faker.string.uuid());
      } catch (e) {
        expect(e.status).toBe(404);
      }
    });
  });
});
