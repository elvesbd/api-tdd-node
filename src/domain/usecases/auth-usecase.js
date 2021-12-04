const { MissingParamError } = require('../../utils/errors')

module.exports = class AuthUseCase {
  constructor (loadUserByEmailRepository, encrypted) {
    this.loadUserByEmailRepository = loadUserByEmailRepository
    this.encrypted = encrypted
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
    if (!user) {
      return null
    }
    await this.encrypted.compare(password, user.password)
    return null
  }
}
