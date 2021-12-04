const { MissingParamError } = require('../../utils/errors')
const AuthUseCase = require('./auth-usecase')

const makeSut = () => {
  class EncryptedMock {
    async compare (password, hashPassword) {
      this.password = password
      this.hashPassword = hashPassword
    }
  }
  const encryptedMock = new EncryptedMock()

  class LoadUserByEmailRepositoryMock {
    async load (email) {
      this.email = email
      return this.user
    }
  }
  const loadUserByEmailRepositoryMock = new LoadUserByEmailRepositoryMock()
  loadUserByEmailRepositoryMock.user = {
    password: 'hashed_password'
  }
  const sut = new AuthUseCase(loadUserByEmailRepositoryMock, encryptedMock)
  return {
    sut,
    loadUserByEmailRepositoryMock,
    encryptedMock
  }
}

describe('Auth UseCase', () => {
  test('should throw if no email is provided', async () => {
    const { sut } = makeSut()
    const promise = sut.auth()
    expect(promise).rejects.toThrow(new MissingParamError('email'))
  })

  test('should throw if no password is provided', async () => {
    const { sut } = makeSut()
    const promise = sut.auth('any_email@gmail.com')
    expect(promise).rejects.toThrow(new MissingParamError('password'))
  })

  test('should call LoadUserByEmailRepository with correct email', async () => {
    const { sut, loadUserByEmailRepositoryMock } = makeSut()
    await sut.auth('any_email@gmail.com', 'any_password')
    expect(loadUserByEmailRepositoryMock.email).toBe('any_email@gmail.com')
  })

  test('should throw LoadUserByEmailRepository is provided', async () => {
    const sut = new AuthUseCase()
    const promise = sut.auth('any_email@gmail.com', 'any_password')
    expect(promise).rejects.toThrow()
  })

  test('should throw LoadUserByEmailRepository has no load method', async () => {
    const sut = new AuthUseCase({})
    const promise = sut.auth('any_email@gmail.com', 'any_password')
    expect(promise).rejects.toThrow()
  })

  test('should return null if an invalid email is provided', async () => {
    const { sut, loadUserByEmailRepositoryMock } = makeSut()
    loadUserByEmailRepositoryMock.user = null
    const accessToken = await sut.auth('invalid_email@gmail.com', 'any_password')
    expect(accessToken).toBe(null)
  })

  test('should return null if an invalid password is provided', async () => {
    const { sut } = makeSut()
    const accessToken = await sut.auth('valid_email@gmail.com', 'invalid_password')
    expect(accessToken).toBe(null)
  })

  test('should call encrypted with correct values', async () => {
    const { sut, loadUserByEmailRepositoryMock, encryptedMock } = makeSut()
    await sut.auth('valid_email@gmail.com', 'any_password')
    expect(encryptedMock.password).toBe('any_password')
    expect(encryptedMock.hashPassword).toBe(loadUserByEmailRepositoryMock.user.password)
  })
})
