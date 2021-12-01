const { MissingParamError } = require('../../utils/errors')

class AuthUseCase {
  constructor (loadUserByEmailRepository) {
    this.loadUserByEmailRepository = loadUserByEmailRepository
  }

  async auth (email, password) {
    if (!email) {
      throw new MissingParamError('email')
    }
    if (!password) {
      throw new MissingParamError('password')
    }
    await this.loadUserByEmailRepository.load(email)
  }
}

describe('Auth UseCase', () => {
  test('should throw if no email is provided', async () => {
    const sut = new AuthUseCase()
    const promise = sut.auth()
    expect(promise).rejects.toThrow(new MissingParamError('email'))
  })

  test('should throw if no password is provided', async () => {
    const sut = new AuthUseCase()
    const promise = sut.auth('any_email@gmail.com')
    expect(promise).rejects.toThrow(new MissingParamError('password'))
  })

  test('should call LoadUserByEmailRepository with correct email', async () => {
    class LoadUserByEmailRepositoryMock {
      async load (email) {
        this.email = email
      }
    }
    const loadUserByEmailRepository = new LoadUserByEmailRepositoryMock()
    const sut = new AuthUseCase(loadUserByEmailRepository)
    await sut.auth('any_email@gmail.com', 'any_password')
    expect(loadUserByEmailRepository.email).toBe('any_email@gmail.com')
  })
})
