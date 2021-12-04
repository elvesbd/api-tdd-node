const { MissingParamError } = require('../../utils/errors')

module.exports = class AuthUseCase {
  constructor ({ loadUserByEmailRepository, encrypted, tokenGenerator }) {
    this.loadUserByEmailRepository = loadUserByEmailRepository
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
    /* if (!this.loadUserByEmailRepository) {
      throw new MissingParamError('loadUserByEmailRepository')
    }
    if (!this.loadUserByEmailRepository.load) {
      throw new InvalidParamError('loadUserByEmailRepository')
    } */
    const user = await this.loadUserByEmailRepository.load(email)
    const isValid = user && await this.encrypted.compare(password, user.password)

    if (isValid) {
      const accessToken = await this.tokenGenerator.generate(user.id)
      return accessToken
    }
    return null
  }
}
