import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { User } from './user.entity';
import { UsersService } from './users.service';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;

  beforeEach(async () => {
    // create a fake copy of the users service
    fakeUsersService = {
      find: () => Promise.resolve([]),
      create: (email: string, password: string) =>
        Promise.resolve({ id: 1, email, password } as User)
    }

    // create DI container
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUsersService
        }
      ],
    }).compile();

    // create auth service
    service = module.get(AuthService);
  });

  it('can create an instance of auth service', async () => {
    expect(service).toBeDefined();
  });

  it('creates a new user with a salted and hashed password', async () => {
    const user = await service.signup('asdf@asdf.com', 'asdf');

    expect(user.password).not.toEqual('asdf');
    const [salt, hash] = user.password.split('.');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it.skip('throws an error if user signs up with an email that is in use', async (done) => {
    // https://github.com/facebook/jest/issues/10529
    fakeUsersService.find = () => Promise.resolve([{ id: 1, email: 'asdf@asdf.com', password: '1' } as User]);

    try {
      await service.signup('asdf@asdf.com', 'asdf');
    } catch (err) {
      done();
    }

  });

  it.skip('throws if signin is called with an unused email', async (done) => {
    // https://github.com/facebook/jest/issues/10529
    try {
      await service.signin('asfasdfasf@asfsadf.com', 'afdasdfasfdasdf')
    } catch (err) {
      done();
    }
  });

  it.skip('throws if an invalid password is provided', async (done) => {
    // https://github.com/facebook/jest/issues/10529
    fakeUsersService.find = () => Promise.resolve([{ id: 1, email: 'asdf@asdf.com', password: '1' } as User]);

    try {
      await service.signin('afasfdasdfs@afsafds.com', 'password');
    } catch (err) {
      done();
    }

  })

  it('returns a user if correct password is provided', async () => {
    fakeUsersService.find = () => Promise.resolve([{ id: 1, email: 'asdf@asdf.com', password: '141356c290047c4b.55b248331b7086ca7a671654065d746a1bd9869463969315165c3bff4f263171' } as User]);

    const user = await service.signin('asdf@asdf.com', 'mypassword');
    expect(user).toBeDefined();
  });

});
