const { MissingParamError } = require('../../utils/errors')

module.exports = class AuthUseCase {
  constructor ({
    loadUserByEmailRepository,
    updatedAccessTokenRepository,
    encrypted, tokenGenerator
  } = {}) {
    this.loadUserByEmailRepository = loadUserByEmailRepository
    this.updatedAccessTokenRepository = updatedAccessTokenRepository
    this.encrypted = encrypted
    this.tokenGenerator = tokenGenerator
  }

  async auth (email, password) {
    if (!email) {
      throw new MissingParamError('email')
    }
    if (!password) {
      throw new MissingParamError('password')
    }
    const user = await this.loadUserByEmailRepository.load(email)
    const isValid = user && await this.encrypted.compare(password, user.password)

    if (user && isValid) {
      const accessToken = await this.tokenGenerator.generate(user.id)
      await this.updatedAccessTokenRepository.update(user.id, accessToken)
      return accessToken
    }
    return null
  }
}
