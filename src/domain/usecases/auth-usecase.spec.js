const { MissingParamError } = require('../../utils/errors')
const AuthUseCase = require('./auth-usecase')

const makeTokenGenerator = () => {
  class TokenGeneratorMock {
    async generate (userId) {
      this.userId = userId
      return this.accessToken
    }
  }
  const tokenGeneratorMock = new TokenGeneratorMock()
  tokenGeneratorMock.accessToken = 1
  return tokenGeneratorMock
}

const makeTokenGeneratorWithError = () => {
  class TokenGeneratorMock {
    async generate () {
      throw new Error()
    }
  }
  return TokenGeneratorMock
}

const makeEncrypted = () => {
  class EncryptedMock {
    async compare (password, hashPassword) {
      this.password = password
      this.hashPassword = hashPassword
      return this.isValid
    }
  }
  const encryptedMock = new EncryptedMock()
  encryptedMock.isValid = true
  return encryptedMock
}

const makeEncryptedWithError = () => {
  class EncryptedMock {
    async compare () {
      throw new Error()
    }
  }
  return EncryptedMock
}

const makeLoadUserByEmailRepository = () => {
  class LoadUserByEmailRepositoryMock {
    async load (email) {
      this.email = email
      return this.user
    }
  }
  const loadUserByEmailRepositoryMock = new LoadUserByEmailRepositoryMock()
  loadUserByEmailRepositoryMock.user = {
    id: 1,
    password: 'hashed_password'
  }
  return loadUserByEmailRepositoryMock
}

const makeLoadUserByEmailRepositoryWithError = () => {
  class LoadUserByEmailRepositoryMock {
    async load () {
      throw new Error()
    }
  }
  return LoadUserByEmailRepositoryMock
}

const makeUpdatedAccessTokenRepository = () => {
  class UpdatedAccessTokenRepositoryMock {
    async update (userId, accessToken) {
      this.userId = userId
      this.accessToken = accessToken
    }
  }
  return new UpdatedAccessTokenRepositoryMock()
}

const makeSut = () => {
  const encryptedMock = makeEncrypted()
  const loadUserByEmailRepositoryMock = makeLoadUserByEmailRepository()
  const tokenGeneratorMock = makeTokenGenerator()
  const updatedAccessTokenRepositoryMock = makeUpdatedAccessTokenRepository()

  const sut = new AuthUseCase({
    loadUserByEmailRepository: loadUserByEmailRepositoryMock,
    encrypted: encryptedMock,
    tokenGenerator: tokenGeneratorMock,
    updatedAccessTokenRepository: updatedAccessTokenRepositoryMock
  })
  return {
    sut,
    loadUserByEmailRepositoryMock,
    encryptedMock,
    tokenGeneratorMock,
    updatedAccessTokenRepositoryMock
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

  test('should return null if an invalid email is provided', async () => {
    const { sut, loadUserByEmailRepositoryMock } = makeSut()
    loadUserByEmailRepositoryMock.user = null

    const accessToken = await sut.auth('invalid_email@gmail.com', 'any_password')
    expect(accessToken).toBe(null)
  })

  test('should return null if an invalid password is provided', async () => {
    const { sut, encryptedMock } = makeSut()
    encryptedMock.isValid = false

    const accessToken = await sut.auth('valid_email@gmail.com', 'invalid_password')
    expect(accessToken).toBe(null)
  })

  test('should call encrypted with correct values', async () => {
    const { sut, loadUserByEmailRepositoryMock, encryptedMock } = makeSut()

    await sut.auth('valid_email@gmail.com', 'any_password')
    expect(encryptedMock.password).toBe('any_password')
    expect(encryptedMock.hashPassword).toBe(loadUserByEmailRepositoryMock.user.password)
  })

  test('should call token generator with correct user id', async () => {
    const { sut, loadUserByEmailRepositoryMock, tokenGeneratorMock } = makeSut()

    await sut.auth('valid_email@gmail.com', 'valid_password')
    expect(tokenGeneratorMock.userId).toBe(loadUserByEmailRepositoryMock.user.id)
  })

  test('should return an accessToken if correct credentials is provided', async () => {
    const { sut, tokenGeneratorMock } = makeSut()

    const accessToken = await sut.auth('valid_email@gmail.com', 'valid_password')
    expect(accessToken).toBe(tokenGeneratorMock.accessToken)
    expect(accessToken).toBeTruthy()
  })

  test('should call UpdatedAccessTokenRepository with correct values', async () => {
    const {
      sut,
      loadUserByEmailRepositoryMock,
      updatedAccessTokenRepositoryMock,
      tokenGeneratorMock
    } = makeSut()

    await sut.auth('valid_email@gmail.com', 'valid_password')
    expect(updatedAccessTokenRepositoryMock.userId).toBe(loadUserByEmailRepositoryMock.user.id)
    expect(updatedAccessTokenRepositoryMock.accessToken).toBe(tokenGeneratorMock.accessToken)
  })

  test('should throw if invalid dependencies are provided', async () => {
    const invalid = {}
    const loadUserByEmailRepository = makeLoadUserByEmailRepository()
    const encrypted = makeEncrypted()

    const suts = [].concat(
      new AuthUseCase(),
      new AuthUseCase({
        loadUserByEmailRepository: null
      }),
      new AuthUseCase({
        loadUserByEmailRepository: invalid
      }),
      new AuthUseCase({
        loadUserByEmailRepository,
        encrypted: null
      }),
      new AuthUseCase({
        loadUserByEmailRepository,
        encrypted: invalid
      }),
      new AuthUseCase({
        loadUserByEmailRepository,
        encrypted,
        tokenGenerator: null
      }),
      new AuthUseCase({
        loadUserByEmailRepository,
        encrypted,
        tokenGenerator: invalid
      })
    )
    for (const sut of suts) {
      const promise = sut.auth('any_email@gmail.com', 'any_password')
      expect(promise).rejects.toThrow()
    }
  })

  test('should throw if dependency throws', async () => {
    const loadUserByEmailRepository = makeLoadUserByEmailRepository()
    const encrypted = makeEncrypted()

    const suts = [].concat(
      new AuthUseCase({
        loadUserByEmailRepository: makeLoadUserByEmailRepositoryWithError()
      }),
      new AuthUseCase({
        loadUserByEmailRepository,
        encrypted: makeEncryptedWithError()
      }),
      new AuthUseCase({
        loadUserByEmailRepository,
        encrypted,
        tokenGenerator: makeTokenGeneratorWithError()
      })
    )
    for (const sut of suts) {
      const promise = sut.auth('any_email@gmail.com', 'any_password')
      expect(promise).rejects.toThrow()
    }
  })
})
